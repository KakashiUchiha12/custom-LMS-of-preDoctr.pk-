const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDuplicates() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Query to find duplicate question texts for chapter 125
    const { rows } = await client.query(
      `SELECT question_text, COUNT(*) as occurrence_count 
       FROM mcqs 
       WHERE chapter_id = $1 AND is_active = TRUE
       GROUP BY question_text 
       HAVING COUNT(*) > 1
       ORDER BY occurrence_count DESC`,
      [125]
    );

    console.log(`\n🔍 Found ${rows.length} unique questions that are repeated in Chapter 125.`);
    
    if (rows.length > 0) {
      const totalDuplicates = rows.reduce((acc, row) => acc + (parseInt(row.occurrence_count, 10) - 1), 0);
      console.log(`📊 Total extra repeated instances: ${totalDuplicates}`);
      
      console.log('\n📝 Sample of repeated questions:');
      console.table(rows.slice(0, 10)); // Show top 10
    }

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkDuplicates();
