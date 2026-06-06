import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    console.log('Adding is_service column to products table...');
    await sql`ALTER TABLE products ADD COLUMN is_service BOOLEAN DEFAULT false;`;
    console.log('Column added successfully!');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', e);
    }
  } finally {
    await sql.end();
  }
}

main();
