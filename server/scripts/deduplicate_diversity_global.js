const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function deduplicateGlobal() {
  const chapterId = 130;

  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Find duplicates across the whole chapter
    const { rows: duplicates } = await client.query(`
      SELECT question_text, array_agg(id ORDER BY id) as ids
      FROM mcqs 
      WHERE chapter_id = $1
      GROUP BY question_text
      HAVING COUNT(*) > 1
    `, [chapterId]);

    console.log(`Found ${duplicates.length} duplicate questions across the chapter`);

    let deletedCount = 0;

    for (const dup of duplicates) {
      // Keep the first one (lowest ID), delete the rest
      const ids = dup.ids;
      const keepId = ids[0];
      const deleteIds = ids.slice(1);

      await client.query(
        "DELETE FROM mcqs WHERE id = ANY($1)",
        [deleteIds]
      );
      deletedCount += deleteIds.length;
    }

    console.log(`\n✓ Successfully deleted ${deletedCount} duplicate MCQs across the chapter`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

deduplicateGlobal();
