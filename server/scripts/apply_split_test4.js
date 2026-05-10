const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitTest4() {
  const client = await pool.connect();
  try {
    const originalLessonId = 962; // Test 4

    // 1. Respiration IDs to move (11 MCQs)
    const respirationIds = [
      56220, 56223, 56226, 56233, 56244, 56245, 56237, 56246, 56247, 56248, 56251
    ];

    // 2. IDs to leave out (20 MCQs: Bioenergetics + Biochemistry)
    const leaveOutIds = [
      // Bioenergetics
      56218, 56227, 56228, 56232, 56235, 56236, 56240, 56241, 56210,
      // Biochemistry
      56231, 56238, 56239, 56242, 56243, 56249, 56250, 56252, 56253, 56254, 56255
    ];

    console.log(`Processing Test 4 split...`);

    // 1. Rename existing lesson 962 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📝 Test 4 📖' 
      WHERE id = $1
    `, [originalLessonId]);
    console.log(`Renamed Lesson ${originalLessonId} to Photosynthesis variant.`);

    // 2. Create new lesson for Respiration
    const lessonDataRes = await client.query(`SELECT * FROM lessons WHERE id = $1`, [originalLessonId]);
    const lData = lessonDataRes.rows[0];

    const insertRes = await client.query(`
      INSERT INTO lessons (wp_id, chapter_id, subject_id, title, lesson_type, lesson_sub, order_index, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      null, 
      lData.chapter_id,
      lData.subject_id,
      '⚡Bio-energetics⚡[Respiration] 📝 Test 4 📖',
      lData.lesson_type,
      lData.lesson_sub,
      lData.order_index,
      lData.is_active
    ]);

    const newRespLessonId = insertRes.rows[0].id;
    console.log(`Created new Respiration lesson with ID: ${newRespLessonId}`);

    // 3. Move Respiration MCQs to the new lesson
    const moveRes = await client.query(`
      UPDATE mcqs 
      SET lesson_id = $1 
      WHERE id = ANY($2) AND lesson_id = $3
    `, [newRespLessonId, respirationIds, originalLessonId]);
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Test 4.`);

    // 4. Leave out the 20 MCQs (set lesson_id to NULL)
    const leaveOutRes = await client.query(`
      UPDATE mcqs 
      SET lesson_id = NULL 
      WHERE id = ANY($1) AND lesson_id = $2
    `, [leaveOutIds, originalLessonId]);
    console.log(`Unassigned ${leaveOutRes.rowCount} MCQs from Test 4.`);

    console.log(`Test 4 split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Test 4:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitTest4();
