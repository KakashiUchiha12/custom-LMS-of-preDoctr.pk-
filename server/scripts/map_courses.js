/**
 * Streaming course map — memory-efficient version.
 * Only keeps relevant post_types and specific meta_keys.
 */

const fs       = require('fs');
const path     = require('path');
const readline = require('readline');

const SQL_FILE = path.join(__dirname, '../../public/fulldatabasefreemdcat_wp323.sql');

// Only keep these post types
const KEEP_TYPES = new Set(['courses','topics','lesson','tutor_quiz']);

// Only keep these meta keys (everything else discarded to save RAM)
const KEEP_META  = new Set(['_price','_regular_price','_sale_price','_tutor_course_product_id','course_price_type']);

function decode(s) {
  if (!s) return '';
  return s
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#(\d+);/g,(_,c)=>String.fromCharCode(+c))
    .replace(/&#8211;/g,'–').replace(/&#8220;/g,'"').replace(/&#8221;/g,'"')
    .replace(/&#8216;/g,"'").replace(/&#8217;/g,"'");
}

function parseRow(str) {
  const values = [];
  let i = 0;
  while (i < str.length) {
    while (i < str.length && (str[i]===',' || str[i]===' ' || str[i]==='\t')) i++;
    if (i >= str.length) break;
    if (str[i] === "'") {
      i++;
      let val = '';
      while (i < str.length) {
        if (str[i]==='\\' && i+1<str.length) { val+=str[i+1]; i+=2; }
        else if (str[i]==="'" && str[i+1]==="'") { val+="'"; i+=2; }
        else if (str[i]==="'") { i++; break; }
        else { val+=str[i++]; }
      }
      values.push(val);
    } else if (str.slice(i,i+4).toUpperCase()==='NULL') {
      values.push(null); i+=4;
    } else {
      let val='';
      while (i<str.length && str[i]!==',') val+=str[i++];
      const n=Number(val.trim());
      values.push(isNaN(n)?val.trim():n);
    }
  }
  return values;
}

// ── Streaming extract — ONE PASS, two tables ──────────────────────────────────
async function streamExtract() {
  const posts   = [];   // only KEEP_TYPES
  const priceMap= {};   // post_id → { _price, _regular_price, ... }

  let currentTable = null;
  let currentCols  = null;
  let linesRead    = 0;
  let postsKept    = 0;
  let metaKept     = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(SQL_FILE, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const raw of rl) {
    linesRead++;
    if (linesRead % 100000 === 0)
      process.stdout.write(`\r   Lines: ${linesRead.toLocaleString()}  Posts: ${postsKept}  Meta: ${metaKept}   `);

    const line = raw.replace(/\r$/,'');

    // Detect start of a target INSERT block
    if (line.startsWith("INSERT INTO `wpcc_posts`")) {
      const cm = line.match(/\((`[^)]+`)\)\s*VALUES/);
      if (cm) { currentTable='posts'; currentCols=cm[1].split(',').map(c=>c.replace(/`/g,'').trim()); }
      continue;
    }
    if (line.startsWith("INSERT INTO `wpcc_postmeta`")) {
      const cm = line.match(/\((`[^)]+`)\)\s*VALUES/);
      if (cm) { currentTable='postmeta'; currentCols=cm[1].split(',').map(c=>c.replace(/`/g,'').trim()); }
      continue;
    }

    if (!currentTable || !currentCols) continue;

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) { if (!trimmed) currentTable=null; continue; }
    if (!trimmed.startsWith('(')) { currentTable=null; continue; }

    const isLast = trimmed.endsWith(');');
    const inner  = trimmed.replace(/[,;]\s*$/,'').slice(1,-1);
    const vals   = parseRow(inner);

    if (vals.length === currentCols.length) {
      const obj = {};
      currentCols.forEach((col,idx)=>{ obj[col]=vals[idx]; });

      if (currentTable === 'posts') {
        if (KEEP_TYPES.has(obj.post_type)) {
          // Only keep fields we need
          posts.push({
            ID:           obj.ID,
            post_title:   obj.post_title,
            post_type:    obj.post_type,
            post_status:  obj.post_status,
            post_parent:  obj.post_parent,
            menu_order:   obj.menu_order,
            post_date:    obj.post_date,
          });
          postsKept++;
        }
      } else if (currentTable === 'postmeta') {
        if (KEEP_META.has(obj.meta_key) && obj.meta_value) {
          const pid = obj.post_id;
          if (!priceMap[pid]) priceMap[pid] = {};
          if (!(obj.meta_key in priceMap[pid])) priceMap[pid][obj.meta_key] = obj.meta_value;
          metaKept++;
        }
      }
    }

    if (isLast) currentTable = null;
  }

  process.stdout.write('\n');
  return { posts, priceMap };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📖 Streaming SQL file (244MB) — filtering in-flight...');
  const { posts, priceMap } = await streamExtract();

  console.log(`\n✓ Relevant posts: ${posts.length.toLocaleString()}`);
  console.log(`✓ Price meta:     ${Object.keys(priceMap).length}\n`);

  // Organise by type
  const byType = {};
  const byId   = {};
  for (const p of posts) {
    if (!byType[p.post_type]) byType[p.post_type] = [];
    byType[p.post_type].push(p);
    byId[p.ID] = p;
  }

  console.log('📊 Counts:');
  for (const [t,arr] of Object.entries(byType)) console.log(`   ${t.padEnd(20)} ${arr.length}`);

  const courses = (byType['courses']   || []).filter(p=>['publish','private','draft'].includes(p.post_status));
  const topics  = byType['topics']     || [];
  const lessons = byType['lesson']     || [];
  const quizzes = byType['tutor_quiz'] || [];

  // Build parent→children maps
  const topicsByCourse={}, lessonsByTopic={}, quizzesByTopic={};
  for (const t of topics)  { (topicsByCourse[t.post_parent]||(topicsByCourse[t.post_parent]=[])).push(t); }
  for (const l of lessons) { (lessonsByTopic[l.post_parent]||(lessonsByTopic[l.post_parent]=[])).push(l); }
  for (const q of quizzes) { (quizzesByTopic[q.post_parent]||(quizzesByTopic[q.post_parent]=[])).push(q); }

  // ── Print tree ──────────────────────────────────────────────────────────────
  const tree = [];
  let totalL = 0, totalQ = 0;

  console.log('\n' + '═'.repeat(72));
  console.log(' 🎓  preDoctr.pk — FULL COURSE MAP');
  console.log('═'.repeat(72));

  for (const course of courses.sort((a,b)=>a.ID-b.ID)) {
    const pm    = priceMap[course.ID] || {};
    const price = pm.course_price_type === 'free' ? 'FREE'
                : (pm._price || pm._regular_price || '?');
    const title = decode(course.post_title);

    console.log(`\n\n📘 [#${course.ID}] ${title}`);
    console.log(`   Status: ${course.post_status}  |  Price: PKR ${price}  |  Date: ${String(course.post_date||'').slice(0,10)}`);

    const cTopics = (topicsByCourse[course.ID]||[]).sort((a,b)=>(+a.menu_order)-(+b.menu_order));
    const cObj = { id:course.ID, title, status:course.post_status, price, topics:[] };

    if (!cTopics.length) console.log('   (no chapters found)');

    for (const topic of cTopics) {
      const tTitle = decode(topic.post_title);
      const tL = (lessonsByTopic[topic.ID]||[]).sort((a,b)=>(+a.menu_order)-(+b.menu_order));
      const tQ = (quizzesByTopic[topic.ID]||[]).sort((a,b)=>(+a.menu_order)-(+b.menu_order));

      console.log(`\n   📂 [#${topic.ID}] ${tTitle}`);

      const tObj = { id:topic.ID, title:tTitle, lessons:[], quizzes:[] };
      for (const l of tL) { const lt=decode(l.post_title); console.log(`       📺 [#${l.ID}] ${lt}`); tObj.lessons.push({id:l.ID,title:lt}); totalL++; }
      for (const q of tQ) { const qt=decode(q.post_title); console.log(`       🧪 [#${q.ID}] ${qt}`); tObj.quizzes.push({id:q.ID,title:qt}); totalQ++; }
      if (!tL.length && !tQ.length) console.log('          (no lessons/tests)');

      cObj.topics.push(tObj);
    }
    tree.push(cObj);
  }

  console.log('\n\n' + '═'.repeat(72));
  console.log(' 📊  SUMMARY');
  console.log('═'.repeat(72));
  console.log(`  Courses: ${courses.length}`);
  console.log(`  Topics:  ${topics.length}`);
  console.log(`  Lessons: ${totalL}`);
  console.log(`  Quizzes: ${totalQ}`);

  const outFile = path.join(__dirname, '../../public/course_map.json');
  fs.writeFileSync(outFile, JSON.stringify(tree, null, 2));
  console.log(`\n✅ Saved → public/course_map.json`);
}

main().catch(err=>{ console.error('\n❌',err.message, err.stack); process.exit(1); });
