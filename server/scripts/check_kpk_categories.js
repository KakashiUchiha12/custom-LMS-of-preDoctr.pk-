const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkKpkCategories() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Query to see the original chapter strings for MCQs mapped to lesson 946 (KPK Board Book)
    const { rows } = await client.query(
      `SELECT chapter, COUNT(*) 
       FROM mcqs 
       WHERE chapter_id = 125 AND lesson_id = 946
       GROUP BY chapter`,
      []
    );

    console.log('\n🔍 Original categories mapped to KPK Board Book (Lesson 946):');
    console.table(rows);

    // Also check for Test 4 (Lesson 945) just in case
    const { rows: test4 } = await client.query(
      `SELECT chapter, COUNT(*) 
       FROM mcqs 
       WHERE chapter_id = 125 AND lesson_id = 945
       GROUP BY chapter`,
      []
    );

    console.log('\n🔍 Original categories mapped to Test 4 (Lesson 945):');
    console.table(test4);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkKpkCategories();
