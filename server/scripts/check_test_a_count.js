const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTestACount() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    const { rows } = await client.query(
      `SELECT COUNT(*) FROM mcqs WHERE lesson_id = 941 AND is_active = TRUE`
    );

    console.log(`\n📊 Total Active MCQs in Test A (Lesson 941): ${rows[0].count}`);

    // Let's also check for duplicates in Test A specifically
    const { rows: duplicates } = await client.query(
      `SELECT question_text, COUNT(*) 
       FROM mcqs 
       WHERE lesson_id = 941 AND is_active = TRUE
       GROUP BY question_text 
       HAVING COUNT(*) > 1`
    );
    console.log(`\n🔍 Found ${duplicates.length} duplicate questions within Test A.`);
    if (duplicates.length > 0) {
      console.table(duplicates);
    }

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkTestACount();
