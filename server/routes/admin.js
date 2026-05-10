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
      `SELECT id, name, email, whatsapp, province, city, role, access_level, created_at, last_seen
       FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length-1} OFFSET $${params.length}`,
      params
    );
    res.json({ users: result.rows, total: countResult.rows[0].count, page: +page, limit: +limit });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch users' }); }
});

// PUT /api/admin/users/:id/access
router.put('/users/:id/access', async (req, res) => {
  try {
    const { accessLevel } = req.body;
    if (!['free', 'paid'].includes(accessLevel)) return res.status(400).json({ error: 'Invalid level' });
    const result = await pool.query(
      'UPDATE users SET access_level=$1 WHERE id=$2 RETURNING id, name, access_level',
      [accessLevel, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update' }); }
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

module.exports = router;
