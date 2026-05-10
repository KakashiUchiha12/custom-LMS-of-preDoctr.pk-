const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function processNewMcqs() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Read the new MCQs from file
    const newMcqs = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_mcqs.json'), 'utf8'));
    console.log(`📊 Total new MCQs provided: ${newMcqs.length}`);

    // 2. Fetch existing MCQs for chapter 125 to avoid duplicates
    const { rows: existingMcqs } = await client.query(
      `SELECT question_text FROM mcqs WHERE chapter_id = 125 AND is_active = TRUE`
    );
    const existingTexts = new Set(existingMcqs.map(m => m.question_text.trim()));
    console.log(`📚 Found ${existingTexts.size} existing questions in Chapter 125.`);

    // 3. Filter out duplicates
    const candidates = [];
    for (const mcq of newMcqs) {
      const text = mcq.question_text.trim();
      if (!existingTexts.has(text)) {
        candidates.push(mcq);
      }
    }
    console.log(`🔍 Found ${candidates.length} new unique questions to add.`);

    if (candidates.length < 89) {
      console.log('⚠️ Not enough unique questions to fulfill the request (need 24 + 65 = 89). Adding all available.');
    }

    // 4. Split into Test A and Test 3
    const toAddTestA = candidates.slice(0, 24);
    const toAddTest3 = candidates.slice(24, 24 + 65);

    console.log(`📝 Planning to add ${toAddTestA.length} to Test A (941)`);
    console.log(`📝 Planning to add ${toAddTest3.length} to Test 3 (944)`);

    async function insertGroup(mcqList, lessonId) {
      let count = 0;
      for (const mcq of mcqList) {
        const option_a = mcq.options[0];
        const option_b = mcq.options[1];
        const option_c = mcq.options[2];
        const option_d = mcq.options[3];

        let correct_opt = 'A';
        if (mcq.correct_answer === option_b) correct_opt = 'B';
        if (mcq.correct_answer === option_c) correct_opt = 'C';
        if (mcq.correct_answer === option_d) correct_opt = 'D';

        await client.query(
          `INSERT INTO mcqs (chapter_id, lesson_id, question_text, option_a, option_b, option_c, option_d, correct_opt, explanation, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)`,
          [125, lessonId, mcq.question_text, option_a, option_b, option_c, option_d, correct_opt, mcq.explanation]
        );
        count++;
      }
      return count;
    }

    const addedA = await insertGroup(toAddTestA, 941);
    const added3 = await insertGroup(toAddTest3, 944);

    console.log(`\n✅ Successfully added ${addedA} MCQs to Test A.`);
    console.log(`✅ Successfully added ${added3} MCQs to Test 3.`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

processNewMcqs();
