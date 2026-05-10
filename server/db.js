const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('✓ Connected to PostgreSQL');
      client.release();
      return;
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error('✗ PostgreSQL connection failed after retries:', err);
        process.exit(1);
      }
      console.log(`  DB not ready, retrying in 2s... (${retries} left)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

module.exports = { pool, testConnection };
