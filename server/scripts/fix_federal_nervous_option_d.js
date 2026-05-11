const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixFederalOptionD() {
  const chapterId = 129; // Nervous & Chemical Coordination

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Find the lesson
    const { rows: lessons } = await client.query(
      "SELECT id, title FROM lessons WHERE chapter_id = $1 AND title ILIKE '%Federal%'",
      [chapterId]
    );

    if (lessons.length === 0) {
      console.log('❌ Federal Lesson not found');
      client.release();
      return;
    }
    console.log('Found Lessons:', lessons);
    const lessonId = lessons[0].id;

    // 2. Get all MCQs for this lesson
    const { rows: mcqs } = await client.query(
      "SELECT * FROM mcqs WHERE lesson_id = $1 ORDER BY id",
      [lessonId]
    );

    console.log(`Total MCQs in Lesson ${lessonId}: ${mcqs.length}`);

    const activeMessedUp = mcqs.filter(m => m.is_active && m.option_d === '-');
    const inactiveValid = mcqs.filter(m => !m.is_active && m.option_d !== '-');

    console.log(`Active MCQs with '-' in Option D: ${activeMessedUp.length}`);
    console.log(`Inactive MCQs with valid Option D: ${inactiveValid.length}`);

    let fixedCount = 0;

    for (const active of activeMessedUp) {
      // Find matching inactive question
      const match = inactiveValid.find(m => m.question_text === active.question_text);
      if (match) {
        await client.query(
          "UPDATE mcqs SET option_d = $1 WHERE id = $2",
          [match.option_d, active.id]
        );
        fixedCount++;
        console.log(`✓ Fixed MCQ ID ${active.id} using data from ID ${match.id}`);
      } else {
        console.log(`❌ No match found for MCQ ID ${active.id}: "${active.question_text.substring(0, 30)}..."`);
      }
    }

    console.log(`\n✓ Successfully fixed ${fixedCount} MCQs`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixFederalOptionD();
