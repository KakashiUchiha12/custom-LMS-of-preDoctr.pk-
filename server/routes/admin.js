const express = require('express');
const { pool } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [today, total, paid, testsToday] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int FROM users WHERE created_at >= NOW()-INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*)::int FROM users`),
      pool.query(`SELECT COUNT(*)::int FROM users WHERE access_level='paid'`),
      pool.query(`SELECT COUNT(*)::int FROM test_results WHERE completed_at >= NOW()-INTERVAL '24 hours'`),
    ]);
    res.json({
      newUsersToday: today.rows[0].count,
      totalUsers: total.rows[0].count,
      paidUsers: paid.rows[0].count,
      testsToday: testsToday.rows[0].count,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// GET /api/admin/users?search=&filter=all|paid|free&page=1&limit=20
router.get('/users', async (req, res) => {
  try {
    const { search = '', filter = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length} OR whatsapp ILIKE $${params.length})`);
    }
    if (filter === 'paid') conditions.push(`access_level='paid'`);
    if (filter === 'free') conditions.push(`access_level='free'`);

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const countResult = await pool.query(`SELECT COUNT(*)::int FROM users ${where}`, params);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT id, name, email, whatsapp, province, city, role, access_level, has_mcq_access, has_lecture_access, full_access_until, created_at, last_seen
       FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    res.json({ users: result.rows, total: countResult.rows[0].count, page: +page, limit: +limit });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch users' }); }
});

// PUT /api/admin/users/:id/access
router.put('/users/:id/access', async (req, res) => {
  try {
    const { accessLevel, has_mcq_access, has_lecture_access, give_full_access_24h } = req.body;
    
    let query = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    if (accessLevel) {
      params.push(accessLevel);
      updates.push(`access_level = $${params.length}`);
    }
    if (has_mcq_access !== undefined) {
      params.push(has_mcq_access);
      updates.push(`has_mcq_access = $${params.length}`);
    }
    if (has_lecture_access !== undefined) {
      params.push(has_lecture_access);
      updates.push(`has_lecture_access = $${params.length}`);
    }
    if (give_full_access_24h) {
      updates.push(`full_access_until = NOW() + INTERVAL '24 hours'`);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });

    params.push(req.params.id);
    query += updates.join(', ') + ` WHERE id = $${params.length} RETURNING id, name, access_level, has_mcq_access, has_lecture_access, full_access_until`;

    const result = await pool.query(query, params);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'Failed to update user access' }); 
  }
});

// GET /api/admin/registrations  — last 7 days for bar chart
router.get('/registrations', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT to_char(d, 'Dy') AS day, COALESCE(COUNT(u.id)::int, 0) AS users
       FROM generate_series(NOW()-INTERVAL '6 days', NOW(), '1 day') AS d
       LEFT JOIN users u ON DATE_TRUNC('day', u.created_at) = DATE_TRUNC('day', d)
       GROUP BY d ORDER BY d`
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch registrations' }); }
});

// GET /api/admin/mcqs?search=&subject=&page=1&limit=20
router.get('/mcqs', async (req, res) => {
  try {
    const { search = '', subject = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(m.question_text ILIKE $${params.length} OR m.id::text ILIKE $${params.length})`);
    }
    if (subject && subject !== 'All Subjects') {
      params.push(subject);
      conditions.push(`m.subject = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    
    // Fix: Use separate params for count query to avoid issues with limit/offset params
    const countResult = await pool.query(`SELECT COUNT(*)::int FROM mcqs m ${where}`, params);

    const queryParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT m.id, m.question_text, m.option_a, m.option_b, m.option_c, m.option_d, m.correct_opt, m.subject, m.chapter,
              c.name as chapter_name, s.name as subject_name
       FROM mcqs m
       LEFT JOIN chapters c ON m.chapter_id = c.id
       LEFT JOIN subjects s ON c.subject_id = s.id
       ${where} 
       ORDER BY m.id DESC 
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );
    
    // Fallback for subject/chapter names if join returns null
    const processedMcqs = result.rows.map(row => ({
      ...row,
      subject: row.subject_name || row.subject || 'Unknown',
      chapter: row.chapter_name || row.chapter || 'Unknown'
    }));

    res.json({ mcqs: processedMcqs, total: countResult.rows[0].count, page: +page, limit: +limit });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'Failed to fetch MCQs' }); 
  }
});

// DELETE /api/admin/mcqs/:id
router.delete('/mcqs/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mcqs WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'MCQ not found' });
    res.json({ message: 'MCQ deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete MCQ' });
  }
});

// PUT /api/admin/mcqs/:id
router.put('/mcqs/:id', async (req, res) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d, correct_opt, subject, chapter } = req.body;
    const result = await pool.query(
      `UPDATE mcqs 
       SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, option_d = $5, correct_opt = $6, subject = $7, chapter = $8
       WHERE id = $9 RETURNING id`,
      [question_text, option_a, option_b, option_c, option_d, correct_opt, subject, chapter, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'MCQ not found' });
    res.json({ message: 'MCQ updated successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update MCQ' });
  }
});

// POST /api/admin/mcqs
router.post('/mcqs', async (req, res) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d, correct_opt, subject, chapter } = req.body;
    const result = await pool.query(
      `INSERT INTO mcqs (question_text, option_a, option_b, option_c, option_d, correct_opt, subject, chapter, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE) RETURNING id`,
      [question_text, option_a, option_b, option_c, option_d, correct_opt, subject, chapter]
    );
    res.json({ message: 'MCQ created successfully', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
});

module.exports = router;
