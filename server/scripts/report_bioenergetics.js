const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateReport() {
  const chapterId = 126; // Bio-energetics

  try {
    const client = await pool.connect();
    console.log(`Starting report generation for Chapter ${chapterId}...\n`);

    // 1. Total Active MCQs
    const totalRes = await client.query(`SELECT COUNT(*) as count FROM mcqs WHERE chapter_id = $1 AND is_active = TRUE`, [chapterId]);
    const totalMCQs = parseInt(totalRes.rows[0].count, 10);
    console.log(`--- 1. OVERALL STATUS ---`);
    console.log(`Total Active MCQs: ${totalMCQs}`);

    // Fetch lesson names for mapping
    const lessonsRes = await client.query(`SELECT id, title FROM lessons WHERE chapter_id = $1`, [chapterId]);
    const lessonMap = {};
    lessonsRes.rows.forEach(r => lessonMap[r.id] = r.title);

    // 2. Breakdown by lesson_id
    const subtestRes = await client.query(`
      SELECT lesson_id, COUNT(*) as count 
      FROM mcqs 
      WHERE chapter_id = $1 AND is_active = TRUE 
      GROUP BY lesson_id 
      ORDER BY lesson_id
    `, [chapterId]);
    console.log(`\n--- 2. BREAKDOWN BY TEST (Lesson ID) ---`);
    subtestRes.rows.forEach(row => {
      const lessonName = row.lesson_id ? (lessonMap[row.lesson_id] || `Lesson ${row.lesson_id}`) : 'Unassigned';
      console.log(`- [${row.lesson_id || 'Null'}] ${lessonName}: ${row.count} MCQs`);
    });

    // 3. Missing Explanations
    const expRes = await client.query(`
      SELECT COUNT(*) as count 
      FROM mcqs 
      WHERE chapter_id = $1 AND is_active = TRUE 
      AND (explanation IS NULL OR TRIM(explanation) = '' OR explanation ILIKE 'n/a%')
    `, [chapterId]);
    console.log(`\n--- 3. MISSING EXPLANATIONS ---`);
    console.log(`MCQs without explanation: ${expRes.rows[0].count}`);

    // 4. Duplicates check
    const dupRes = await client.query(`
      SELECT question_text, COUNT(*) as count 
      FROM mcqs 
      WHERE chapter_id = $1 AND is_active = TRUE 
      GROUP BY question_text 
      HAVING COUNT(*) > 1
    `, [chapterId]);
    console.log(`\n--- 4. DUPLICATES ---`);
    let totalDuplicates = 0;
    if (dupRes.rows.length === 0) {
      console.log(`No duplicate active questions found!`);
    } else {
      dupRes.rows.forEach(r => totalDuplicates += (parseInt(r.count, 10) - 1));
      console.log(`WARNING: Found ${dupRes.rows.length} unique questions that have duplicates.`);
      console.log(`Total excess duplicate records: ${totalDuplicates}`);
    }

    // 5. Data Integrity Issues
    console.log(`\n--- 5. DATA INTEGRITY ISSUES ---`);
    const allMcqsRes = await client.query(`SELECT id, question_text, option_a, option_b, option_c, option_d, correct_opt FROM mcqs WHERE chapter_id = $1 AND is_active = TRUE`, [chapterId]);
    const mcqs = allMcqsRes.rows;

    let missingOptions = 0;
    let missingCorrectAns = 0;
    let mismatchCorrectAns = 0;
    let emptyQuestion = 0;

    mcqs.forEach(mcq => {
      if (!mcq.question_text || mcq.question_text.trim() === '') emptyQuestion++;
      
      const opts = [mcq.option_a, mcq.option_b, mcq.option_c, mcq.option_d].filter(o => o !== null && o !== undefined && o.trim() !== '');
      if (opts.length < 2) missingOptions++;
      
      if (!mcq.correct_opt || mcq.correct_opt.trim() === '') {
        missingCorrectAns++;
      } else {
        const validAnswers = ['a', 'b', 'c', 'd'];
        if (!validAnswers.includes(mcq.correct_opt.toLowerCase().trim())) {
           mismatchCorrectAns++;
        }
      }
    });

    console.log(`- Empty Question Text: ${emptyQuestion}`);
    console.log(`- Missing or Invalid Options (less than 2 options): ${missingOptions}`);
    console.log(`- Missing Correct Answer (correct_opt): ${missingCorrectAns}`);
    console.log(`- Correct Answer Format Unknown (not A,B,C,D): ${mismatchCorrectAns}`);

    client.release();
  } catch (err) {
    console.error("Error generating report:", err);
  } finally {
    await pool.end();
  }
}

generateReport();
