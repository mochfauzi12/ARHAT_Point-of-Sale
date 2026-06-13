import postgres from 'postgres';

const sql = postgres('postgresql://postgres.itphmdzrdfilhlnrnpfn:SenopatiParty%40321@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres');

async function main() {
  try {
    console.log("Creating discounts table...");
    await sql`
      CREATE TABLE IF NOT EXISTS discounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id),
        code VARCHAR(50) NOT NULL,
        description VARCHAR(255),
        type VARCHAR(50) NOT NULL DEFAULT 'fixed',
        value VARCHAR(20) NOT NULL,
        min_purchase_amount VARCHAR(20) DEFAULT '0',
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_discounts_tenant_code ON discounts(tenant_id, code);`;
    console.log("Discounts table created successfully.");
  } catch(e) {
    console.error("Error creating table:", e);
  } finally {
    process.exit(0);
  }
}
main();
