const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function findMissing() {
  try {
    const client = await pool.connect();
    
    const { rows: q1 } = await client.query("SELECT * FROM mcqs WHERE id = 70635");
    const { rows: q2 } = await client.query("SELECT * FROM mcqs WHERE id = 70660");

    console.log('Q1:', q1[0]);
    console.log('Q2:', q2[0]);

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

findMissing();
