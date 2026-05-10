const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function deduplicate() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // Fetch all active MCQs for Chapter 125
    const { rows: mcqs } = await client.query(
      `SELECT id, question_text, lesson_id 
       FROM mcqs 
       WHERE chapter_id = $1 AND is_active = TRUE`,
      [125]
    );

    console.log(`📊 Total MCQs before deduplication: ${mcqs.length}`);

    // Group by question_text
    const grouped = {};
    for (const mcq of mcqs) {
      const text = mcq.question_text.trim();
      if (!grouped[text]) grouped[text] = [];
      grouped[text].push(mcq);
    }

    const idsToDeactivate = [];

    for (const text in grouped) {
      const group = grouped[text];
      if (group.length > 1) {
        // Sort to prioritize keeping the one that has a lesson_id
        group.sort((a, b) => {
          if (a.lesson_id && !b.lesson_id) return -1;
          if (!a.lesson_id && b.lesson_id) return 1;
          return a.id - b.id; // Fallback to older ID
        });

        // Keep the first one, deactivate the rest
        for (let i = 1; i < group.length; i++) {
          idsToDeactivate.push(group[i].id);
        }
      }
    }

    console.log(`🗑️ Found ${idsToDeactivate.length} duplicate instances to deactivate.`);

    if (idsToDeactivate.length > 0) {
      // Update in chunks to be safe
      const CHUNK_SIZE = 500;
      for (let i = 0; i < idsToDeactivate.length; i += CHUNK_SIZE) {
        const chunk = idsToDeactivate.slice(i, i + CHUNK_SIZE);
        await client.query(
          `UPDATE mcqs SET is_active = FALSE WHERE id = ANY($1)`,
          [chunk]
        );
      }
      console.log(`✅ Successfully deactivated ${idsToDeactivate.length} duplicates!`);
    }

    // Check new counts
    const { rows: newCount } = await client.query(
      `SELECT COUNT(*) FROM mcqs WHERE chapter_id = $1 AND is_active = TRUE`,
      [125]
    );
    console.log(`📊 Total MCQs after deduplication: ${newCount[0].count}`);

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

deduplicate();
