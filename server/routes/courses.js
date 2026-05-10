/**
 * /api/subjects  — subjects, chapters, lessons
 *
 * IMPORTANT: specific routes (/chapters/...) must come BEFORE the wildcard
 * /:slug route, otherwise Express matches slug='chapters' first.
 */
const express = require('express');
const router  = express.Router();
const { pool } = require('../db');

// ── GET /api/subjects ─────────────────────────────────────────────────────────
// All active subjects ordered by order_index
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.id, s.wp_id, s.name, s.slug, s.emoji, s.type, s.order_index,
        COUNT(c.id)::int AS chapter_count
      FROM subjects s
      LEFT JOIN chapters c ON c.subject_id = s.id AND c.is_active = TRUE
      WHERE s.is_active = TRUE
      GROUP BY s.id
      ORDER BY s.order_index
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/subjects/chapters/:chapterId/lessons ─────────────────────────────
// Lessons for a chapter, grouped by lesson_type
// MUST be before /:slug to prevent 'chapters' matching as a slug
router.get('/chapters/:chapterId/lessons', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, wp_id, title, lesson_type, lesson_sub, order_index
       FROM lessons
       WHERE chapter_id = $1 AND is_active = TRUE
       ORDER BY
         CASE lesson_type
           WHEN 'notes'        THEN 1
           WHEN 'shortlisting' THEN 2
           WHEN 'test'         THEN 3
           WHEN 'board_book'   THEN 4
           WHEN 'past_paper'   THEN 5
           WHEN 'ocr'          THEN 6
           WHEN 'video'        THEN 7
           ELSE 8
         END,
         order_index`,
      [req.params.chapterId]
    );

    // Group by lesson_type
    const grouped = {};
    for (const l of rows) {
      if (!grouped[l.lesson_type]) grouped[l.lesson_type] = [];
      grouped[l.lesson_type].push(l);
    }

    res.json({ lessons: rows, grouped });
  } catch (err) { next(err); }
});

// ── GET /api/subjects/chapters/:chapterId/mcqs?limit=20&offset=0 ──────────────
// Paginated MCQs for a chapter, optionally filtered by lessonId
router.get('/chapters/:chapterId/mcqs', async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const lessonId = req.query.lessonId ? parseInt(req.query.lessonId, 10) : null;
    console.log(`[DEBUG] GET MCQs for chapter ${req.params.chapterId}, lessonId received: ${req.query.lessonId}, parsed: ${lessonId}`);

    let query = `SELECT id, wp_id, question_text, option_a, option_b, option_c, option_d,
              correct_opt, explanation, lesson_id, image_url
       FROM mcqs
       WHERE chapter_id = $1 AND is_active = TRUE`;
    let countQuery = 'SELECT COUNT(*)::int AS total FROM mcqs WHERE chapter_id = $1 AND is_active = TRUE';
    
    const params = [req.params.chapterId];
    const countParams = [req.params.chapterId];

    if (lessonId) {
      query += ` AND lesson_id = $2`;
      countQuery += ` AND lesson_id = $2`;
      params.push(lessonId);
      countParams.push(lessonId);
    }

    query += ` ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    const { rows: cnt } = await pool.query(countQuery, countParams);

    res.json({ total: cnt[0].total, limit, offset, mcqs: rows });
  } catch (err) { next(err); }
});

// ── GET /api/subjects/:slug ───────────────────────────────────────────────────
// Single subject with its chapter list
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows: sub } = await pool.query(
      `SELECT id, wp_id, name, slug, emoji, type, order_index
       FROM subjects WHERE slug = $1 AND is_active = TRUE`,
      [req.params.slug]
    );
    if (!sub.length) return res.status(404).json({ error: 'Subject not found' });

    const { rows: chapters } = await pool.query(
      `SELECT c.id, c.wp_id, c.name, c.slug, c.emoji, c.order_index,
              COUNT(DISTINCT l.id)::int AS lesson_count,
              COUNT(DISTINCT m.id)::int AS mcq_count
       FROM chapters c
       LEFT JOIN lessons l ON l.chapter_id = c.id AND l.is_active = TRUE
       LEFT JOIN mcqs    m ON m.chapter_id = c.id  AND m.is_active = TRUE
       WHERE c.subject_id = $1 AND c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.order_index`,
      [sub[0].id]
    );

    res.json({ ...sub[0], chapters });
  } catch (err) { next(err); }
});

// ── GET /api/subjects/:slug/chapters ─────────────────────────────────────────
// Full chapter list for a subject (lightweight, no lessons)
router.get('/:slug/chapters', async (req, res, next) => {
  try {
    const { rows: sub } = await pool.query(
      'SELECT id FROM subjects WHERE slug = $1 AND is_active = TRUE',
      [req.params.slug]
    );
    if (!sub.length) return res.status(404).json({ error: 'Subject not found' });

    const { rows } = await pool.query(
      `SELECT c.id, c.wp_id, c.name, c.slug, c.emoji, c.order_index,
              COUNT(DISTINCT l.id)::int AS lesson_count,
              COUNT(DISTINCT m.id)::int AS mcq_count
       FROM chapters c
       LEFT JOIN lessons l ON l.chapter_id = c.id AND l.is_active = TRUE
       LEFT JOIN mcqs    m ON m.chapter_id = c.id  AND m.is_active = TRUE
       WHERE c.subject_id = $1 AND c.is_active = TRUE
       GROUP BY c.id ORDER BY c.order_index`,
      [sub[0].id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── DEBUG ROUTE ─────────────────────────────────────────────────────────────
router.get('/debug/lessons/:chapterId', async (req, res) => {
  try {
    const { rows: lessons } = await pool.query('SELECT id, title, lesson_type FROM lessons WHERE chapter_id = $1', [req.params.chapterId]);
    const { rows: mcqs } = await pool.query('SELECT id, lesson_id, chapter FROM mcqs WHERE chapter_id = $1 LIMIT 10', [req.params.chapterId]);
    res.json({ lessons, sample_mcqs: mcqs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
