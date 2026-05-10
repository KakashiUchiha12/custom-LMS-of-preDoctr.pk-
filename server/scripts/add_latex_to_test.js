const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addLatexToTest() {
  const client = await pool.connect();
  try {
    const lessonId = 958; // Respiration Test A

    const res = await client.query(`
      SELECT id, question_text, option_a, option_b, option_c, option_d, explanation 
      FROM mcqs 
      WHERE lesson_id = $1 AND is_active = TRUE
    `, [lessonId]);

    console.log(`Scanning ${res.rows.length} MCQs in Lesson 958...`);
    let updatedCount = 0;

    for (const row of res.rows) {
      let needsUpdate = false;
      let newQ = row.question_text;
      let newA = row.option_a;
      let newB = row.option_b;
      let newC = row.option_c;
      let newD = row.option_d;
      let newExp = row.explanation;

      // Helper function to replace CO2 and H2O with LaTeX versions
      const replaceFormulas = (text) => {
        if (!text) return text;
        return text
          .replace(/\bCO2\b/g, '$CO_2$')
          .replace(/\bH2O\b/g, '$H_2O$');
      };

      const fields = [
        { orig: row.question_text, curr: newQ, setter: (val) => newQ = val },
        { orig: row.option_a, curr: newA, setter: (val) => newA = val },
        { orig: row.option_b, curr: newB, setter: (val) => newB = val },
        { orig: row.option_c, curr: newC, setter: (val) => newC = val },
        { orig: row.option_d, curr: newD, setter: (val) => newD = val },
        { orig: row.explanation, curr: newExp, setter: (val) => newExp = val }
      ];

      for (const field of fields) {
        if (field.orig) {
          const processed = replaceFormulas(field.orig);
          if (processed !== field.orig) {
            field.setter(processed);
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        await client.query(`
          UPDATE mcqs 
          SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5, explanation = $6 
          WHERE id = $7
        `, [newQ, newA, newB, newC, newD, newExp, row.id]);
        updatedCount++;
      }
    }

    console.log(`Successfully added LaTeX formatting to ${updatedCount} MCQs in Lesson 958.`);

  } catch (err) {
    console.error('Error adding LaTeX:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addLatexToTest();
