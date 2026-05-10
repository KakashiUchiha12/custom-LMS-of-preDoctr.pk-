const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportTests() {
  const client = await pool.connect();
  try {
    const lessonIds = [960, 961, 962, 963]; // Tests 2, 3, 4, 5

    const res = await client.query(`
      SELECT id, lesson_id, question_text, option_a, option_b, option_c, option_d, correct_opt, explanation 
      FROM mcqs 
      WHERE lesson_id IN ($1, $2, $3, $4) AND is_active = TRUE
      ORDER BY lesson_id ASC, id ASC
    `, lessonIds);

    const mcqs = res.rows.map(row => ({
      id: row.id,
      current_lesson_id: row.lesson_id,
      category: "", // User will fill this in
      question: row.question_text,
      options: [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean),
      correct_answer: row[`option_${row.correct_opt}`] || row.correct_opt,
      explanation: row.explanation
    }));

    const outputPath = path.join(__dirname, 'tests_2_3_4_5_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(mcqs, null, 2));

    console.log(`Successfully exported ${mcqs.length} MCQs to ${outputPath}`);
    console.log(`You can now open this file and set the "category" field to "Photosynthesis" or "Respiration".`);

  } catch (err) {
    console.error('Error exporting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

exportTests();
