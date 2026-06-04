import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
const db = drizzle(sql);

async function run() {
  try {
    const res = await sql`select "id", "total_amount" from "transactions" where "tenant_id" = '00000000-0000-0000-0000-000000000000' and "status" = 'completed' and "created_at" >= '2026-06-03T17:00:00.000Z'`;
    console.log("Success:", res);
  } catch (err: any) {
    console.error("Inner Error:", err);
    console.error("Message:", err.message);
  }
}

run();
