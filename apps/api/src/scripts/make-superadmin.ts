import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../models';

async function makeSuperAdmin(email: string) {
  if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: npx tsx src/scripts/make-superadmin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    await db.update(users)
      .set({ role: 'superadmin' })
      .where(eq(users.email, email));

    console.log(`Success! User ${email} is now a superadmin.`);
    console.log('They can now access the Superadmin dashboard.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update user role:', error);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
makeSuperAdmin(args[0]);
