import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    console.log('Creating expenses table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "outlet_id" uuid REFERENCES "outlets"("id"),
        "category" varchar(100) NOT NULL,
        "amount" varchar(20) NOT NULL,
        "date" timestamp NOT NULL DEFAULT now(),
        "notes" varchar(1000),
        "recorded_by" uuid REFERENCES "users"("id"),
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('Successfully created expenses table!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create table:', err);
    process.exit(1);
  }
}

run();
