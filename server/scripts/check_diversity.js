const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDiversity() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Find chapters
    const { rows: chapters } = await client.query(
      "SELECT id, name FROM chapters WHERE name ILIKE '%Diversity%'"
    );

    console.log('Found Chapters:', chapters);

    for (const chapter of chapters) {
      console.log(`\nAnalyzing Chapter: ${chapter.name} (ID: ${chapter.id})`);

      // Find lessons
      const { rows: lessons } = await client.query(
        "SELECT id, title FROM lessons WHERE chapter_id = $1",
        [chapter.id]
      );

      console.log(`Found ${lessons.length} lessons:`);
      
      for (const lesson of lessons) {
        // Count MCQs
        const { rows: mcqCount } = await client.query(
          "SELECT COUNT(*) FROM mcqs WHERE lesson_id = $1",
          [lesson.id]
        );
        console.log(`  - Lesson: ${lesson.title} (ID: ${lesson.id}) -> MCQs: ${mcqCount[0].count}`);
        
        // Check if there are active MCQs
        const { rows: activeCount } = await client.query(
          "SELECT COUNT(*) FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE",
          [lesson.id]
        );
        console.log(`    Active MCQs: ${activeCount[0].count}`);
      }

      // Also check if there are MCQs with this chapter_id but no lesson_id
      const { rows: orphanCount } = await client.query(
        "SELECT COUNT(*) FROM mcqs WHERE chapter_id = $1 AND (lesson_id IS NULL OR lesson_id NOT IN (SELECT id FROM lessons WHERE chapter_id = $1))",
        [chapter.id]
      );
      console.log(`Orphan MCQs with this chapter_id: ${orphanCount[0].count}`);
    }

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkDiversity();
