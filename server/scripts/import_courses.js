/**
 * preDoctr Course Structure Importer
 * ─────────────────────────────────────────────────────────
 * Reads public/course_map.json → populates subjects, chapters, lessons
 * Then links mcqs.chapter_id via keyword matching
 *
 * Usage: node server/scripts/import_courses.js
 * Safe to re-run (ON CONFLICT DO NOTHING / DO UPDATE)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fs     = require('fs');
const { Client } = require('pg');

const COURSE_MAP = path.join(__dirname, '../../public/course_map.json');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms'
});

// ── Strip emoji & clean title for DB name field ───────────────────────────────
function stripEmoji(str) {
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/\s+/g, ' ').trim();
}

// ── Extract first emoji from title ───────────────────────────────────────────
function firstEmoji(str) {
  const m = str.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  return m ? m[0] : '';
}

// ── Slugify a string ──────────────────────────────────────────────────────────
function slug(str) {
  return stripEmoji(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Classify lesson by title ──────────────────────────────────────────────────
function classifyLesson(title) {
  const t = title.toLowerCase();

  if (/\bnotes?\b/.test(t))        return { type: 'notes',        sub: null };
  if (/shortlist/.test(t))         return { type: 'shortlisting',  sub: null };
  if (/\bocr\b/.test(t))           return { type: 'ocr',           sub: null };
  if (/etea/i.test(t))             return { type: 'past_paper',    sub: 'ETEA' };
  if (/\buhs\b/i.test(t))          return { type: 'past_paper',    sub: 'UHS' };

  // Board book provinces
  if (/balochistan/i.test(t))      return { type: 'board_book',    sub: 'Balochistan' };
  if (/\bsindh\b/i.test(t))        return { type: 'board_book',    sub: 'Sindh' };
  if (/\bkpk\b/i.test(t))          return { type: 'board_book',    sub: 'KPK' };
  if (/\bpunjab\b/i.test(t))       return { type: 'board_book',    sub: 'Punjab' };
  if (/\bfederal\b/i.test(t))      return { type: 'board_book',    sub: 'Federal' };

  // Named tests: Test A, Test B
  const namedTest = title.match(/Test\s+([A-Z])\b/);
  if (namedTest)                   return { type: 'test', sub: namedTest[1] };

  // Numbered tests: Test 1, Test 2 ...
  const numTest = title.match(/Test\s+(\d+)/i);
  if (numTest)                     return { type: 'test', sub: numTest[1] };

  // Video lectures
  if (/lecture|syllabus.intro|introduction/i.test(t))
    return { type: 'video', sub: null };

  // Fallback
  return { type: 'test', sub: null };
}

// ── Subject metadata: slug, emoji, type, order ────────────────────────────────
// wp_id → { slug, emoji, type, order }
// IDs verified from course_map.json output
const SUBJECT_META = {
  1334:  { slug: 'english-mcqs',               emoji: '📚', type: 'mcq',        order: 3 },
  1376:  { slug: 'biology-mcqs',               emoji: '🧬', type: 'mcq',        order: 0 },
  1400:  { slug: 'physics-mcqs',               emoji: '⚡', type: 'mcq',        order: 2 },  // #1400 = Physics MCQs
  9827:  { slug: 'chemistry-mcqs',             emoji: '⚗️', type: 'mcq',        order: 1 },  // #9827 = Chemistry MCQs
  10162: { slug: 'logical-reasoning-mcqs',     emoji: '🧠', type: 'mcq',        order: 4 },
  10245: { slug: 'past-papers-full-length',    emoji: '📋', type: 'pastpaper',  order: 10 }, // Past Papers
  10262: { slug: 'full-length-test-series',    emoji: '📝', type: 'testseries', order: 11 }, // Test Series
  15433: { slug: 'predoctr-test-series',       emoji: '📝', type: 'testseries', order: 12 },
  16170: { slug: 'biology-lectures',           emoji: '🧬', type: 'lecture',    order: 5 },
  16358: { slug: 'chemistry-lectures',         emoji: '⚗️', type: 'lecture',    order: 6 },
  16436: { slug: 'physics-lectures',           emoji: '⚡', type: 'lecture',    order: 7 },
  16453: { slug: 'english-lectures',           emoji: '📚', type: 'lecture',    order: 8 },
  16460: { slug: 'logical-reasoning-lectures', emoji: '🧠', type: 'lecture',    order: 9 },
};


// ── MCQ chapter keyword matching ──────────────────────────────────────────────
// For each Biology/Chemistry/Physics MCQ chapter, define keywords
// to match against mcqs.chapter (ILIKE '%keyword%')
// This runs as a SQL UPDATE after all chapters are inserted.

// subjectSlug → [ { chapterNameContains, mcqsChapterILIKE } ]
// We use the cleaned chapter name as the keyword
function buildMcqKeyword(cleanedChapterName) {
  // Extract the most specific 2–3 word phrase
  const words = cleanedChapterName
    .replace(/[()\/&]/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .split(' ')
    .filter(w => w.length > 3 && !/^(and|the|of|in|or|for|with|from|into)$/i.test(w));

  // Use first meaningful word as primary keyword (longest word >= 6 chars)
  const keyword = words.sort((a,b) => b.length - a.length)[0] || words[0] || cleanedChapterName.slice(0, 10);
  return keyword;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await client.connect();
  console.log('✓ Connected to PostgreSQL\n');

  const courseMap = JSON.parse(fs.readFileSync(COURSE_MAP, 'utf8'));
  console.log(`📂 course_map.json: ${courseMap.length} courses\n`);

  let totalSubjects  = 0;
  let totalChapters  = 0;
  let totalLessons   = 0;
  const chapterRows  = []; // for MCQ linking later: { id, subject_slug, name_clean }

  // ── 1. Insert subjects ────────────────────────────────────────────────────
  console.log('📘 Inserting subjects...');
  for (const course of courseMap) {
    const meta  = SUBJECT_META[course.id];
    if (!meta) {
      console.log(`   ⚠️  No meta for course #${course.id} "${course.title}" — skipping`);
      continue;
    }
    const name  = stripEmoji(course.title) || course.title;
    const emoji = meta.emoji || firstEmoji(course.title);

    const res = await client.query(
      `INSERT INTO subjects (wp_id, name, slug, emoji, type, order_index)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (wp_id) DO UPDATE
         SET name=$2, slug=$3, emoji=$4, type=$5, order_index=$6
       RETURNING id`,
      [course.id, name, meta.slug, emoji, meta.type, meta.order]
    );
    const subjectId = res.rows[0].id;
    totalSubjects++;

    // ── 2. Insert chapters ──────────────────────────────────────────────────
    let chapterOrder = 0;
    for (const topic of course.topics || []) {
      const cName  = stripEmoji(topic.title) || topic.title;
      const cEmoji = firstEmoji(topic.title);
      const cSlug  = `${meta.slug}--${slug(cName)}`.slice(0, 200);

      const cRes = await client.query(
        `INSERT INTO chapters (wp_id, subject_id, name, slug, emoji, order_index)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (wp_id) DO UPDATE
           SET subject_id=$2, name=$3, slug=$4, emoji=$5, order_index=$6
         RETURNING id`,
        [topic.id, subjectId, cName, cSlug, cEmoji, chapterOrder++]
      );
      const chapterId = cRes.rows[0].id;
      totalChapters++;

      // Store for MCQ linking
      chapterRows.push({ id: chapterId, subjectSlug: meta.slug, subjectType: meta.type, nameClear: cName });

      // ── 3. Insert lessons ─────────────────────────────────────────────────
      const allLessons = [...(topic.lessons || []), ...(topic.quizzes || [])];
      let lessonOrder  = 0;
      for (const lesson of allLessons) {
        const { type: lType, sub: lSub } = classifyLesson(lesson.title);
        await client.query(
          `INSERT INTO lessons (wp_id, chapter_id, subject_id, title, lesson_type, lesson_sub, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (wp_id) DO UPDATE
             SET chapter_id=$2, subject_id=$3, title=$4, lesson_type=$5, lesson_sub=$6, order_index=$7`,
          [lesson.id, chapterId, subjectId, lesson.title, lType, lSub, lessonOrder++]
        );
        totalLessons++;
      }
    }
    console.log(`   ✓ [#${course.id}] ${name} — ${(course.topics||[]).length} chapters`);
  }

  // ── 4. Link mcqs.chapter_id via keyword matching ──────────────────────────
  console.log('\n🔗 Linking MCQs to chapters...');
  let mcqsLinked = 0;

  for (const ch of chapterRows) {
    if (ch.subjectType !== 'mcq') continue; // only link MCQ courses

    const keyword = buildMcqKeyword(ch.nameClear);
    if (!keyword || keyword.length < 3) continue;

    // Map subject slug → mcqs.subject value
    const subjectName = {
      'biology-mcqs':           'Biology',
      'chemistry-mcqs':         'Chemistry',
      'physics-mcqs':           'Physics',
      'english-mcqs':           'English',
      'logical-reasoning-mcqs': 'Logical Reasoning',
    }[ch.subjectSlug];

    if (!subjectName) continue;

    const res = await client.query(
      `UPDATE mcqs
       SET chapter_id = $1
       WHERE chapter_id IS NULL
         AND subject = $2
         AND chapter ILIKE $3`,
      [ch.id, subjectName, `%${keyword}%`]
    );
    if (res.rowCount > 0) {
      mcqsLinked += res.rowCount;
    }
  }

  // ── 5. Summary ────────────────────────────────────────────────────────────
  const stats = await client.query(`
    SELECT s.name, COUNT(DISTINCT c.id)::int AS chapters, COUNT(DISTINCT l.id)::int AS lessons
    FROM subjects s
    LEFT JOIN chapters c ON c.subject_id = s.id
    LEFT JOIN lessons  l ON l.subject_id = s.id
    GROUP BY s.id, s.name, s.order_index ORDER BY s.order_index
  `);
  const mcqStats = await client.query(
    `SELECT subject, COUNT(*)::int AS total,
            SUM(CASE WHEN chapter_id IS NOT NULL THEN 1 ELSE 0 END)::int AS linked
     FROM mcqs GROUP BY subject ORDER BY total DESC`
  );

  console.log('\n✅ Done!\n');
  console.log(`   Subjects: ${totalSubjects}`);
  console.log(`   Chapters: ${totalChapters}`);
  console.log(`   Lessons:  ${totalLessons}`);
  console.log(`   MCQs linked to chapters: ${mcqsLinked}\n`);

  console.log('📊 Course tree:');
  for (const r of stats.rows)
    console.log(`   ${r.name.padEnd(35)} ${r.chapters} chapters  ${r.lessons} lessons`);

  console.log('\n🔗 MCQ linkage:');
  for (const r of mcqStats.rows)
    console.log(`   ${r.subject.padEnd(22)} ${r.linked}/${r.total} linked`);

  await client.end();
}

main().catch(async err => {
  console.error('\n❌ Failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
