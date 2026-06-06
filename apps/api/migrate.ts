import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log('Running migration...');
    await sql`
      CREATE TABLE IF NOT EXISTS shifts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        cashier_id UUID NOT NULL REFERENCES users(id),
        outlet_id UUID REFERENCES outlets(id),
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        starting_cash VARCHAR(20) NOT NULL,
        actual_ending_cash VARCHAR(20),
        expected_ending_cash VARCHAR(20),
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        notes VARCHAR(1000)
      );
    `;
    console.log('Created shifts table');

    try {
      await sql`ALTER TABLE transactions ADD COLUMN shift_id UUID REFERENCES shifts(id);`;
      console.log('Added shift_id to transactions');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('Column shift_id already exists in transactions');
      } else {
        throw e;
      }
    }
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

main();
