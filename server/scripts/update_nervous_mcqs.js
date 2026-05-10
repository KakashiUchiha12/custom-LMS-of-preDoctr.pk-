const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const updates = [
  {
    id: 70802,
    option_d: 'Nucleus',
    correct_opt: 'a'
  },
  {
    id: 70803,
    option_d: 'Synapse',
    correct_opt: 'b'
  },
  {
    id: 70804,
    option_d: 'Hypothalamus',
    correct_opt: 'c'
  },
  {
    id: 70805,
    option_c: 'Autonomic nervous system',
    option_d: 'Somatic nervous system',
    correct_opt: 'd' // Moved from C to D
  },
  {
    id: 70806,
    option_d: "Huntington's Disease",
    correct_opt: 'a'
  },
  {
    id: 70807,
    option_a: 'Breathing and Heart rate',
    option_b: 'Balance and Coordination',
    option_c: 'Reflex actions',
    option_d: 'Voluntary Movement, Speech and Memory',
    correct_opt: 'd' // Moved from A to D
  },
  {
    id: 70808,
    option_d: 'Multiple Sclerosis',
    correct_opt: 'c'
  },
  {
    id: 70809,
    option_a: 'Sensory only',
    option_b: 'Motor only',
    option_c: 'Mixed only',
    option_d: 'Sensory and Motor',
    correct_opt: 'd' // Moved from C to D
  },
  {
    id: 70810,
    option_d: 'Central nervous system',
    correct_opt: 'b'
  },
  {
    id: 70811,
    option_d: 'Circumvallate',
    correct_opt: 'b'
  }
];

async function updateMCQs() {
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');

    for (const update of updates) {
      if (update.option_a) {
        await client.query(
          "UPDATE mcqs SET option_a = $1, option_b = $2, option_c = $3, option_d = $4, correct_opt = $5 WHERE id = $6",
          [update.option_a, update.option_b, update.option_c, update.option_d, update.correct_opt, update.id]
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
