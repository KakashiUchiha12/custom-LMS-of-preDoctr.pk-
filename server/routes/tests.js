const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// POST /api/tests/results
router.post('/results', requireAuth, async (req, res) => {
  try {
    const { subject, topic, score, total, time_taken_seconds, chapter_id } = req.body;
    const result = await pool.query(
      `INSERT INTO test_results (user_id, subject, topic, score, total, time_taken_seconds, chapter_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, subject, topic, score, total, time_taken_seconds || null, chapter_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to save result' }); }
});

// GET /api/tests/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM test_results WHERE user_id=$1 ORDER BY completed_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch history' }); }
});

// GET /api/tests/stats  — dashboard summary
// Returns: total_mcqs_solved, total_tests, current_streak, total_study_seconds, last_test_at
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const uid = req.user.id;

    // Aggregate totals
    const { rows: agg } = await pool.query(
      `SELECT
         COALESCE(SUM(score), 0)::int                  AS total_correct,
         COALESCE(SUM(total), 0)::int                  AS total_mcqs_attempted,
         COUNT(*)::int                                  AS total_tests,
         COALESCE(SUM(time_taken_seconds), 0)::int      AS total_study_seconds,
         MAX(completed_at)                              AS last_test_at
       FROM test_results WHERE user_id = $1`,
      [uid]
    );

    // Streak: count distinct calendar days (in local UTC) in reverse order
    // until there is a gap > 1 day
    const { rows: days } = await pool.query(
      `SELECT DISTINCT DATE(completed_at AT TIME ZONE 'UTC') AS day
       FROM test_results
       WHERE user_id = $1
       ORDER BY day DESC`,
      [uid]
    );

    let streak = 0;
    if (days.length > 0) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      let expected = new Date(today);

      // Allow today or yesterday to start the streak
      const firstDay = new Date(days[0].day);
      const diffFromToday = Math.floor((today - firstDay) / 86400000);
      if (diffFromToday <= 1) {
        expected = firstDay;
        for (const { day } of days) {
          const d = new Date(day);
          const diff = Math.floor((expected - d) / 86400000);
          if (diff === 0) { streak++; expected = new Date(d); expected.setUTCDate(expected.getUTCDate() - 1); }
          else break;
        }
      }
    }

    // Per-subject progress (last result per subject)
    const { rows: subjects } = await pool.query(
      `SELECT DISTINCT ON (subject) subject, topic, score, total, completed_at
       FROM test_results WHERE user_id=$1
       ORDER BY subject, completed_at DESC`,
      [uid]
    );

    res.json({
      ...agg[0],
      current_streak: streak,
      recent_subjects: subjects,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch stats' }); }
});

module.exports = router;
