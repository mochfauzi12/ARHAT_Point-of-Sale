const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  
  const migration = fs.readFileSync('migrations/0001_damp_sunfire.sql', 'utf8');
  
  try {
    console.log('Running migration...');
    await sql.unsafe(migration);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
