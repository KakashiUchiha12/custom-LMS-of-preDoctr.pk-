const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportChapter() {
  const chapterId = 127; // Biological Molecules

  try {
    const client = await pool.connect();
    
    // Fetch all MCQs for Chapter 127 with lesson title
    const res = await client.query(`
      SELECT m.id, m.question_text, m.option_a, m.option_b, m.option_c, m.option_d, m.correct_opt, m.explanation, l.title as lesson_title
      FROM mcqs m
      LEFT JOIN lessons l ON m.lesson_id = l.id
      WHERE m.chapter_id = $1 AND m.is_active = TRUE
      ORDER BY l.id ASC, m.id ASC
    `, [chapterId]);

    const mcqs = res.rows.map(row => ({
      id: row.id,
      lesson_title: row.lesson_title || "Unassigned",
      question: row.question_text,
      options: [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean),
      correct_answer: row[`option_${row.correct_opt}`] || row.correct_opt,
      explanation: row.explanation
    }));

    const outputPath = path.join(__dirname, 'biological_molecules_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(mcqs, null, 2));

    console.log(`Successfully exported ${mcqs.length} MCQs to ${outputPath}`);

    client.release();
  } catch (err) {
    console.error('Error exporting MCQs:', err);
  } finally {
    await pool.end();
  }
}

exportChapter();
