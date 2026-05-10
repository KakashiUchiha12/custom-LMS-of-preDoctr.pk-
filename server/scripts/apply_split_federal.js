const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitFederal() {
  const client = await pool.connect();
  try {
    const originalLessonId = 966; // Federal Board Test

    // Respiration IDs (28 original + 2 missing + 5 system + 3 shared missing) = 38
    const respirationIds = [
      // Anaerobic
      55665, 55669, 55666, 55667, 55668, 55723,
      // Glycolysis & Krebs
      55675, 55676, 55677, 55679, 55732,
      // Oxidative & ETC
      55670, 55672, 55673, 55761, 55674, 55687, 55695, 55698, 55734, 55735, 55733, 55738, 55750, 55754, 55722, 55741, 55746,
      // Missing Respiration
      55696, 55697,
      // System Comparisons (User)
      55726, 55763, 55720, 55757, 55759,
      // Shared Missing
      55699, 55727, 55731
    ];

    console.log(`Processing Federal Test split...`);

    // 1. Rename existing lesson 966 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📚 Board Book Based MCQs FEDERAL 📚' 
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
      '⚡Bio-energetics⚡[Respiration] 📚 Board Book Based MCQs FEDERAL 📚',
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
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Federal Test.`);

    console.log(`Federal Test split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Federal Test:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitFederal();
