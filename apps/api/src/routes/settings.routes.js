import { Hono } from 'hono';
import { db } from '../lib/db';
import { outlets } from '../models';
import { eq } from 'drizzle-orm';
import { AppError } from '../lib/errors';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
const settingsRoutes = new Hono();
const updateSettingsSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    taxRate: z.string().optional(),
    receiptFooter: z.string().optional(),
});
// Get settings (outlet)
settingsRoutes.get('/', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || !user.tenantId) {
        throw new AppError('Unauthorized', 401);
    }
    const outletList = await db.select().from(outlets).where(eq(outlets.tenantId, user.tenantId)).limit(1);
    if (outletList.length === 0) {
        throw new AppError('Outlet not found', 404);
    }
    return c.json({ success: true, data: outletList[0] });
});
// Update settings
settingsRoutes.put('/', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || !user.tenantId) {
        throw new AppError('Unauthorized', 401);
    }
    // Only admin can update settings
    if (user.role !== 'admin') {
        throw new AppError('Forbidden: Only admins can update settings', 403);
    }
    const body = await c.req.json();
    const data = updateSettingsSchema.parse(body);
    const outletList = await db.select().from(outlets).where(eq(outlets.tenantId, user.tenantId)).limit(1);
    if (outletList.length === 0) {
        throw new AppError('Outlet not found', 404);
    }
    const updatedOutlet = await db.update(outlets)
        .set({
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        taxRate: data.taxRate || '0',
        receiptFooter: data.receiptFooter || null,
    })
        .where(eq(outlets.id, outletList[0].id))
        .returning();
    return c.json({ success: true, data: updatedOutlet[0] });
});
export default settingsRoutes;
