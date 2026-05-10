const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('../db');

async function updateImages() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    const lessonId = 941; // Test A of Acellular Life

    const res = await client.query(
      `UPDATE mcqs 
       SET image_url = 'https://picsum.photos/400/300?random=' || id 
       WHERE lesson_id = $1`,
      [lessonId]
    );

    console.log(`✓ Updated ${res.rowCount} MCQs with unique random image URLs.`);
    client.release();
  } catch (err) {
    console.error('Error updating images:', err);
  } finally {
    await pool.end();
  }
}

updateImages();
