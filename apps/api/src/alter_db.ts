import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Adding columns to outlets...');
    await db.execute(sql`ALTER TABLE outlets ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
    await db.execute(sql`ALTER TABLE outlets ADD COLUMN IF NOT EXISTS tax_rate VARCHAR(10) DEFAULT '0'`);
    await db.execute(sql`ALTER TABLE outlets ADD COLUMN IF NOT EXISTS receipt_footer VARCHAR(500)`);
    console.log('Columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

main();
