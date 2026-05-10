const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportBoardTests() {
  const tests = [
    { id: 964, name: 'kpk' },
    { id: 965, name: 'punjab' },
    { id: 966, name: 'federal' },
    { id: 967, name: 'sindh' }
  ];

  for (const test of tests) {
    try {
      const res = await pool.query(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_opt, explanation 
         FROM mcqs 
         WHERE lesson_id = $1 AND is_active = TRUE 
         ORDER BY id ASC`,
        [test.id]
      );

      const filePath = path.join(__dirname, `${test.name}_export.json`);
      fs.writeFileSync(filePath, JSON.stringify(res.rows, null, 2));
      console.log(`Exported ${res.rows.length} MCQs to ${test.name}_export.json`);
    } catch (err) {
      console.error(`Error exporting test ${test.id}:`, err);
    }
  }

  await pool.end();
}

exportBoardTests();
