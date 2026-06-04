import { db } from './src/lib/db';
import { users } from './src/models/index';

async function main() {
  const allUsers = await db.select().from(users);
  console.log('Users in DB:');
  console.log(allUsers.map(u => ({ email: u.email, pin: u.pin, role: u.role })));
  process.exit(0);
}
main();
