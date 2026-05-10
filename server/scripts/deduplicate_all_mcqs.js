const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function deduplicateAll() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    // 1. Get all distinct chapter IDs that have MCQs
    const { rows: chapters } = await client.query(
      `SELECT DISTINCT chapter_id FROM mcqs WHERE is_active = TRUE AND chapter_id IS NOT NULL`
    );

    console.log(`🔍 Found ${chapters.length} chapters to process.`);

    let totalDeactivated = 0;
    const idsToDeactivate = [];

    // 2. Process each chapter
    for (const row of chapters) {
      const chapterId = row.chapter_id;
      
      const { rows: mcqs } = await client.query(
        `SELECT id, question_text, lesson_id 
         FROM mcqs 
         WHERE chapter_id = $1 AND is_active = TRUE`,
        [chapterId]
      );

      const grouped = {};
      for (const mcq of mcqs) {
        if (!mcq.question_text) continue;
        const text = mcq.question_text.trim();
        if (!grouped[text]) grouped[text] = [];
        grouped[text].push(mcq);
      }

      for (const text in grouped) {
        const group = grouped[text];
        if (group.length > 1) {
          // Sort to prioritize keeping the one that has a lesson_id
          group.sort((a, b) => {
            if (a.lesson_id && !b.lesson_id) return -1;
            if (!a.lesson_id && b.lesson_id) return 1;
            return a.id - b.id;
          });

          // Keep the first one, deactivate the rest
          for (let i = 1; i < group.length; i++) {
            idsToDeactivate.push(group[i].id);
          }
        }
      }
    }

    console.log(`🗑️ Total duplicate instances found across all chapters: ${idsToDeactivate.length}`);

    // 3. Deactivate duplicates in chunks
    if (idsToDeactivate.length > 0) {
      const CHUNK_SIZE = 1000;
      for (let i = 0; i < idsToDeactivate.length; i += CHUNK_SIZE) {
        const chunk = idsToDeactivate.slice(i, i + CHUNK_SIZE);
        await client.query(
          `UPDATE mcqs SET is_active = FALSE WHERE id = ANY($1)`,
          [chunk]
        );
        console.log(`   Deactivated chunk ${i / CHUNK_SIZE + 1}...`);
      }
      console.log(`✅ Successfully deactivated ${idsToDeactivate.length} duplicates in total!`);
    }

    client.release();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

deduplicateAll();
