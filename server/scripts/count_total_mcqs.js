const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function countTotalMcqs() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    const { rows } = await client.query(
      `SELECT COUNT(*) FROM mcqs WHERE is_active = TRUE`
    );

    console.log(`\n📊 Total Active MCQs in the LMS: ${rows[0].count}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

countTotalMcqs();
