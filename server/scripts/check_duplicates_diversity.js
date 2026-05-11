const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDuplicates() {
  const chapterId = 130;

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Duplicates within the same lesson
    const { rows: withinLesson } = await client.query(`
      SELECT question_text, lesson_id, COUNT(*)
      FROM mcqs 
      WHERE chapter_id = $1 AND lesson_id IS NOT NULL
      GROUP BY question_text, lesson_id
      HAVING COUNT(*) > 1
    `, [chapterId]);

    console.log(`\nDuplicates within the same lesson: ${withinLesson.length}`);
    let totalWithin = 0;
    withinLesson.forEach(d => totalWithin += (parseInt(d.count) - 1));
    console.log(`Total redundant questions within lessons: ${totalWithin}`);

    // 2. Duplicates across the whole chapter (ignoring lesson)
    const { rows: acrossChapter } = await client.query(`
      SELECT question_text, COUNT(*)
      FROM mcqs 
      WHERE chapter_id = $1
      GROUP BY question_text
      HAVING COUNT(*) > 1
    `, [chapterId]);

    console.log(`\nDuplicates across the whole chapter (ignoring lesson): ${acrossChapter.length}`);
    let totalAcross = 0;
    acrossChapter.forEach(d => totalAcross += (parseInt(d.count) - 1));
    console.log(`Total redundant questions across chapter: ${totalAcross}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkDuplicates();
