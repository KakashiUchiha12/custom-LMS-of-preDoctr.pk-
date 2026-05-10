const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportTest() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Find the chapter
    const { rows: chapters } = await client.query(
      "SELECT id, name FROM chapters WHERE name ILIKE '%Nervous%'"
    );
    
    if (chapters.length === 0) {
      console.log('❌ Chapter not found');
      client.release();
      return;
    }
    console.log('Found Chapters:', chapters);
    const chapterId = chapters[0].id;

    // 2. Find Test 1 in that chapter
    const { rows: lessons } = await client.query(
      "SELECT id, title FROM lessons WHERE chapter_id = $1 AND (title ILIKE '%Test 1%' OR lesson_sub = '1')",
      [chapterId]
    );

    if (lessons.length === 0) {
      console.log('❌ Test 1 not found');
      client.release();
      return;
    }
    console.log('Found Lessons:', lessons);
    const lessonId = lessons[0].id;

    // 3. Fetch all MCQs for that test
    const { rows: mcqs } = await client.query(
      "SELECT * FROM mcqs WHERE lesson_id = $1 ORDER BY id",
      [lessonId]
    );

    console.log(`\n📊 Found ${mcqs.length} MCQs in Test 1`);

    // 4. Export to file
    const outputPath = path.join(__dirname, 'nervous_test_1.json');
    fs.writeFileSync(outputPath, JSON.stringify(mcqs, null, 2));
    console.log(`✓ Exported to ${outputPath}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

exportTest();
