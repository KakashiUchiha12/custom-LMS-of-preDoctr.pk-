const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function mapTestAB() {
  const chapterId = 130;
  const testALessonId = 1024;
  const testBLessonId = 1025;

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Map Test A
    const { rowCount: aCount } = await client.query(
      "UPDATE mcqs SET lesson_id = $1 WHERE chapter_id = $2 AND lesson_id IS NULL AND chapter ILIKE '%Test A%'",
      [testALessonId, chapterId]
    );
    console.log(`✓ Mapped ${aCount} MCQs to Test A (Lesson ${testALessonId})`);

    // Map Test B
    const { rowCount: bCount } = await client.query(
      "UPDATE mcqs SET lesson_id = $1 WHERE chapter_id = $2 AND lesson_id IS NULL AND chapter ILIKE '%Test B%'",
      [testBLessonId, chapterId]
    );
    console.log(`✓ Mapped ${bCount} MCQs to Test B (Lesson ${testBLessonId})`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

mapTestAB();
