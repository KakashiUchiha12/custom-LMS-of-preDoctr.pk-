const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/collections
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.created_at, COUNT(m.id)::int AS mcq_count
       FROM mcq_collections c
       LEFT JOIN saved_mcqs m ON m.collection_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch collections' }); }
});

// POST /api/collections
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await pool.query(
      'INSERT INTO mcq_collections (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create collection' }); }
});

// POST /api/collections/by-name  — find existing or create new collection by name
router.post('/by-name', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Check if already exists
    let { rows } = await pool.query(
      'SELECT id, name, created_at FROM mcq_collections WHERE user_id=$1 AND name=$2 LIMIT 1',
      [req.user.id, name]
    );
    if (rows.length > 0) return res.json({ ...rows[0], created: false });

    // Create new
    const result = await pool.query(
      'INSERT INTO mcq_collections (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.status(201).json({ ...result.rows[0], created: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to find or create collection' }); }
});

// GET /api/collections/by-name/:name/mcqs  — fetch saved MCQs in a named collection
router.get('/by-name/:name/mcqs', requireAuth, async (req, res) => {
  try {
    const { rows: col } = await pool.query(
      'SELECT id FROM mcq_collections WHERE user_id=$1 AND name=$2 LIMIT 1',
      [req.user.id, decodeURIComponent(req.params.name)]
    );
    if (!col.length) return res.json([]);

    const result = await pool.query(
      `SELECT sm.id AS saved_id, sm.mcq_data, sm.saved_at
       FROM saved_mcqs sm
       WHERE sm.collection_id = $1
       ORDER BY sm.saved_at DESC`,
      [col[0].id]
    );
    // Return each row as the mcq_data object augmented with saved_id
    res.json(result.rows.map(r => ({ ...r.mcq_data, _savedId: r.saved_id })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch MCQs by name' }); }
});

// DELETE /api/collections/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM mcq_collections WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete' }); }
});

// GET /api/collections/:id/mcqs
router.get('/:id/mcqs', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sm.id AS saved_id, sm.mcq_data, sm.saved_at
       FROM saved_mcqs sm JOIN mcq_collections c ON c.id=sm.collection_id
       WHERE sm.collection_id=$1 AND c.user_id=$2 ORDER BY sm.saved_at DESC`,
      [req.params.id, req.user.id]
    );
    res.json(result.rows.map(r => ({ ...r.mcq_data, _savedId: r.saved_id })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch MCQs' }); }
});

// POST /api/collections/:id/mcqs
router.post('/:id/mcqs', requireAuth, async (req, res) => {
  try {
    const { mcq_data } = req.body;
    const col = await pool.query(
      'SELECT id FROM mcq_collections WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
    );
    if (!col.rows.length) return res.status(404).json({ error: 'Collection not found' });
    const result = await pool.query(
      'INSERT INTO saved_mcqs (user_id, collection_id, mcq_data) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, req.params.id, JSON.stringify(mcq_data)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to save MCQ' }); }
});

// DELETE /api/collections/:id/mcqs/bulk  — delete multiple saved MCQs by their saved_ids
router.delete('/:id/mcqs/bulk', requireAuth, async (req, res) => {
  try {
    const { saved_ids } = req.body; // array of saved_mcqs.id
    if (!Array.isArray(saved_ids) || saved_ids.length === 0) {
      return res.status(400).json({ error: 'saved_ids must be a non-empty array' });
    }
    // Verify ownership via collection
    const { rows: col } = await pool.query(
      'SELECT id FROM mcq_collections WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
    );
    if (!col.length) return res.status(404).json({ error: 'Collection not found' });

    const result = await pool.query(
      `DELETE FROM saved_mcqs WHERE collection_id=$1 AND id = ANY($2::int[]) RETURNING id`,
      [req.params.id, saved_ids]
    );
    res.json({ deleted: result.rowCount });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to bulk-delete MCQs' }); }
});

// DELETE /api/collections/:id/mcqs/:mcqId
router.delete('/:id/mcqs/:mcqId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM saved_mcqs WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.mcqId, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete MCQ' }); }
});

module.exports = router;
