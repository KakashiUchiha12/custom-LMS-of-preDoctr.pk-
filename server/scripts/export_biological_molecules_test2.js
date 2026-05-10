const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportTest2() {
  const lessonId = 978; // Biological Molecules Test 2

  try {
    const client = await pool.connect();
    
    // Fetch all MCQs for Lesson 978
    const res = await client.query(`
      SELECT id, question_text, option_a, option_b, option_c, option_d, correct_opt, explanation 
      FROM mcqs 
      WHERE lesson_id = $1 AND is_active = TRUE
      ORDER BY id ASC
    `, [lessonId]);

    const mcqs = res.rows.map(row => ({
      id: row.id,
      question: row.question_text,
      options: [row.option_a, row.option_b, row.option_c, row.option_d],
      correct_answer: row[`option_${row.correct_opt}`] || row.correct_opt,
      explanation: row.explanation
    }));

    const outputPath = path.join(__dirname, 'biological_molecules_test2_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(mcqs, null, 2));

    console.log(`Successfully exported ${mcqs.length} MCQs to ${outputPath}`);

    client.release();
  } catch (err) {
    console.error('Error exporting MCQs:', err);
  } finally {
    await pool.end();
  }
}

exportTest2();
