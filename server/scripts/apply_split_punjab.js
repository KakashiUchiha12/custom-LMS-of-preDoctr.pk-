const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitPunjab() {
  const client = await pool.connect();
  try {
    const originalLessonId = 965; // Punjab Board Test

    // Respiration IDs (16 + 12 + 1) = 29
    const respirationIds = [
      // Glycolysis & Fermentation
      55565, 55566, 55567, 55568, 55569, 55575, 55620, 55621, 55624, 55627, 55628, 55629, 55635, 55636, 55637, 55657,
      // Aerobic & ETC
      55571, 55572, 55633, 55573, 55574, 55634, 55586, 55623, 55631, 55655, 55658, 55659,
      // General
      55656
    ];

    console.log(`Processing Punjab Test split...`);

    // 1. Rename existing lesson 965 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📚 Board Book Based MCQs PUNJAB 📚' 
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
      '⚡Bio-energetics⚡[Respiration] 📚 Board Book Based MCQs PUNJAB 📚',
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
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Punjab Test.`);

    console.log(`Punjab Test split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Punjab Test:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitPunjab();
