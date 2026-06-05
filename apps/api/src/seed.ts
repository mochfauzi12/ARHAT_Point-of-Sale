import { db } from './lib/db';
import { tenants, users } from './models/index';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');
  try {
    const tenantId = '00000000-0000-0000-0000-000000000000';
    
    // Seed Tenant
    await db.insert(tenants).values({
      id: tenantId,
      name: 'Default Tenant',
      email: 'admin@arhatpos.com',
    }).onConflictDoNothing();
    
    // Seed Admin User
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const existingUser = await db.select().from(users).where(eq(users.email, 'admin@arhatpos.com'));
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: '11111111-1111-1111-1111-111111111111',
        tenantId,
        email: 'admin@arhatpos.com',
        passwordHash,
        pin: '123456',
        fullName: 'Admin User',
        role: 'admin',
        status: 'active',
      });
      console.log('User created');
    } else {
      console.log('User already exists');
    }
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
