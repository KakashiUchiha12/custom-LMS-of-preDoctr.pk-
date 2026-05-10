const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateMissing() {
  try {
    const client = await pool.connect();
    
    await client.query("UPDATE mcqs SET option_d = 'Hypothalamus' WHERE id = 70635");
    await client.query("UPDATE mcqs SET option_d = 'Central nervous system' WHERE id = 70660");

    console.log('✓ Updated 2 missing questions');

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateMissing();
