const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://predoctr:predoctr_dev_pass@localhost:5432/predoctr_lms'
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT * FROM mcqs WHERE id = 98513");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
main();
