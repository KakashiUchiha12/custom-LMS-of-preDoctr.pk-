const { Client } = require('pg');
const client = new Client('postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms');

async function test() {
  await client.connect();
  const res1 = await client.query(`
    SELECT m.chapter, count(*)
    FROM mcqs m
    LEFT JOIN lessons l ON m.chapter_id = l.chapter_id AND m.chapter ILIKE '%' || REPLACE(l.title, '''', '') || '%'
    WHERE m.chapter_id IS NOT NULL AND l.id IS NULL
    GROUP BY m.chapter
    ORDER BY count DESC
    LIMIT 20;
  `);
  console.log('Unmatched chapters:', res1.rows);
  await client.end();
}

test().catch(console.error);
