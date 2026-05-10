const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT question_text, option_a, option_b, option_c, option_d, correct_opt, explanation FROM mcqs WHERE lesson_id=1991')
  .then(res => {
    res.rows.forEach((r, i) => {
      console.log(`${i+1}. ${r.question_text}`);
      console.log(`   A. ${r.option_a}`);
      console.log(`   B. ${r.option_b}`);
      console.log(`   C. ${r.option_c}`);
      console.log(`   D. ${r.option_d}`);
      console.log(`   Answer: ${r.correct_opt ? r.correct_opt.toUpperCase() : 'N/A'}`);
      console.log(`   Explanation: ${r.explanation}\n`);
    });
    pool.end();
  });
