const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitTest2() {
  const client = await pool.connect();
  try {
    const originalLessonId = 960; // Test 2

    // IDs from user's list for Respiration
    const respirationIds = [
      56090, 56128, 56129, 56131, 56132, 56133, 56134, 56138, 56139, 56140, 56141, 56144,
      56145, 56146, 56147, 56148, 56150, 56151, 56152
    ];

    // IDs to leave out (unassign)
    const leaveOutIds = [
      56088, 56086, 56087, 56092, 56093, 56100, 56116, 56118, 56136, 56137, 56142, 56143, 56149
    ];

    console.log(`Processing Test 2 split...`);

    // 1. Rename existing lesson 960 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📝 Test 2 📖' 
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
      '⚡Bio-energetics⚡[Respiration] 📝 Test 2 📖',
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
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Test 2.`);

    // 4. Leave out the 13 MCQs (set lesson_id to NULL)
    const leaveOutRes = await client.query(`
      UPDATE mcqs 
      SET lesson_id = NULL 
      WHERE id = ANY($1) AND lesson_id = $2
    `, [leaveOutIds, originalLessonId]);
    console.log(`Unassigned ${leaveOutRes.rowCount} MCQs from Test 2.`);

    console.log(`Test 2 split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Test 2:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitTest2();
