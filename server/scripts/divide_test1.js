const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function divideTest() {
  const chapterId = 127; // Biological Molecules
  const sourceLessonId = 977; // Test 1
  const newLessonTitle = "📝 Test 5📖";

  try {
    const client = await pool.connect();
    
    // 1. Check if Test 5 already exists
    const lessonRes = await client.query('SELECT id FROM lessons WHERE title = $1 AND chapter_id = $2', [newLessonTitle, chapterId]);
    
    let targetLessonId;
    if (lessonRes.rows.length === 0) {
      console.log('Test 5 not found. Creating it...');
      
      // Find max order_index for this chapter
      const orderRes = await client.query('SELECT MAX(order_index) as max_order FROM lessons WHERE chapter_id = $1', [chapterId]);
      const nextOrder = (orderRes.rows[0].max_order || 0) + 1;
      
      // Find safe wp_id
      const wpIdRes = await client.query('SELECT MIN(wp_id) as min_wp FROM lessons');
      const nextWpId = Math.min(0, wpIdRes.rows[0].min_wp || 0) - 1;
      
      // Get subject_id from chapter
      const subjectRes = await client.query('SELECT subject_id FROM chapters WHERE id = $1', [chapterId]);
      const subjectId = subjectRes.rows[0].subject_id;

      const { type: lType, sub: lSub } = { type: 'test', sub: '5' }; // Mock classifyLesson

      const insertRes = await client.query(
        `INSERT INTO lessons (wp_id, chapter_id, subject_id, title, lesson_type, lesson_sub, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [nextWpId, chapterId, subjectId, newLessonTitle, lType, lSub, nextOrder]
      );
      targetLessonId = insertRes.rows[0].id;
      console.log(`Created Test 5 with ID: ${targetLessonId}`);
    } else {
      targetLessonId = lessonRes.rows[0].id;
      console.log(`Found existing Test 5 with ID: ${targetLessonId}`);
    }

    // 2. Fetch all MCQs for Test 1
    const mcqsRes = await client.query(`
      SELECT id FROM mcqs 
      WHERE lesson_id = $1 AND is_active = TRUE
      ORDER BY id ASC
    `, [sourceLessonId]);

    const mcqs = mcqsRes.rows;
    console.log(`Total MCQs in Test 1: ${mcqs.length}`);

    if (mcqs.length <= 1) {
      console.log('Not enough MCQs to divide.');
      client.release();
      return;
    }

    const half = Math.ceil(mcqs.length / 2);
    const mcqsToMove = mcqs.slice(half);

    console.log(`Moving ${mcqsToMove.length} MCQs to Test 5...`);

    const moveIds = mcqsToMove.map(m => m.id);
    
    // Update lesson_id
    const updateRes = await client.query(`
      UPDATE mcqs 
      SET lesson_id = $1 
      WHERE id = ANY($2)
    `, [targetLessonId, moveIds]);

    console.log(`Successfully moved ${updateRes.rowCount} MCQs to Lesson ${targetLessonId}.`);
    
    // Verify counts
    const test1Count = await client.query('SELECT COUNT(*) FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE', [sourceLessonId]);
    const test5Count = await client.query('SELECT COUNT(*) FROM mcqs WHERE lesson_id = $1 AND is_active = TRUE', [targetLessonId]);

    console.log(`\nVerification:`);
    console.log(`- Test 1 now has: ${test1Count.rows[0].count} MCQs`);
    console.log(`- Test 5 now has: ${test5Count.rows[0].count} MCQs`);

    client.release();
  } catch (err) {
    console.error('Error dividing test:', err);
  } finally {
    await pool.end();
  }
}

divideTest();
