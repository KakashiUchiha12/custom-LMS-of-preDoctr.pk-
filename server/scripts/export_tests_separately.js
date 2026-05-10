const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportTestsSeparately() {
  const client = await pool.connect();
  try {
    const tests = [
      { id: 960, name: 'test2' },
      { id: 961, name: 'test3' },
      { id: 962, name: 'test4' },
      { id: 963, name: 'test5' }
    ];

    for (const test of tests) {
      const res = await client.query(`
        SELECT id, question_text, option_a, option_b, option_c, option_d, correct_opt, explanation 
        FROM mcqs 
        WHERE lesson_id = $1 AND is_active = TRUE
        ORDER BY id ASC
      `, [test.id]);

      const mcqs = res.rows.map(row => ({
        id: row.id,
        category: "", // User will fill this in
        question: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean),
        correct_answer: row[`option_${row.correct_opt}`] || row.correct_opt,
        explanation: row.explanation
      }));

      const outputPath = path.join(__dirname, `${test.name}_export.json`);
      fs.writeFileSync(outputPath, JSON.stringify(mcqs, null, 2));

      console.log(`Successfully exported ${mcqs.length} MCQs to ${outputPath}`);
    }

    console.log(`\nAll tests exported separately! You can now open test2_export.json, test3_export.json, etc.`);

  } catch (err) {
    console.error('Error exporting MCQs:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

exportTestsSeparately();
