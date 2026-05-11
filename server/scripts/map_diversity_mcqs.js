const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function mapDiversityMCQs() {
  const chapterId = 130; // Diversity among Animals

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Get all MCQs matching the chapter text
    const { rows: mcqs } = await client.query(
      "SELECT id, chapter FROM mcqs WHERE chapter ILIKE '%Diversity among Animals%'"
    );

    console.log(`Found ${mcqs.length} MCQs to map`);

    let updatedCount = 0;

    for (const mcq of mcqs) {
      let lessonId = null;

      if (mcq.chapter.includes('PUNJAB')) {
        lessonId = 1031;
      } else if (mcq.chapter.includes('KPK')) {
        lessonId = 1030;
      } else if (mcq.chapter.includes('FEDERAL')) {
        lessonId = 1032;
      } else if (mcq.chapter.includes('SINDH')) {
        lessonId = 1033;
      } else if (mcq.chapter.includes('Balochistan')) {
        lessonId = 1034;
      } else if (mcq.chapter.includes('Test 1')) {
        lessonId = 1026;
      } else if (mcq.chapter.includes('Test 2')) {
        lessonId = 1027;
      } else if (mcq.chapter.includes('Test 3')) {
        lessonId = 1028;
      } else if (mcq.chapter.includes('Test 4')) {
        lessonId = 1029;
      } else if (mcq.chapter.includes('ETEA')) {
        lessonId = 1035;
      } else if (mcq.chapter.includes('UHS')) {
        lessonId = 1036;
      }

      if (lessonId) {
        await client.query(
          "UPDATE mcqs SET chapter_id = $1, lesson_id = $2 WHERE id = $3",
          [chapterId, lessonId, mcq.id]
        );
        updatedCount++;
      } else {
        // If no specific lesson found, just map to chapter and maybe a default lesson or leave lesson_id null?
        // Let's just map to chapter for now.
        await client.query(
          "UPDATE mcqs SET chapter_id = $1 WHERE id = $2",
          [chapterId, mcq.id]
        );
        console.log(`Mapped MCQ ID ${mcq.id} to Chapter only (no lesson match)`);
      }
    }

    console.log(`\n✓ Successfully mapped ${updatedCount} MCQs to lessons`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

mapDiversityMCQs();
