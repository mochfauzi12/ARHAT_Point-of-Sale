import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL as string);

async function run() {
  try {
    const res = await sql`SELECT "id", "total_amount", "created_at" FROM "transactions" LIMIT 1`;
    console.log('Result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    process.exit(1);
  }
}

run();
