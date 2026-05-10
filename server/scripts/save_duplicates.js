const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function saveDuplicates() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Query to find all duplicate questions with their counts
    const { rows } = await client.query(
      `SELECT question_text, COUNT(*) as occurrence_count 
       FROM mcqs 
       WHERE chapter_id = $1 AND is_active = TRUE
       GROUP BY question_text 
       HAVING COUNT(*) > 1
       ORDER BY occurrence_count DESC`,
      [125]
    );

    const outputPath = path.join(__dirname, 'duplicates_output.json');
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
    
    console.log(`\n✅ Found ${rows.length} repeated questions.`);
    console.log(`📁 The full list has been saved to: ${outputPath}`);
    console.log(`\nYou can open that file to see all the questions!`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

saveDuplicates();
