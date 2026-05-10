const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms'
});

// Strip emoji and normalize spaces for accurate matching
function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu, '')
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function main() {
  await client.connect();
  console.log('✓ Connected to PostgreSQL');

  // 1. Ensure lesson_id column exists
  await client.query(`
    ALTER TABLE mcqs ADD COLUMN IF NOT EXISTS lesson_id INT REFERENCES lessons(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_mcqs_lesson_id ON mcqs(lesson_id);
  `);
  console.log('✓ Schema verified (lesson_id exists)');

  // 2. Fetch all test lessons
  const lessonsRes = await client.query(`
    SELECT id, chapter_id, title 
    FROM lessons 
    WHERE lesson_type IN ('test', 'board_book', 'past_paper', 'ocr')
  `);
  const lessons = lessonsRes.rows;
  console.log(`✓ Fetched ${lessons.length} test lessons`);

  // Group lessons by chapter_id for faster lookup
  const lessonsByChapter = {};
  for (const l of lessons) {
    if (!lessonsByChapter[l.chapter_id]) {
      lessonsByChapter[l.chapter_id] = [];
    }
    lessonsByChapter[l.chapter_id].push({
      ...l,
      normalizedTitle: normalizeText(l.title)
    });
  }

  // 3. Fetch all linked MCQs
  const mcqsRes = await client.query(`
    SELECT id, chapter_id, chapter 
    FROM mcqs 
    WHERE chapter_id IS NOT NULL
  `);
  const mcqs = mcqsRes.rows;
  console.log(`✓ Fetched ${mcqs.length} MCQs linked to chapters`);

  let matchedCount = 0;
  let updateCount = 0;
  
  console.log('🔗 Mapping MCQs to lessons...');

  // Group updates to execute in batch
  const updates = [];

  for (const mcq of mcqs) {
    const chapterLessons = lessonsByChapter[mcq.chapter_id];
    if (!chapterLessons || chapterLessons.length === 0) continue;

    const normalizedMcqChapter = normalizeText(mcq.chapter);
    
    // Find matching lesson
    let matchedLessonId = null;
    
    // Try to find the exact normalized title within the normalized mcq string
    for (const lesson of chapterLessons) {
      if (normalizedMcqChapter.includes(lesson.normalizedTitle)) {
        matchedLessonId = lesson.id;
        // Prioritize longer matches if multiple matches exist, but typically they are distinct
        break; 
      }
    }

    if (matchedLessonId) {
      updates.push({ id: mcq.id, lesson_id: matchedLessonId });
      matchedCount++;
    }
  }

  console.log(`✓ Found matches for ${matchedCount} MCQs`);

  // 4. Update the database in chunks
  const CHUNK_SIZE = 1000;
  console.log(`🗄️ Updating database in chunks of ${CHUNK_SIZE}...`);
  
  for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
    const chunk = updates.slice(i, i + CHUNK_SIZE);
    
    // Build a VALUES string for bulk update
    // e.g. (id1, lesson_id1), (id2, lesson_id2)
    const valuesStr = chunk.map(u => `(${u.id}, ${u.lesson_id})`).join(', ');
    
    const query = `
      UPDATE mcqs AS m
      SET lesson_id = v.lesson_id
      FROM (VALUES ${valuesStr}) AS v(id, lesson_id)
      WHERE m.id = v.id;
    `;
    
    await client.query(query);
    updateCount += chunk.length;
    process.stdout.write(`\r   Updated ${updateCount} / ${updates.length}`);
  }

  console.log('\n✅ Successfully completed mapping!');
  
  // 5. Provide a summary
  const summary = await client.query(`
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN lesson_id IS NOT NULL THEN 1 ELSE 0 END) as mapped 
    FROM mcqs
  `);
  
  console.log(`📊 Summary: ${summary.rows[0].mapped} / ${summary.rows[0].total} MCQs have a lesson_id.`);
  
  await client.end();
}

main().catch(err => {
  console.error('\n❌ Failed:', err.message);
  client.end();
  process.exit(1);
});
