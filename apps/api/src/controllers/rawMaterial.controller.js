import { db } from '../index';
import { rawMaterials, rawMaterialStocks, boms } from '../models';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
// ========================
// RAW MATERIALS
// ========================
export const getRawMaterials = async (c) => {
    const tenantId = c.get('tenantId');
    const materials = await db.select().from(rawMaterials).where(eq(rawMaterials.tenantId, tenantId));
    // Get stocks for these materials
    const stocks = await db.select().from(rawMaterialStocks);
    const enrichedMaterials = materials.map(m => {
        const itemStocks = stocks.filter(s => s.rawMaterialId === m.id);
        const totalStock = itemStocks.reduce((sum, s) => sum + parseFloat(s.stockQuantity || '0'), 0);
        return { ...m, stockQuantity: totalStock.toString(), stocks: itemStocks };
    });
    return c.json({ data: enrichedMaterials });
};
export const createRawMaterial = async (c) => {
    const tenantId = c.get('tenantId');
    const body = await c.req.json();
    const schema = z.object({
        name: z.string(),
        sku: z.string().optional(),
        unit: z.string(),
        costPerUnit: z.string().optional(),
        initialStock: z.string().optional(),
        outletId: z.string().optional()
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: parsed.error }, 400);
    }
    const { name, sku, unit, costPerUnit, initialStock, outletId } = parsed.data;
    // Insert Raw Material
    const [newMaterial] = await db.insert(rawMaterials).values({
        tenantId,
        name,
        sku,
        unit,
        costPerUnit: costPerUnit || '0'
    }).returning();
    // Insert initial stock if provided
    if (initialStock && outletId) {
        await db.insert(rawMaterialStocks).values({
            rawMaterialId: newMaterial.id,
            outletId,
            stockQuantity: initialStock
        });
    }
    return c.json({ data: newMaterial }, 201);
};
export const updateRawMaterial = async (c) => {
    const id = c.req.param('id');
    const tenantId = c.get('tenantId');
    const body = await c.req.json();
    // Validate ownership implicitly or explicitly
    const [material] = await db.select().from(rawMaterials).where(and(eq(rawMaterials.id, id), eq(rawMaterials.tenantId, tenantId)));
    if (!material) {
        return c.json({ error: 'Raw material not found' }, 404);
    }
    const [updated] = await db.update(rawMaterials)
        .set({
        name: body.name !== undefined ? body.name : material.name,
        sku: body.sku !== undefined ? body.sku : material.sku,
        unit: body.unit !== undefined ? body.unit : material.unit,
        costPerUnit: body.costPerUnit !== undefined ? body.costPerUnit : material.costPerUnit,
        updatedAt: new Date()
    })
        .where(eq(rawMaterials.id, id))
        .returning();
    return c.json({ data: updated });
};
export const deleteRawMaterial = async (c) => {
    const id = c.req.param('id');
    const tenantId = c.get('tenantId');
    const [material] = await db.select().from(rawMaterials).where(and(eq(rawMaterials.id, id), eq(rawMaterials.tenantId, tenantId)));
    if (!material) {
        return c.json({ error: 'Raw material not found' }, 404);
    }
    // Soft delete or hard delete? Let's hard delete for MVP, but first delete dependencies
    await db.delete(boms).where(eq(boms.rawMaterialId, id));
    await db.delete(rawMaterialStocks).where(eq(rawMaterialStocks.rawMaterialId, id));
    await db.delete(rawMaterials).where(eq(rawMaterials.id, id));
    return c.json({ success: true });
};
// ========================
// BOM (Bill of Materials)
// ========================
export const getProductBoms = async (c) => {
    const productId = c.req.param('productId');
    const productBoms = await db.select({
        id: boms.id,
        productId: boms.productId,
        rawMaterialId: boms.rawMaterialId,
        quantity: boms.quantity,
        rawMaterial: {
            name: rawMaterials.name,
            unit: rawMaterials.unit,
            costPerUnit: rawMaterials.costPerUnit
        }
    }).from(boms)
        .leftJoin(rawMaterials, eq(boms.rawMaterialId, rawMaterials.id))
        .where(eq(boms.productId, productId));
    return c.json({ data: productBoms });
};
export const updateProductBom = async (c) => {
    const productId = c.req.param('productId');
    const body = await c.req.json(); // Expected format: Array of { rawMaterialId, quantity }
    if (!Array.isArray(body)) {
        return c.json({ error: 'Expected an array of BOM items' }, 400);
    }
    // Replace entire BOM for simplicity
    await db.delete(boms).where(eq(boms.productId, productId));
    if (body.length > 0) {
        const itemsToInsert = body.map(item => ({
            productId,
            rawMaterialId: item.rawMaterialId,
            quantity: item.quantity.toString()
        }));
        await db.insert(boms).values(itemsToInsert);
    }
    return c.json({ success: true });
};
