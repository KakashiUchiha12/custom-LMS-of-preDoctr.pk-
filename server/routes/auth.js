const express = require('express');
const { pool } = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/login  — mock Google login (finds or creates user)
router.post('/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length > 0) {
      user = result.rows[0];
      await pool.query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);
    } else {
      const ins = await pool.query(
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *`,
        [name || email.split('@')[0], email]
      );
      user = ins.rows[0];
    }

    const token = signToken(user.id);
    const onboardingComplete = !!(user.whatsapp && user.province && user.city);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessLevel: user.access_level,
        onboardingComplete,
        profile: {
          gender: user.gender,
          whatsapp: user.whatsapp,
          province: user.province,
          city: user.city,
          targetYear: user.target_year,
          college: user.college,
          fullName: user.name,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    accessLevel: u.access_level,
    onboardingComplete: !!(u.whatsapp && u.province && u.city),
    profile: {
      fullName: u.name,
      gender: u.gender,
      whatsapp: u.whatsapp,
      province: u.province,
      city: u.city,
      targetYear: u.target_year,
      college: u.college,
    },
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (_req, res) => res.json({ success: true }));

module.exports = router;
