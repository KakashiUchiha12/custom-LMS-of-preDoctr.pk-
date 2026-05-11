const express = require('express');
const { pool } = require('../db');
const http = require('http');
const router = express.Router();

// Helper to get city from IP
const getCity = (ip) => {
  return new Promise((resolve) => {
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      return resolve('Unknown');
    }
    const cleanIp = ip.split(',')[0].trim();
    http.get(`http://ip-api.com/json/${cleanIp}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'success') {
            resolve(parsed.city);
          } else {
            resolve('Unknown');
          }
        } catch (e) {
          resolve('Unknown');
        }
      });
    }).on('error', () => {
      resolve('Unknown');
    });
  });
};

const jwt = require('jsonwebtoken');

// POST /api/analytics/track
router.post('/track', async (req, res) => {
  const { sessionId, eventType, pageUrl, eventData } = req.body;
  
  // Optional auth: get user ID from token if logged in
  const token = req.headers.authorization?.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      userId = decoded.id;
    } catch (e) {
      // Ignore invalid token
    }
  }
  
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /mobile/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';
  
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const city = await getCity(ip);

  try {
    await pool.query(
      `INSERT INTO analytics_events 
       (user_id, session_id, event_type, page_url, event_data, city, device_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, sessionId, eventType, pageUrl, eventData ? JSON.stringify(eventData) : null, city, deviceType]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save analytics event:', error);
    res.status(500).json({ error: 'Failed to save event' });
  }
});

// GET /api/analytics/stats
router.get('/stats', async (req, res) => {
  const { from, to, granularity } = req.query;
  const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date().toISOString();
  
  let groupBy = "DATE_TRUNC('day', created_at)";
  let formatKey = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (granularity === 'hours') {
    groupBy = "DATE_TRUNC('hour', created_at)";
    formatKey = (date) => `${date.getHours().toString().padStart(2, '0')}:00`;
  } else if (granularity === 'months') {
    groupBy = "DATE_TRUNC('month', created_at)";
    formatKey = (date) => date.toLocaleDateString('en-US', { month: 'short' });
  }

  try {
    // 1. Get views and visitors
    const analyticsRes = await pool.query(
      `SELECT 
         ${groupBy} as bucket,
         COUNT(*) FILTER (WHERE event_type = 'page_view') as views,
         COUNT(DISTINCT session_id) as visitors
       FROM analytics_events
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [fromDate, toDate]
    );

    // 2. Get new users
    const usersRes = await pool.query(
      `SELECT 
         ${groupBy} as bucket,
         COUNT(*) as count
       FROM users
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [fromDate, toDate]
    );

    // 3. Merge data
    const dataMap = {};
    
    analyticsRes.rows.forEach(row => {
      const date = new Date(row.bucket);
      const key = formatKey(date);
      dataMap[key] = {
        name: key,
        views: parseInt(row.views),
        visitors: parseInt(row.visitors),
        newUsers: 0,
      };
    });

    usersRes.rows.forEach(row => {
      const date = new Date(row.bucket);
      const key = formatKey(date);
      if (dataMap[key]) {
        dataMap[key].newUsers = parseInt(row.count);
      } else {
        dataMap[key] = {
          name: key,
          views: 0,
          visitors: 0,
          newUsers: parseInt(row.count),
        };
      }
    });

    const data = Object.values(dataMap);
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch analytics stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
