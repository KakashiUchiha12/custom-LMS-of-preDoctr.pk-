const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function processMCQs() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'test3_mcqs_raw.json'), 'utf-8');
    const mcqs = JSON.parse(rawData);
    const client = await pool.connect();

    console.log(`Loaded ${mcqs.length} MCQs from JSON.`);

    const chapterId = 125;
    const lessonId = 944; // Test 3
    let addedCount = 0;
    const targetAdd = 25;

    for (const mcq of mcqs) {
      if (addedCount >= targetAdd) break;

      const qText = mcq.question_text.trim();

      // Check if this question already exists in Chapter 125
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
        // Find correct_opt index ('a', 'b', 'c', 'd')
        const optIndex = mcq.options.findIndex(o => o === mcq.correct_answer);
        if (optIndex === -1) {
            console.log(`Warning: Could not match correct answer for "${qText.substring(0, 30)}..."`);
            continue;
        }
        const correctOptLetter = ['a', 'b', 'c', 'd'][optIndex];

        await client.query(`
          INSERT INTO mcqs (
            subject, chapter, chapter_id, lesson_id, 
            question_text, option_a, option_b, option_c, option_d, 
            correct_opt, explanation, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          'Biology', 'Acellular life (variety of life)', chapterId, lessonId,
          qText, mcq.options[0], mcq.options[1], mcq.options[2], mcq.options[3],
          correctOptLetter, mcq.explanation, true
        ]);
        
        addedCount++;
        console.log(`Added: ${qText.substring(0, 50)}...`);
      } else {
        console.log(`Skipped (Already exists): ${qText.substring(0, 50)}...`);
      }
    }

    console.log(`\nSuccessfully added ${addedCount} MCQs to Test 3 (Lesson 944).`);

    // Verify current count for Test 3
    const countRes = await client.query(`
        SELECT COUNT(*) as count FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE
    `, [lessonId]);
    console.log(`Test 3 now has ${countRes.rows[0].count} active MCQs.`);

    client.release();
  } catch (err) {
    console.error('Error processing MCQs:', err);
  } finally {
    await pool.end();
  }
}

processMCQs();
