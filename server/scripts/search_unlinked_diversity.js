const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function searchUnlinked() {
  try {
    const client = await pool.connect();
    
    // Search for MCQs with chapter containing "Diversity among Animals"
    const { rows } = await client.query(
      "SELECT id, chapter, lesson_id, chapter_id FROM mcqs WHERE chapter ILIKE '%Diversity among Animals%' LIMIT 10"
    );

    console.log('Found MCQs matching text:', rows);
    
    // Also search for MCQs with chapter containing "Animals"
    const { rows: rows2 } = await client.query(
      "SELECT id, chapter, lesson_id, chapter_id FROM mcqs WHERE chapter ILIKE '%Animals%' LIMIT 10"
    );
    console.log('Found MCQs matching "Animals":', rows2);

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

searchUnlinked();
