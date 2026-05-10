/**
 * preDoctr MCQ Importer v3 — Line-based SQL parser
 * Reads public/freemdcat_wp323.sql directly (no PHP export needed).
 * Usage: node server/scripts/import_mcqs.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fs = require('fs');
const { Client } = require('pg');

const SQL_FILE = path.join(__dirname, '../../public/freemdcat_wp323.sql');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms'
});

// ── Strip HTML & clean text ───────────────────────────────────────────────────
function clean(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g,   '<').replace(/&gt;/g,  '>')
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

// ── Parse a single SQL row string into an array of values ─────────────────────
// e.g. "1, 'hello; world', NULL, 2" → [1, 'hello; world', null, 2]
function parseRow(str) {
  const values = [];
  let i = 0;
  const len = str.length;

  while (i < len) {
    // skip leading whitespace and commas
    while (i < len && (str[i] === ',' || str[i] === ' ' || str[i] === '\t')) i++;
    if (i >= len) break;

    if (str[i] === "'") {
      // quoted string
      i++;
      let val = '';
      while (i < len) {
        if (str[i] === '\\' && i + 1 < len) { val += str[i + 1]; i += 2; }
        else if (str[i] === "'" && str[i + 1] === "'") { val += "'"; i += 2; }
        else if (str[i] === "'") { i++; break; }
        else { val += str[i++]; }
      }
      values.push(val);
    } else if (str.slice(i, i + 4).toUpperCase() === 'NULL') {
      values.push(null); i += 4;
    } else {
      // number / bare token — read until comma
      let val = '';
      while (i < len && str[i] !== ',') val += str[i++];
      const n = Number(val.trim());
      values.push(isNaN(n) ? val.trim() : n);
    }
  }
  return values;
}

// ── Line-based INSERT extractor ───────────────────────────────────────────────
// KEY FIX: tracks line-by-line instead of using [^;]+ regex,
// so semicolons inside string values never break the parse.
function extractTable(lines, tableName) {
  const rows = [];
  let columns = null;
  let inBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].replace(/\r$/, ''); // strip \r

    // Start of an INSERT block for our table?
    if (raw.startsWith(`INSERT INTO \`${tableName}\``)) {
      const cm = raw.match(/\((`[^)]+`)\)\s*VALUES/);
      if (!cm) continue;
      columns = cm[1].split(',').map(c => c.replace(/`/g, '').trim());
      inBlock = true;
      continue;
    }

    if (!inBlock || !columns) continue;

    const trimmed = raw.trim();

    // Empty line or comment = end of block
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) {
      if (!trimmed) inBlock = false;
      continue;
    }

    // Data row must start with (
    if (!trimmed.startsWith('(')) { inBlock = false; continue; }

    const isLast = trimmed.endsWith(');');

    // Strip trailing , or ; then strip outer parens
    const inner = trimmed.replace(/[,;]\s*$/, '').slice(1, -1);
    const vals  = parseRow(inner);

    if (vals.length === columns.length) {
      const obj = {};
      columns.forEach((col, idx) => { obj[col] = vals[idx]; });
      rows.push(obj);
    }

    if (isLast) inBlock = false;
  }

  return rows;
}

// ── Subject mapper ────────────────────────────────────────────────────────────
function mapSubject(name = '') {
  const n = name.toLowerCase();
  if (/bio|cell|genet|eco|acellular|enzyme|kingdom|evolut|repro|nutri|gaseous|prokary|support.?move|homeosta|coordinat|fungi|animalia|plantae|transport/.test(n))
    return 'Biology';
  if (/chem|periodic|organic|react|bond|acid|solution|electroche|hydrocarb|alkyl|enth|transition|gases\b/.test(n))
    return 'Chemistry';
  if (/phys|motion|wave|electric|magneti|optic|nuclear|thermo|electron|alternating|solid\b|force\b/.test(n))
    return 'Physics';
  if (/english|grammar|vocab|comprehension|sentence/.test(n))
    return 'English';
  if (/logic|reason|analogy|sequence|pattern|cause.{0,5}effect|course.of.action|letter.{0,5}symbol|symbol.{0,5}series|letter.{0,5}series|deduct|syllogism|odd.one|blood.relat|coding.decod|direction|ranking|sitting.arrang|number.series|figure.classif|mirror.image|venn.diagram|puzzle|cubes/.test(n))
    return 'Logical Reasoning';
  return 'Uncategorized';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await client.connect();
  console.log('✓ Connected to PostgreSQL');

  // Ensure table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS mcqs (
      id SERIAL PRIMARY KEY, wp_id INT UNIQUE, wp_category_id INT,
      subject TEXT NOT NULL DEFAULT '', chapter TEXT NOT NULL DEFAULT '',
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL DEFAULT '', option_b TEXT NOT NULL DEFAULT '',
      option_c TEXT NOT NULL DEFAULT '', option_d TEXT NOT NULL DEFAULT '',
      correct_opt CHAR(1) NOT NULL DEFAULT 'a', explanation TEXT,
      is_active BOOLEAN DEFAULT TRUE, flag_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_mcqs_subject ON mcqs(subject);
    CREATE INDEX IF NOT EXISTS idx_mcqs_chapter ON mcqs(chapter);
    CREATE INDEX IF NOT EXISTS idx_mcqs_wp_id   ON mcqs(wp_id);
  `);

  console.log('📖 Reading SQL file...');
  const sql   = fs.readFileSync(SQL_FILE, 'utf8');
  const lines = sql.split('\n');
  console.log(`   Lines: ${lines.length.toLocaleString()}`);

  // ── Categories ────────────────────────────────────────
  console.log('\n📂 Parsing categories...');
  const catRows = extractTable(lines, 'wpcc_aysquiz_categories');
  const catMap  = {};
  for (const c of catRows) {
    const title = c.title || c.name || '';
    catMap[c.id] = { subject: mapSubject(title), chapter: title || 'General' };
  }
  console.log(`   Found ${catRows.length} categories`);

  // ── Questions ─────────────────────────────────────────
  console.log('\n❓ Parsing questions...');
  const qRows = extractTable(lines, 'wpcc_aysquiz_questions');
  const validQ = qRows.filter(q =>
    (q.type === 'radio' || q.type === 'multiple_choice') &&
    q.published >= 1 &&
    q.question && clean(q.question).length > 5
  );
  console.log(`   Total: ${qRows.length.toLocaleString()} | Valid MCQs: ${validQ.length.toLocaleString()}`);

  // ── Answers ───────────────────────────────────────────
  console.log('\n💬 Parsing answers...');
  const aRows = extractTable(lines, 'wpcc_aysquiz_answers');
  const aMap  = {};
  for (const a of aRows) {
    const qid = a.question_id;
    if (!aMap[qid]) aMap[qid] = [];
    aMap[qid].push(a);
  }
  for (const qid in aMap) aMap[qid].sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
  console.log(`   Found ${aRows.length.toLocaleString()} answer options`);

  // ── Build records ─────────────────────────────────────
  console.log('\n🔨 Building MCQ records...');
  const toInsert = [];
  let skipped = 0;

  for (const q of validQ) {
    const answers = (aMap[q.id] || []).slice(0, 4);
    while (answers.length < 4) answers.push({ answer: '-', correct: 0 });
    const ci = answers.findIndex(a => Number(a.correct) === 1);
    if (ci === -1) { skipped++; continue; }

    const cat = catMap[q.category_id] || { subject: 'Uncategorized', chapter: 'General' };
    toInsert.push({
      wp_id:    q.id,  wp_cat: q.category_id,
      subject:  cat.subject, chapter: cat.chapter,
      q:        clean(q.question),
      a:        clean(answers[0]?.answer || ''),
      b:        clean(answers[1]?.answer || ''),
      c:        clean(answers[2]?.answer || ''),
      d:        clean(answers[3]?.answer || ''),
      correct:  ['a','b','c','d'][ci],
      explain:  clean(q.explanation || q.right_answer_text || ''),
    });
  }
  console.log(`   Ready: ${toInsert.length.toLocaleString()} | Skipped: ${skipped}`);

  // ── Insert in batches ─────────────────────────────────
  console.log('\n🗄️  Inserting into PostgreSQL...');
  const CHUNK = 300;
  let inserted = 0, dupes = 0;

  for (let i = 0; i < toInsert.length; i += CHUNK) {
    const batch = toInsert.slice(i, i + CHUNK);
    const vals = []; const params = []; let p = 1;
    for (const m of batch) {
      vals.push(`($${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++},$${p++})`);
      params.push(m.wp_id, m.wp_cat, m.subject, m.chapter, m.q,
                  m.a, m.b, m.c, m.d, m.correct, m.explain);
    }
    try {
      const res = await client.query(
        `INSERT INTO mcqs (wp_id,wp_category_id,subject,chapter,question_text,
           option_a,option_b,option_c,option_d,correct_opt,explanation)
         VALUES ${vals.join(',')} ON CONFLICT (wp_id) DO NOTHING`,
        params
      );
      inserted += res.rowCount;
      dupes    += batch.length - res.rowCount;
    } catch (err) { console.error(`\n  Batch error at ${i}:`, err.message); }
    process.stdout.write(`\r   Progress: ${Math.min(i+CHUNK, toInsert.length).toLocaleString()} / ${toInsert.length.toLocaleString()}`);
  }

  // ── Keyword re-categorise leftover Uncategorized ──────
  await client.query(`
    UPDATE mcqs SET subject='Biology' WHERE subject='Uncategorized' AND (
      chapter ILIKE '%prokaryote%' OR chapter ILIKE '%life process%' OR
      chapter ILIKE '%support%movement%' OR chapter ILIKE '%nutrition%' OR
      chapter ILIKE '%gaseous%' OR chapter ILIKE '%carnivorous%' OR
      chapter ILIKE '%biodiversity%' OR chapter ILIKE '%acellular%' OR
      chapter ILIKE '%fungi%' OR chapter ILIKE '%genetic%' OR
      chapter ILIKE '%evolution%' OR chapter ILIKE '%bioenergetics%' OR
      chapter ILIKE '%enzyme%' OR chapter ILIKE '%cell%' OR
      chapter ILIKE '%reproduction%' OR chapter ILIKE '%homeostasis%' OR
      chapter ILIKE '%coordination%' OR chapter ILIKE '%transport%');
    UPDATE mcqs SET subject='Physics' WHERE subject='Uncategorized' AND (
      chapter ILIKE '%electron%' OR chapter ILIKE '%electrostatic%' OR
      chapter ILIKE '%alternating current%' OR chapter ILIKE '%nuclear%' OR
      chapter ILIKE '%wave%' OR chapter ILIKE '%optic%' OR chapter ILIKE '%motion%' OR
      chapter ILIKE '%thermodynamic%' OR chapter ILIKE '%magnetism%');
    UPDATE mcqs SET subject='Logical Reasoning' WHERE subject='Uncategorized' AND (
      chapter ILIKE '%cause%effect%' OR chapter ILIKE '%course of action%' OR
      chapter ILIKE '%letter%symbol%' OR chapter ILIKE '%symbol%series%' OR
      chapter ILIKE '%letter%series%' OR chapter ILIKE '%logical%' OR
      chapter ILIKE '%deduct%' OR chapter ILIKE '%syllogism%' OR
      chapter ILIKE '%analogy%' OR chapter ILIKE '%odd one%' OR
      chapter ILIKE '%blood relat%' OR chapter ILIKE '%coding%decod%' OR
      chapter ILIKE '%direction%sense%' OR chapter ILIKE '%ranking%' OR
      chapter ILIKE '%number series%' OR chapter ILIKE '%figure classif%' OR
      chapter ILIKE '%mirror image%' OR chapter ILIKE '%venn diagram%' OR
      chapter ILIKE '%sitting arrang%' OR chapter ILIKE '%puzzle%' OR
      chapter ILIKE '%reasoning%'
    );
    UPDATE mcqs SET subject='Chemistry' WHERE subject='Uncategorized' AND (
      chapter ILIKE '%transition%' OR chapter ILIKE '%organic%' OR
      chapter ILIKE '%periodic%' OR chapter ILIKE '%bond%' OR
      chapter ILIKE '%acid%' OR chapter ILIKE '%solution%' OR
      chapter ILIKE '%electrochemist%' OR chapter ILIKE '%hydrocarbon%' OR
      chapter ILIKE '%enthalpy%' OR chapter ILIKE '%gases%');
  `);

  // ── Summary ───────────────────────────────────────────
  const stats = await client.query(
    `SELECT subject, COUNT(*)::int AS n FROM mcqs GROUP BY subject ORDER BY n DESC`
  );
  console.log('\n\n✅ Done!\n');
  console.log(`   Inserted:   ${inserted.toLocaleString()}`);
  console.log(`   Duplicates: ${dupes.toLocaleString()}`);
  console.log(`   Skipped:    ${skipped.toLocaleString()}`);
  console.log('\n📊 By subject:');
  for (const r of stats.rows) console.log(`   ${r.subject.padEnd(22)} ${r.n.toLocaleString()}`);

  await client.end();
}

main().catch(async err => {
  console.error('\n❌ Failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
