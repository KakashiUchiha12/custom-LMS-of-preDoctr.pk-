const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debug() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Get lessons for chapter 125
    const { rows: lessons } = await client.query(
      'SELECT id, title, lesson_type FROM lessons WHERE chapter_id = $1',
      [125]
    );
    console.log('\n📚 Lessons for Chapter 125:');
    console.table(lessons);

    // 2. Get MCQs counts by lesson_id for chapter 125
    const { rows: counts } = await client.query(
      `SELECT lesson_id, COUNT(*) 
       FROM mcqs 
       WHERE chapter_id = $1 
       GROUP BY lesson_id`,
      [125]
    );
    console.log('\n📊 MCQ Counts by lesson_id:');
    console.table(counts);

    // 3. Get sample MCQs that have no lesson_id
    const { rows: unmapped } = await client.query(
      `SELECT id, chapter, lesson_id 
       FROM mcqs 
       WHERE chapter_id = $1 AND lesson_id IS NULL 
       LIMIT 5`,
      [125]
    );
    console.log('\n❌ Sample Unmapped MCQs:');
    console.table(unmapped);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

debug();
