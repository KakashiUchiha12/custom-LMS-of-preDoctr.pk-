const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function trimTestA() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Get all active MCQs for Test A (lesson 941) ordered by ID (oldest first)
    const { rows } = await client.query(
      `SELECT id FROM mcqs WHERE lesson_id = 941 AND is_active = TRUE ORDER BY id ASC`
    );

    console.log(`📊 Current count in Test A: ${rows.length}`);

    const targetCount = 65;
    const excess = rows.length - targetCount;

    if (excess <= 0) {
      console.log('⚠️ Count is already at or below 65. No action needed.');
      client.release();
      return;
    }

    console.log(`🗑️ Removing ${excess} excess questions (oldest first) to reach 65.`);

    // 2. Get the IDs of the oldest 'excess' questions
    const idsToRemove = rows.slice(0, excess).map(r => r.id);

    // 3. Deactivate them
    await client.query(
      `UPDATE mcqs SET is_active = FALSE WHERE id = ANY($1)`,
      [idsToRemove]
    );

    console.log(`✅ Successfully deactivated ${excess} old questions.`);

    // 4. Verify new count
    const { rows: newCount } = await client.query(
      `SELECT COUNT(*) FROM mcqs WHERE lesson_id = 941 AND is_active = TRUE`
    );
    console.log(`📊 New count in Test A: ${newCount[0].count}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

trimTestA();
