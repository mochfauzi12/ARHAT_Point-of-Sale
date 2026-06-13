import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const runMigration = async () => {
  console.log('Running migration...');
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    const query = readFileSync('./migrations/0004_salty_lorna_dane.sql', 'utf-8');
    await sql.unsafe(query);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sql.end();
  }
};

runMigration();
