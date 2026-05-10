const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitTest3() {
  const client = await pool.connect();
  try {
    const originalLessonId = 961; // Test 3

    // 1. Original Respiration IDs provided by user
    const originalRespirationIds = [
      56158, 56160, 56161, 56164, 56168, 56169, 56175, 56177, 56181, 56212,
      56182, 56183, 56189, 56190, 56191, 56192, 56193, 56199, 56200, 56203,
      56207, 56208
    ];

    // 2. Metabolism IDs mapped to Respiration
    const metabolismToRespirationIds = [
      56159, // Cytochrome C
      56204, // Anaerobic Acceptor
      56205, // Fermentation
      56215, // Carbon Release
      56206, // Protein Energy
      56209, // Regulation
      56210, // Exergonic
      56214  // Heterotroph
    ];

    const allRespirationIds = [...originalRespirationIds, ...metabolismToRespirationIds];

    // 3. Missing IDs to leave out (unassign)
    const leaveOutIds = [56211, 56167, 56185, 56194, 56213, 56216];

    console.log(`Processing Test 3 split...`);

    // 1. Rename existing lesson 961 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📝 Test 3 📖' 
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
      '⚡Bio-energetics⚡[Respiration] 📝 Test 3 📖',
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
    `, [newRespLessonId, allRespirationIds, originalLessonId]);
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Test 3.`);

    // 4. Leave out the 6 MCQs (set lesson_id to NULL)
    const leaveOutRes = await client.query(`
      UPDATE mcqs 
      SET lesson_id = NULL 
      WHERE id = ANY($1) AND lesson_id = $2
    `, [leaveOutIds, originalLessonId]);
    console.log(`Unassigned ${leaveOutRes.rowCount} MCQs from Test 3.`);

    console.log(`Test 3 split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Test 3:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitTest3();
