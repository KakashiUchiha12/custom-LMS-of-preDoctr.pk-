const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getBiologyStats() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Get Biology subject ID
    const { rows: sub } = await client.query(
      "SELECT id FROM subjects WHERE slug = 'biology-mcqs'"
    );
    
    if (sub.length === 0) {
      console.log('❌ Biology subject not found');
      client.release();
      return;
    }
    const biologyId = sub[0].id;

    // 2. Total MCQs in Biology
    const { rows: totalBio } = await client.query(
      `SELECT COUNT(m.id) 
       FROM mcqs m 
       JOIN chapters c ON m.chapter_id = c.id 
       WHERE c.subject_id = $1 AND m.is_active = TRUE`,
      [biologyId]
    );
    console.log(`\n📊 Total Active MCQs in Biology: ${totalBio[0].count}`);

    // 3. MCQs in each chapter of Biology
    const { rows: chapterCounts } = await client.query(
      `SELECT c.name, COUNT(m.id) as count
       FROM chapters c 
       LEFT JOIN mcqs m ON m.chapter_id = c.id AND m.is_active = TRUE 
       WHERE c.subject_id = $1 
       GROUP BY c.id, c.name 
       ORDER BY c.order_index`,
      [biologyId]
    );
    console.log('\n📚 MCQs by Chapter in Biology:');
    console.table(chapterCounts);

    // 4. MCQs in each test of Acellular Life (Chapter 125)
    const { rows: testCounts } = await client.query(
      `SELECT l.title, COUNT(m.id) as count
       FROM lessons l 
       LEFT JOIN mcqs m ON m.lesson_id = l.id AND m.is_active = TRUE 
       WHERE l.chapter_id = 125 
       GROUP BY l.id, l.title 
       ORDER BY l.id`,
      []
    );
    console.log('\n📝 MCQs by Test in Acellular Life (Chapter 125):');
    console.table(testCounts);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

getBiologyStats();
