import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import { sql } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL as string, { prepare: false });
const db = drizzle(client);

async function migrate() {
  console.log('Running migrations...');
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_variants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id),
        name varchar(255) NOT NULL,
        sku varchar(100),
        price varchar(20) NOT NULL,
        stock_quantity varchar(10) DEFAULT '0',
        is_active boolean DEFAULT true
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_modifiers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id),
        name varchar(255) NOT NULL,
        price varchar(20) DEFAULT '0',
        is_active boolean DEFAULT true
      );
    `);

    await db.execute(sql`ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES product_variants(id);`);
    await db.execute(sql`ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS variant_name varchar(255);`);
    await db.execute(sql`ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS modifiers varchar(1000);`);
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
