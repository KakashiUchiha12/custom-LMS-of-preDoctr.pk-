const { Client } = require('pg');
const client = new Client('postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms');

async function test() {
  await client.connect();
  const res1 = await client.query(`
    SELECT m.chapter as mcq_chapter, l.title as lesson_title
    FROM mcqs m
    JOIN lessons l ON m.chapter_id = l.chapter_id
    WHERE m.chapter ILIKE '%' || l.title || '%'
    LIMIT 10;
  `);
  console.log('Matches:', res1.rows);
  
  const res2 = await client.query(`
    SELECT COUNT(*) FROM mcqs m
    JOIN lessons l ON m.chapter_id = l.chapter_id
    WHERE m.chapter ILIKE '%' || REPLACE(l.title, '''', '') || '%'
  `);
  console.log('Total matches:', res2.rows[0].count);

  const totalLinked = await client.query(`SELECT COUNT(*) FROM mcqs WHERE chapter_id IS NOT NULL`);
  console.log('Total MCQs linked to chapters:', totalLinked.rows[0].count);

  await client.end();
}

test().catch(console.error);
