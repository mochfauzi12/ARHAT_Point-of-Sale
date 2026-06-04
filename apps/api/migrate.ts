import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL as string);

async function run() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        cashier_id UUID REFERENCES users(id),
        transaction_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        subtotal VARCHAR(20) NOT NULL,
        discount_amount VARCHAR(20) DEFAULT '0',
        tax_amount VARCHAR(20) DEFAULT '0',
        total_amount VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        notes VARCHAR(1000),
        held_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `;
    console.log('Created transactions table');

    await sql`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price VARCHAR(20) NOT NULL,
        discount_amount VARCHAR(20) DEFAULT '0',
        subtotal VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Created transaction_items table');
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        amount VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        reference_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Created payments table');

    await sql`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        product_id UUID NOT NULL REFERENCES products(id),
        movement_type VARCHAR(20) NOT NULL,
        quantity VARCHAR(20) NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        reason VARCHAR(255),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Created stock_movements table');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
