const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function renameSindh() {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📚 Board Book Based MCQs SINDH📚' 
      WHERE id = 967
    `);
    console.log('Successfully renamed Sindh test title.');
  } catch (err) {
    console.error('Error renaming Sindh test:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

renameSindh();
