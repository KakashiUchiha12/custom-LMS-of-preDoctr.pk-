const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDataIntegrity() {
  const chapterId = 125; // Acellular life

  try {
    const client = await pool.connect();
    
    // 5. Data Integrity Issues
    console.log(`\n--- 5. DATA INTEGRITY ISSUES ---`);
    const allMcqsRes = await client.query(`SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM mcqs WHERE chapter_id = $1 AND is_active = TRUE`, [chapterId]);
    const mcqs = allMcqsRes.rows;

    let missingOptions = 0;
    let missingCorrectAns = 0;
    let mismatchCorrectAns = 0;
    let emptyQuestion = 0;

    mcqs.forEach(mcq => {
      if (!mcq.question_text || mcq.question_text.trim() === '') emptyQuestion++;
      
      const opts = [mcq.option_a, mcq.option_b, mcq.option_c, mcq.option_d].filter(o => o !== null && o !== undefined && o.trim() !== '');
      if (opts.length < 2) missingOptions++;
      
      if (!mcq.correct_answer || mcq.correct_answer.trim() === '') {
        missingCorrectAns++;
      } else {
        // Correct answer might be 'A', 'B', 'C', 'D' or the actual text. 
        // We'll just check if it's not null. Usually it's A, B, C, D in this kind of schema.
        const validAnswers = ['a', 'b', 'c', 'd', 'option_a', 'option_b', 'option_c', 'option_d'];
        if (!validAnswers.includes(mcq.correct_answer.toLowerCase().trim()) && !opts.includes(mcq.correct_answer)) {
           // Not matching A,B,C,D and not matching the text
           // Let's just log a few to see what they look like
           if (mismatchCorrectAns < 3) {
             // console.log(`Sample mismatch: Correct Ans is '${mcq.correct_answer}', opts are`, opts);
           }
           mismatchCorrectAns++;
        }
      }
    });

    console.log(`- Empty Question Text: ${emptyQuestion}`);
    console.log(`- Missing or Invalid Options (less than 2 options): ${missingOptions}`);
    console.log(`- Missing Correct Answer: ${missingCorrectAns}`);
    console.log(`- Correct Answer Format Unknown: ${mismatchCorrectAns}`);

    client.release();
  } catch (err) {
    console.error("Error generating report:", err);
  } finally {
    await pool.end();
  }
}

checkDataIntegrity();
