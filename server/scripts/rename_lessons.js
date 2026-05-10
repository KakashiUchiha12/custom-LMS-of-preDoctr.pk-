const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function renameLessons() {
  try {
    const client = await pool.connect();
    
    // Update lesson 1008
    await client.query(`
      UPDATE lessons 
      SET title = '📝 Chemical Coordination 📖' 
      WHERE id = 1008
    `);
    console.log('Updated lesson 1008');

    // Update lesson 1009
    await client.query(`
      UPDATE lessons 
      SET title = '📝 Nervous Coordination 📖' 
      WHERE id = 1009
    `);
    console.log('Updated lesson 1009');

    client.release();
  } catch (err) {
    console.error('Error updating lessons:', err);
  } finally {
    await pool.end();
  }
}

renameLessons();
