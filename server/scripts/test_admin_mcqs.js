const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../db');

async function test() {
  try {
    const search = '';
    const subject = '';
    const page = 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const countResult = await pool.query(`SELECT COUNT(*)::int FROM mcqs m ${where}`, params);
    console.log('Count:', countResult.rows[0].count);

    const queryParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT m.id, m.question_text, m.option_a, m.option_b, m.option_c, m.option_d, m.correct_opt, m.subject, m.chapter,
              c.name as chapter_name, s.name as subject_name
       FROM mcqs m
       LEFT JOIN chapters c ON m.chapter_id = c.id
       LEFT JOIN subjects s ON c.subject_id = s.id
       ${where} 
       ORDER BY m.id DESC 
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );
    
    console.log('MCQs fetched:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Sample MCQ:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    pool.end();
  }
}

test();
