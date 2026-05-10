const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const updates = [
  { id: 70812, option_d: 'Analgesia', correct_opt: 'c' },
  { id: 70813, option_d: 'Cocaine', correct_opt: 'c' },
  {
    id: 70814,
    option_b: 'Aneurysm',
    option_d: 'Stroke',
    correct_opt: 'd' // Moved from B to D
  },
  { id: 70815, option_d: 'Encephalitis', correct_opt: 'c' },
  { id: 70816, option_d: 'Chest', correct_opt: 'b' },
  { id: 70817, option_d: 'Blurred vision', correct_opt: 'c' },
  { id: 70818, option_d: 'Serotonin', correct_opt: 'b' },
  { id: 70819, option_d: 'Interneurons', correct_opt: 'a' },
  { id: 70820, option_d: 'Spinal cord', correct_opt: 'a' },
  { id: 70821, option_d: 'Cerebellum', correct_opt: 'a' },
  { id: 70822, option_d: 'Hippocampus', correct_opt: 'a' },
  {
    id: 70823,
    option_c: 'Temperature regulation',
    option_d: 'Emotion regulation',
    correct_opt: 'd' // Moved from C to D
  },
  { id: 70824, option_d: 'Clusters of cell bodies', correct_opt: 'a' },
  { id: 70825, option_d: 'Involuntary', correct_opt: 'b' },
  { id: 70826, option_d: 'Hypothalamus', correct_opt: 'b' },
  { id: 70827, option_d: 'Fe', correct_opt: 'c' },
  { id: 70828, option_d: 'Meningitis', correct_opt: 'b' },
  {
    id: 70829,
    option_c: 'Thalamus',
    option_d: 'Cerebellum',
    correct_opt: 'd' // Moved from C to D
  },
  { id: 70830, option_d: 'Face recognition', correct_opt: 'c' },
  { id: 70831, option_d: 'Stimulates salivation', correct_opt: 'c' }
];

async function updateMCQs() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    for (const update of updates) {
      if (update.option_b && update.option_d && update.id === 70814) {
        await client.query(
          "UPDATE mcqs SET option_b = $1, option_d = $2, correct_opt = $3 WHERE id = $4",
          [update.option_b, update.option_d, update.correct_opt, update.id]
        );
      } else if (update.option_c && update.option_d) {
        await client.query(
          "UPDATE mcqs SET option_c = $1, option_d = $2, correct_opt = $3 WHERE id = $4",
          [update.option_c, update.option_d, update.correct_opt, update.id]
        );
      } else {
        await client.query(
          "UPDATE mcqs SET option_d = $1, correct_opt = $2 WHERE id = $3",
          [update.option_d, update.correct_opt, update.id]
        );
      }
      console.log(`✓ Updated MCQ ID ${update.id}`);
    }

    client.release();
    console.log('✓ All updates completed');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

updateMCQs();
