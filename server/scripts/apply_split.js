const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function applySplit() {
  try {
    const rawText = fs.readFileSync(path.join(__dirname, 'user_split_data.txt'), 'utf-8');
    const lines = rawText.split('\n');

    let currentCategory = 'Photosynthesis';
    const photosynthesisUpdates = [];
    const respirationUpdates = [];

    for (const line of lines) {
      if (line.includes('RespirationThese questions focus on')) {
        currentCategory = 'Respiration';
        continue;
      }
      
      const match = line.match(/^(\d+)(?:\/\d+)?\s*\(.*?\):\s*(.*)/);
      if (match) {
        const id = parseInt(match[1], 10);
        let explanation = match[2].trim();
        // Remove trailing "Shutterstock" or "gstraub" if user pasted from somewhere
        explanation = explanation.replace(/\s*(Shutterstock|gstraub)(\s*Explore)?$/i, '');

        if (currentCategory === 'Photosynthesis') {
          photosynthesisUpdates.push({ id, explanation });
        } else {
          respirationUpdates.push({ id, explanation });
        }
      }
    }

    console.log(`Parsed ${photosynthesisUpdates.length} Photosynthesis MCQs and ${respirationUpdates.length} Respiration MCQs.`);

    const client = await pool.connect();
    
    // 1. Rename existing lesson 959 to Photosynthesis
    await client.query(`
      UPDATE lessons 
      SET title = '⚡Bio-energetics⚡[Photosynthesis] 📝 Test 1 📖' 
      WHERE id = 959
    `);
    console.log(`Renamed Lesson 959 to Photosynthesis variant.`);

    // 2. Create new lesson for Respiration
    // We fetch the data from 959 to copy it
    const lessonDataRes = await client.query(`SELECT * FROM lessons WHERE id = 959`);
    const lData = lessonDataRes.rows[0];

    const insertRes = await client.query(`
      INSERT INTO lessons (wp_id, chapter_id, subject_id, title, lesson_type, lesson_sub, order_index, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      null, // wp_id
      lData.chapter_id,
      lData.subject_id,
      '⚡Bio-energetics⚡[Respiration] 📝 Test 1 📖',
      lData.lesson_type,
      lData.lesson_sub,
      lData.order_index,
      lData.is_active
    ]);

    const newRespLessonId = insertRes.rows[0].id;
    console.log(`Created new Respiration lesson with ID: ${newRespLessonId}`);

    // 3. Update Explanations and Lesson IDs
    // Photosynthesis (keep lesson_id = 959, just update explanation)
    for (const item of photosynthesisUpdates) {
      await client.query(`
        UPDATE mcqs 
        SET explanation = $1 
        WHERE id = $2 AND lesson_id = 959
      `, [item.explanation, item.id]);
    }

    // Respiration (move to new lesson ID, update explanation)
    for (const item of respirationUpdates) {
      await client.query(`
        UPDATE mcqs 
        SET explanation = $1, lesson_id = $2 
        WHERE id = $3 AND lesson_id = 959
      `, [item.explanation, newRespLessonId, item.id]);
    }

    console.log(`All MCQs updated and migrated successfully!`);

    client.release();
  } catch (err) {
    console.error('Error applying split:', err);
  } finally {
    await pool.end();
  }
}

applySplit();
