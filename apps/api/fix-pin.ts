import { db } from './src/lib/db';
import { users } from './src/models';
import { eq } from 'drizzle-orm';

async function run() {
  await db.update(users).set({ pin: '1234' }).where(eq(users.email, 'admin@arhatpos.com'));
  console.log('PIN updated to 1234');
  process.exit(0);
}
run();
