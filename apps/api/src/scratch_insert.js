import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('Testing insert...');
    // We get a tenant first
    const tenants = await sql`SELECT id FROM tenants LIMIT 1`;
    if (!tenants.length) return console.log('No tenant');
    const tenantId = tenants[0].id;
    
    await sql`
      INSERT INTO products (
        tenant_id, name, sku, purchase_price, selling_price, stock_quantity, is_active, is_service
      ) VALUES (
        ${tenantId}, 'Test Item', null, '5000', '10000', '7', true, false
      ) RETURNING id;
    `;
    console.log('Insert success!');
  } catch (e) {
    console.error('Insert Error:', e.message);
  } finally {
    await sql.end();
  }
}

main();
