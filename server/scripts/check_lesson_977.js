const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function checkLesson() {
  const lessonId = 977;

  try {
    const client = await pool.connect();
    console.log(`Checking Lesson ${lessonId} for duplicates...\n`);

    const res = await client.query(`
      SELECT id, question_text 
      FROM mcqs 
      WHERE lesson_id = $1 AND is_active = TRUE
    `, [lessonId]);

    const mcqs = res.rows;
    console.log(`Total MCQs in Lesson ${lessonId}: ${mcqs.length}`);

    const seen = {};
    const duplicates = [];

    mcqs.forEach(mcq => {
      const normalized = normalizeText(mcq.question_text);
      if (seen[normalized]) {
        duplicates.push({
          normalized,
          original: mcq.question_text,
          ids: [seen[normalized].id, mcq.id]
        });
      } else {
        seen[normalized] = mcq;
      }
    });

    if (duplicates.length === 0) {
      console.log(`No duplicates found in Lesson ${lessonId} (even with normalization).`);
    } else {
      console.log(`\nFound ${duplicates.length} duplicate questions (or very similar):`);
      duplicates.forEach((d, i) => {
        console.log(`\nDuplicate ${i+1}:`);
        console.log(`- IDs: ${d.ids.join(', ')}`);
        console.log(`- Question: "${d.original}"`);
      });
    }

    client.release();
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

checkLesson();
