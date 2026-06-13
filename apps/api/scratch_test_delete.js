import postgres from 'postgres';

const sql = postgres('postgresql://postgres.itphmdzrdfilhlnrnpfn:SenopatiParty%40321@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres');

async function main() {
  try {
    const res = await sql`delete from "discounts" where tenant_id = '055aa5f7-7f57-40dd-9640-31495ca15d40'`;
    console.log("Delete success:", res);
  } catch(e) {
    console.error("Delete failed with error details:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  } finally {
    process.exit(0);
  }
}
main();
