import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('Altering image_url column to text...');
    await sql`ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;`;
    console.log('Column altered successfully!');
  } catch (e) {
    console.error('Error altering column:', e);
  } finally {
    await sql.end();
  }
}

main();
