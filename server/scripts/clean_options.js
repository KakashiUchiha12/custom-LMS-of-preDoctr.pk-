const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanAllOptions() {
  const client = await pool.connect();
  try {
    // Query ALL active MCQs in the database
    const res = await client.query(`
      SELECT id, option_a, option_b, option_c, option_d 
      FROM mcqs 
      WHERE is_active = TRUE
    `);

    console.log(`Checking ${res.rows.length} active MCQs in the entire database...`);
    let updatedCount = 0;

    // Regexes to match:
    // 1. "A. ", "A) ", "A.  " (with optional spaces)
    // 2. "(A) ", "(A)  "
    const prefixARegex = /^([A]\s*[.)]\s*|\([A]\)\s*)/i;
    const prefixBRegex = /^([B]\s*[.)]\s*|\([B]\)\s*)/i;
    const prefixCRegex = /^([C]\s*[.)]\s*|\([C]\)\s*)/i;
    const prefixDRegex = /^([D]\s*[.)]\s*|\([D]\)\s*)/i;

    for (const row of res.rows) {
      let needsUpdate = false;
      let newA = row.option_a;
      let newB = row.option_b;
      let newC = row.option_c;
      let newD = row.option_d;

      if (newA && prefixARegex.test(newA)) {
        newA = newA.replace(prefixARegex, '');
        needsUpdate = true;
      }
      if (newB && prefixBRegex.test(newB)) {
        newB = newB.replace(prefixBRegex, '');
        needsUpdate = true;
      }
      if (newC && prefixCRegex.test(newC)) {
        newC = newC.replace(prefixCRegex, '');
        needsUpdate = true;
      }
      if (newD && prefixDRegex.test(newD)) {
        newD = newD.replace(prefixDRegex, '');
        needsUpdate = true;
      }

      if (needsUpdate) {
        await client.query(`
          UPDATE mcqs 
          SET option_a = $1, option_b = $2, option_c = $3, option_d = $4 
          WHERE id = $5
        `, [newA, newB, newC, newD, row.id]);
        updatedCount++;
        
        if (updatedCount % 500 === 0) {
          console.log(`Progress: Updated ${updatedCount} MCQs...`);
        }
      }
    }

    console.log(`Successfully cleaned options for ${updatedCount} MCQs in the entire database.`);

  } catch (err) {
    console.error('Error cleaning options:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanAllOptions();
