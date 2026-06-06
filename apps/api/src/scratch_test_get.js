import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    const products = await sql`SELECT id, name, tenant_id FROM products;`;
    console.log(products);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

main();
