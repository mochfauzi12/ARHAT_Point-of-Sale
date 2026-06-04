import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log('Adding image_url column to products...');
  try {
    await client`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);`;
    console.log('Success!');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
