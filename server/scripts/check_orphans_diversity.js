const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkOrphans() {
  const chapterId = 130;

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Find orphan MCQs for this chapter
    const { rows: orphans } = await client.query(
      "SELECT id, chapter FROM mcqs WHERE chapter_id = $1 AND lesson_id IS NULL LIMIT 20",
      [chapterId]
    );

    console.log(`Found orphans (showing up to 20):`);
    orphans.forEach(o => console.log(`  - ID: ${o.id} -> Chapter: "${o.chapter}"`));

    // Also count how many contain "Test A" or "Test B"
    const { rows: testA } = await client.query(
      "SELECT COUNT(*) FROM mcqs WHERE chapter_id = $1 AND lesson_id IS NULL AND chapter ILIKE '%Test A%'",
      [chapterId]
    );
    const { rows: testB } = await client.query(
      "SELECT COUNT(*) FROM mcqs WHERE chapter_id = $1 AND lesson_id IS NULL AND chapter ILIKE '%Test B%'",
      [chapterId]
    );

    console.log(`\nOrphans with "Test A": ${testA[0].count}`);
    console.log(`Orphans with "Test B": ${testB[0].count}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkOrphans();
