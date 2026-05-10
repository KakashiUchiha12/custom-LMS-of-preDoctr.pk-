const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function processFederalMCQs() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'federal_mcqs_raw.json'), 'utf-8');
    const mcqs = JSON.parse(rawData);
    const client = await pool.connect();

    console.log(`Loaded ${mcqs.length} MCQs from JSON.`);

    const chapterId = 125;
    const lessonId = 948; // Federal Test

    // Check current count
    const countRes = await client.query(`SELECT COUNT(*) as count FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE`, [lessonId]);
    let currentCount = parseInt(countRes.rows[0].count, 10);
    console.log(`Current Federal Test (Lesson 948) count: ${currentCount}`);

    const targetCount = 100;
    const needed = targetCount - currentCount;

    if (needed <= 0) {
      console.log(`Target already reached or exceeded. Current count: ${currentCount}`);
      client.release();
      return;
    }

    console.log(`Need to add ${needed} more unique MCQs to reach ${targetCount}.`);

    let addedCount = 0;

    for (const mcq of mcqs) {
      if (addedCount >= needed) break;

      const qText = mcq.question.trim();

      // Check if this question already exists in Chapter 125
      const checkRes = await client.query(
        `SELECT id FROM mcqs WHERE chapter_id = $1 AND question_text = $2 AND is_active = TRUE`,
        [chapterId, qText]
      );

      if (checkRes.rows.length === 0) {
        // Find correct_opt index ('a', 'b', 'c', 'd')
        const optIndex = mcq.options.findIndex(o => o === mcq.answer);
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

    console.log(`\nSuccessfully added ${addedCount} MCQs to Federal Test (Lesson 948).`);

    // Verify final count
    const finalCountRes = await client.query(`SELECT COUNT(*) as count FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE`, [lessonId]);
    console.log(`Federal Test now has ${finalCountRes.rows[0].count} active MCQs.`);

    client.release();
  } catch (err) {
    console.error('Error processing MCQs:', err);
  } finally {
    await pool.end();
  }
}

processFederalMCQs();
