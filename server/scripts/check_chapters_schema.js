const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'chapters'"
    );
    console.log('Columns in chapters:', rows.map(r => r.column_name));
    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
