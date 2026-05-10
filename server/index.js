require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/profile',     require('./routes/profile'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/tests',       require('./routes/tests'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/subjects',    require('./routes/courses'));


// ── Global error handler ────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Auto-run SQL migrations on startup ──────────────────
async function runMigrations() {
  const sqlDir = path.join(__dirname, 'sql');
  const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}:`, err.message);
    }
  }
}

// ── Boot ────────────────────────────────────────────────
async function start() {
  console.log('🔌 Connecting to PostgreSQL...');
  await testConnection();
  console.log('📦 Running SQL migrations...');
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`\n🚀 preDoctr API ready → http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(console.error);
