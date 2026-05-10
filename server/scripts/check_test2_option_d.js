const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOptionD() {
  const lessonId = 978;

  try {
    const client = await pool.connect();
    
    const res = await client.query(`
      SELECT id, question_text, option_d 
      FROM mcqs 
      WHERE lesson_id = $1 AND is_active = TRUE
    `, [lessonId]);

    const mcqs = res.rows;
    console.log(`Total MCQs in Test 2: ${mcqs.length}`);

    const messedUp = mcqs.filter(m => !m.option_d || m.option_d.trim() === '' || m.option_d.trim() === '-');

    console.log(`MCQs with messed up Option D: ${messedUp.length}`);
    if (messedUp.length > 0) {
      console.log('IDs of messed up MCQs:');
      console.log(messedUp.map(m => m.id).join(', '));
    }

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkOptionD();
