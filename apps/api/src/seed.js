import { db } from './lib/db';
import { tenants, users, products } from './models/index';
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
                pin: '1234',
                fullName: 'Admin User',
                role: 'admin',
                status: 'active',
            });
            console.log('User created');
        }
        else {
            console.log('User already exists');
        }
        // Seed Dummy Products
        const existingProducts = await db.select().from(products).where(eq(products.tenantId, tenantId));
        if (existingProducts.length === 0) {
            const dummyProducts = [
                { name: 'Kopi Gula Aren', sku: 'KOP-001', sellingPrice: '18000', purchasePrice: '8000', stockQuantity: '50', isActive: true, tenantId },
                { name: 'Americano Dingin', sku: 'KOP-002', sellingPrice: '15000', purchasePrice: '6000', stockQuantity: '45', isActive: true, tenantId },
                { name: 'Teh Tarik Malaka', sku: 'TEH-001', sellingPrice: '16000', purchasePrice: '7000', stockQuantity: '60', isActive: true, tenantId },
                { name: 'Matcha Latte', sku: 'TEH-002', sellingPrice: '22000', purchasePrice: '11000', stockQuantity: '30', isActive: true, tenantId },
                { name: 'Roti Bakar Coklat Keju', sku: 'MKN-001', sellingPrice: '20000', purchasePrice: '9000', stockQuantity: '25', isActive: true, tenantId },
                { name: 'Croissant Butter', sku: 'MKN-002', sellingPrice: '18000', purchasePrice: '10000', stockQuantity: '15', isActive: true, tenantId },
            ];
            await db.insert(products).values(dummyProducts).onConflictDoNothing();
            console.log('Dummy products seeded successfully!');
        }
        else {
            console.log('Products already exist, skipping dummy data creation.');
        }
        console.log('Database seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seed();
