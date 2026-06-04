import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL as string;
const client = postgres(connectionString, { prepare: false });

async function run() {
  console.log('Adding pin column to users...');
  try {
    await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(10);`;
    // Set default pin for our mock user
    await client`UPDATE users SET pin = '1234' WHERE email = 'cashier@arhatpos.com';`;
    console.log('Success!');
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
