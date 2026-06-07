require('dotenv').config();
const postgres = require('postgres');
console.log("Connecting to:", process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT 1`.then((res) => {
  console.log("Success:", res);
  process.exit(0);
}).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
