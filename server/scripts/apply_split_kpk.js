const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitKPK() {
  const client = await pool.connect();
  try {
    const originalLessonId = 964; // KPK Board Test

    // Respiration IDs (30 original + 1 general + 2 missing + 3 shared) = 36
    const respirationIds = [
      // Anaerobic
      55495, 55496, 55534, 55560, 55497, 55498, 55531,
      // Glycolysis
      55551, 55505, 55529, 55506, 55507, 55559, 55508, 55555,
      // Oxidative
      55500, 55517, 55501, 55533, 55502, 55504, 55543, 55549, 55523, 55547, 55524, 55539, 55548, 55503, 55556,
      // From General
      55562,
      // From Missing
      55499, 55513,
      // Shared (moved to respiration to balance)
      55545, 55552, 55563
    ];

    console.log(`Processing KPK Test split...`);

    // 1. Rename existing lesson 964 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📚 Board Book Based MCQs KPK 📚' 
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
      '⚡Bio-energetics⚡[Respiration] 📚 Board Book Based MCQs KPK 📚',
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
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration KPK Test.`);

    console.log(`KPK Test split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for KPK Test:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitKPK();
