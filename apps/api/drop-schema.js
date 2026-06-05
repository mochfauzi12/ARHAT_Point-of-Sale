const postgres = require('postgres');
require('dotenv').config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('Dropping schema public cascade...');
    await sql.unsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Schema dropped and recreated successfully!');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await sql.end();
  }
}

run();
