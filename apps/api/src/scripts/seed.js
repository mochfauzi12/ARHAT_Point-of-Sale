import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products, users, tenants } from '../models';
const connectionString = "postgresql://postgres.itphmdzrdfilhlnrnpfn:SenopatiParty@321@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres";
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);
async function seed() {
    console.log('🌱 Starting seed...');
    const tenantId = '00000000-0000-0000-0000-000000000000';
    const mockUserId = '11111111-1111-1111-1111-111111111111';
    try {
        await db.insert(tenants).values({
            id: tenantId,
            name: 'ARHAT POS Default Tenant',
            email: 'admin@arhatpos.com'
        }).onConflictDoNothing();
        console.log('✅ Tenant ensured.');
        await db.insert(users).values({
            id: mockUserId,
            tenantId,
            email: 'cashier@arhatpos.com',
            passwordHash: 'dummy_hash',
            fullName: 'Kasir Utama',
            role: 'cashier'
        }).onConflictDoNothing();
        console.log('✅ Cashier user ensured.');
        const mockProducts = [
            { id: '11111111-2222-3333-4444-000000000001', tenantId, name: 'Kopi Kenangan Mantan', categoryId: null, sellingPrice: '18000', stockQuantity: '50', isActive: true },
            { id: '11111111-2222-3333-4444-000000000002', tenantId, name: 'Matcha Latte', categoryId: null, sellingPrice: '24000', stockQuantity: '30', isActive: true },
            { id: '11111111-2222-3333-4444-000000000003', tenantId, name: 'Americano', categoryId: null, sellingPrice: '15000', stockQuantity: '100', isActive: true },
            { id: '11111111-2222-3333-4444-000000000004', tenantId, name: 'Caramel Macchiato', categoryId: null, sellingPrice: '28000', stockQuantity: '20', isActive: true },
            { id: '11111111-2222-3333-4444-000000000005', tenantId, name: 'Croissant Butter', categoryId: null, sellingPrice: '20000', stockQuantity: '15', isActive: true },
            { id: '11111111-2222-3333-4444-000000000006', tenantId, name: 'Cheesecake Slice', categoryId: null, sellingPrice: '35000', stockQuantity: '10', isActive: true },
        ];
        for (const prod of mockProducts) {
            await db.insert(products).values(prod).onConflictDoNothing();
        }
        console.log('✅ Products seeded successfully.');
    }
    catch (err) {
        console.error('❌ Seed error:', err);
    }
    process.exit(0);
}
seed();
