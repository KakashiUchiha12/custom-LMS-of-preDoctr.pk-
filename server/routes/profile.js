const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// POST /api/profile/complete  — save onboarding data
router.post('/complete', requireAuth, async (req, res) => {
  try {
    const { fullName, whatsapp, gender, province, city, targetYear, college } = req.body;
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name), whatsapp=$2, gender=$3,
           province=$4, city=$5, target_year=$6, college=$7, last_seen=NOW()
       WHERE id = $8 RETURNING *`,
      [fullName, whatsapp, gender, province, city, targetYear, college, req.user.id]
    );
    const u = result.rows[0];
    res.json({
      success: true,
      profile: { fullName: u.name, whatsapp: u.whatsapp, gender: u.gender,
        province: u.province, city: u.city, targetYear: u.target_year, college: u.college },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  const u = req.user;
  res.json({ fullName: u.name, whatsapp: u.whatsapp, gender: u.gender,
    province: u.province, city: u.city, targetYear: u.target_year, college: u.college });
});

module.exports = router;
