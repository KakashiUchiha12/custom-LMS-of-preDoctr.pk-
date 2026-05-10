const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplitTest5() {
  const client = await pool.connect();
  try {
    const originalLessonId = 963; // Test 5

    // 1. Respiration IDs (43 original + 4 additions)
    const respirationIds = [
      // Glycolysis & Fermentation
      56285, 56335, 56337, 56340, 56355, 56300, 56320, 56294, 56316, 56383, 
      56306, 56361, 56381, 56317, 56331, 56368, 56380,
      // Krebs Cycle & ETC
      56287, 56312, 56322, 56326, 56346, 56360, 56290, 56301, 56345, 56369, 
      56289, 56295, 56304, 56325, 56372, 56313, 56319, 56341, 56349, 56375, 
      56296, 56324, 56328, 56338, 56352, 56373,
      // Additions
      56327, 56339, 56354, 56330
    ];

    console.log(`Processing Test 5 split...`);

    // 1. Rename existing lesson 963 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📝 Test 5 📖' 
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
      '⚡Bio-energetics⚡[Respiration] 📝 Test 5 📖',
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
    console.log(`Moved ${moveRes.rowCount} MCQs to Respiration Test 5.`);

    console.log(`Test 5 split completed successfully.`);

  } catch (err) {
    console.error('Error applying split for Test 5:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

applySplitTest5();
