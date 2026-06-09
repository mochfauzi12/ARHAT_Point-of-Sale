const postgres = require('postgres');

// Session Pooler URL from Supabase (correct one!)
const sql = postgres('postgresql://postgres.itphmdzrdfilhlnrnpfn:SenopatiParty%40321@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres', {
  connect_timeout: 10,
  ssl: 'require'
});

async function main() {
  try {
    const res = await sql`SELECT current_database() as db, current_user as usr`;
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('Database:', res[0].db);
    console.log('User:', res[0].usr);
  } catch (err) {
    console.error('❌ Connection FAILED:');
    console.error('Error:', err.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

main();
