const postgres = require('postgres');
require('dotenv').config();

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  
  const migration = `
CREATE INDEX IF NOT EXISTS "idx_customers_phone" ON "customers" USING btree ("phone");
CREATE INDEX IF NOT EXISTS "idx_transactions_number" ON "transactions" USING btree ("transaction_number");
CREATE INDEX IF NOT EXISTS "idx_transactions_created_at" ON "transactions" USING btree ("created_at");
  `;
  
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
