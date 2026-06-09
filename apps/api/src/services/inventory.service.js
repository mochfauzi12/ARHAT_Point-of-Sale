import { db } from '../lib/db';
import { products, stockMovements, productStocks, outlets, stockAdjustments, stockAdjustmentItems, stockOpnameSessions, stockOpnameItems, stockTransfers, stockTransferItems } from '../models';
import { eq, and, desc } from 'drizzle-orm';
import { AppError } from '../lib/errors';
export class InventoryService {
    // 1. Core Stock Functions
    async getStockMovements(tenantId) {
        const data = await db.select({
            id: stockMovements.id,
            movementType: stockMovements.movementType,
            quantity: stockMovements.quantity,
            reason: stockMovements.reason,
            createdAt: stockMovements.createdAt,
            productName: products.name
        }).from(stockMovements)
            .leftJoin(products, eq(stockMovements.productId, products.id))
            .where(eq(stockMovements.tenantId, tenantId))
            .orderBy(desc(stockMovements.createdAt))
            .limit(50);
        return data;
    }
    async getOutlets(tenantId) {
        return await db.select().from(outlets).where(eq(outlets.tenantId, tenantId)).orderBy(desc(outlets.createdAt));
    }
    async createOutlet(tenantId, name, address) {
        const out = await db.insert(outlets).values({
            tenantId,
            name,
            address
        }).returning();
        return out[0];
    }
    async getProductStockByOutlet(tenantId, outletId) {
        // Get all products joined with their stock in the specific outlet
        const data = await db.select({
            id: products.id,
            name: products.name,
            sku: products.sku,
            sellingPrice: products.sellingPrice,
            imageUrl: products.imageUrl,
            stockQuantity: productStocks.stockQuantity,
            minStockLevel: productStocks.minStockLevel
        })
            .from(products)
            .leftJoin(productStocks, and(eq(productStocks.productId, products.id), eq(productStocks.outletId, outletId)))
            .where(eq(products.tenantId, tenantId))
            .orderBy(desc(products.createdAt));
        return data;
    }
    // 2. Stock Movements (In/Out)
    async recordStockMovement(tenantId, outletId, userId, payload) {
        return await db.transaction(async (tx) => {
            // Find or create product stock for outlet
            let ps = await tx.select().from(productStocks).where(and(eq(productStocks.productId, payload.productId), eq(productStocks.outletId, outletId))).limit(1);
            let currentStock = 0;
            if (ps.length === 0) {
                await tx.insert(productStocks).values({
                    productId: payload.productId,
                    outletId: outletId,
                    stockQuantity: '0'
                });
            }
            else {
                currentStock = parseInt(ps[0].stockQuantity || '0');
            }
            const newStock = payload.type === 'in'
                ? currentStock + payload.quantity
                : currentStock - payload.quantity;
            if (newStock < 0)
                throw new AppError('Insufficient stock', 400);
            // Update stock
            await tx.update(productStocks)
                .set({ stockQuantity: newStock.toString(), updatedAt: new Date() })
                .where(and(eq(productStocks.productId, payload.productId), eq(productStocks.outletId, outletId)));
            // Also update total stock in products table for legacy compatibility
            const p = await tx.select().from(products).where(eq(products.id, payload.productId)).limit(1);
            if (p.length > 0) {
                const legacyStock = parseInt(p[0].stockQuantity || '0');
                const newLegacyStock = payload.type === 'in' ? legacyStock + payload.quantity : legacyStock - payload.quantity;
                await tx.update(products).set({ stockQuantity: newLegacyStock.toString() }).where(eq(products.id, payload.productId));
            }
            // Record movement
            await tx.insert(stockMovements).values({
                tenantId,
                productId: payload.productId,
                outletId,
                movementType: payload.type,
                referenceType: 'manual',
                quantity: payload.quantity.toString(),
                reason: payload.reason,
                recordedBy: userId
            });
            return { newStock };
        });
    }
    // 3. Stock Adjustments
    async getAdjustments(tenantId, outletId) {
        const list = await db.select().from(stockAdjustments)
            .where(and(eq(stockAdjustments.tenantId, tenantId), eq(stockAdjustments.outletId, outletId)))
            .orderBy(desc(stockAdjustments.createdAt));
        return list;
    }
    async createAdjustment(tenantId, outletId, userId, items) {
        return await db.transaction(async (tx) => {
            const adjNum = `ADJ-${Date.now()}`;
            const adj = await tx.insert(stockAdjustments).values({
                tenantId,
                outletId,
                adjustmentNumber: adjNum,
                status: 'pending',
                createdBy: userId
            }).returning();
            for (const item of items) {
                let ps = await tx.select().from(productStocks).where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, outletId))).limit(1);
                const currentStock = ps.length > 0 ? parseInt(ps[0].stockQuantity || '0') : 0;
                const variance = item.adjustedStock - currentStock;
                await tx.insert(stockAdjustmentItems).values({
                    adjustmentId: adj[0].id,
                    productId: item.productId,
                    currentStock: currentStock.toString(),
                    adjustedStock: item.adjustedStock.toString(),
                    variance: variance.toString(),
                    reason: item.reason
                });
            }
            return adj[0];
        });
    }
    async approveAdjustment(tenantId, adjustmentId, userId) {
        return await db.transaction(async (tx) => {
            const adj = await tx.select().from(stockAdjustments).where(eq(stockAdjustments.id, adjustmentId)).limit(1);
            if (adj.length === 0 || adj[0].status !== 'pending')
                throw new AppError('Invalid adjustment', 400);
            await tx.update(stockAdjustments).set({ status: 'approved', approvedBy: userId, approvedAt: new Date() }).where(eq(stockAdjustments.id, adjustmentId));
            const items = await tx.select().from(stockAdjustmentItems).where(eq(stockAdjustmentItems.adjustmentId, adjustmentId));
            for (const item of items) {
                const variance = parseInt(item.variance);
                // Update productStocks
                await tx.update(productStocks)
                    .set({ stockQuantity: item.adjustedStock, updatedAt: new Date() })
                    .where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, adj[0].outletId)));
                // Legacy total stock
                const p = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
                if (p.length > 0) {
                    const legacyStock = parseInt(p[0].stockQuantity || '0');
                    const newLegacyStock = legacyStock + variance;
                    await tx.update(products).set({ stockQuantity: newLegacyStock.toString() }).where(eq(products.id, item.productId));
                }
                // Add movement
                await tx.insert(stockMovements).values({
                    tenantId,
                    productId: item.productId,
                    outletId: adj[0].outletId,
                    movementType: 'adjustment',
                    referenceType: 'adjustment',
                    referenceId: adjustmentId,
                    quantity: Math.abs(variance).toString(),
                    reason: item.reason,
                    recordedBy: userId
                });
            }
            return { success: true };
        });
    }
    // 4. Stock Opname
    async createOpname(tenantId, outletId, userId) {
        const opnameNum = `OPN-${Date.now()}`;
        const opn = await db.insert(stockOpnameSessions).values({
            tenantId,
            outletId,
            opnameNumber: opnameNum,
            status: 'in_progress',
            startedBy: userId
        }).returning();
        return opn[0];
    }
    async completeOpname(tenantId, opnameId, userId, items) {
        return await db.transaction(async (tx) => {
            const opn = await tx.select().from(stockOpnameSessions).where(eq(stockOpnameSessions.id, opnameId)).limit(1);
            if (opn.length === 0 || opn[0].status !== 'in_progress')
                throw new AppError('Invalid opname session', 400);
            await tx.update(stockOpnameSessions).set({ status: 'completed', completedBy: userId, completedAt: new Date() }).where(eq(stockOpnameSessions.id, opnameId));
            for (const item of items) {
                let ps = await tx.select().from(productStocks).where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, opn[0].outletId))).limit(1);
                const expected = ps.length > 0 ? parseInt(ps[0].stockQuantity || '0') : 0;
                const variance = item.actualQuantity - expected;
                await tx.insert(stockOpnameItems).values({
                    opnameId,
                    productId: item.productId,
                    expectedQuantity: expected.toString(),
                    actualQuantity: item.actualQuantity.toString(),
                    variance: variance.toString()
                });
                // Also create adjustment implicitly or adjust directly
                await tx.update(productStocks)
                    .set({ stockQuantity: item.actualQuantity.toString(), updatedAt: new Date() })
                    .where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, opn[0].outletId)));
                // Legacy total stock
                const p = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
                if (p.length > 0) {
                    const legacyStock = parseInt(p[0].stockQuantity || '0');
                    const newLegacyStock = legacyStock + variance;
                    await tx.update(products).set({ stockQuantity: newLegacyStock.toString() }).where(eq(products.id, item.productId));
                }
                // Add movement
                if (variance !== 0) {
                    await tx.insert(stockMovements).values({
                        tenantId,
                        productId: item.productId,
                        outletId: opn[0].outletId,
                        movementType: 'adjustment',
                        referenceType: 'opname',
                        referenceId: opnameId,
                        quantity: Math.abs(variance).toString(),
                        reason: 'Opname Variance',
                        recordedBy: userId
                    });
                }
            }
            return { success: true };
        });
    }
    // 5. Stock Transfers
    async createTransfer(tenantId, sourceOutletId, destinationOutletId, userId, items) {
        return await db.transaction(async (tx) => {
            const trnNum = `TRN-${Date.now()}`;
            const trn = await tx.insert(stockTransfers).values({
                tenantId,
                transferNumber: trnNum,
                sourceOutletId,
                destinationOutletId,
                status: 'pending',
                createdBy: userId
            }).returning();
            for (const item of items) {
                // Deduct from source immediately
                let ps = await tx.select().from(productStocks).where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, sourceOutletId))).limit(1);
                const currentStock = ps.length > 0 ? parseInt(ps[0].stockQuantity || '0') : 0;
                if (currentStock < item.quantity)
                    throw new AppError(`Insufficient stock in source outlet for product ${item.productId}`, 400);
                await tx.update(productStocks)
                    .set({ stockQuantity: (currentStock - item.quantity).toString(), updatedAt: new Date() })
                    .where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, sourceOutletId)));
                await tx.insert(stockTransferItems).values({
                    transferId: trn[0].id,
                    productId: item.productId,
                    quantity: item.quantity.toString()
                });
                await tx.insert(stockMovements).values({
                    tenantId,
                    productId: item.productId,
                    outletId: sourceOutletId,
                    movementType: 'transfer_out',
                    referenceType: 'transfer',
                    referenceId: trn[0].id,
                    quantity: item.quantity.toString(),
                    reason: `Transfer to Outlet ${destinationOutletId}`,
                    recordedBy: userId
                });
            }
            return trn[0];
        });
    }
    async receiveTransfer(tenantId, transferId, userId) {
        return await db.transaction(async (tx) => {
            const trn = await tx.select().from(stockTransfers).where(eq(stockTransfers.id, transferId)).limit(1);
            if (trn.length === 0 || trn[0].status !== 'pending')
                throw new AppError('Invalid transfer', 400);
            await tx.update(stockTransfers).set({ status: 'received', receivedBy: userId, receivedAt: new Date() }).where(eq(stockTransfers.id, transferId));
            const items = await tx.select().from(stockTransferItems).where(eq(stockTransferItems.transferId, transferId));
            for (const item of items) {
                // Add to destination
                let ps = await tx.select().from(productStocks).where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, trn[0].destinationOutletId))).limit(1);
                if (ps.length === 0) {
                    await tx.insert(productStocks).values({
                        productId: item.productId,
                        outletId: trn[0].destinationOutletId,
                        stockQuantity: item.quantity
                    });
                }
                else {
                    const currentStock = parseInt(ps[0].stockQuantity || '0');
                    await tx.update(productStocks)
                        .set({ stockQuantity: (currentStock + parseInt(item.quantity)).toString(), updatedAt: new Date() })
                        .where(and(eq(productStocks.productId, item.productId), eq(productStocks.outletId, trn[0].destinationOutletId)));
                }
                await tx.insert(stockMovements).values({
                    tenantId,
                    productId: item.productId,
                    outletId: trn[0].destinationOutletId,
                    movementType: 'transfer_in',
                    referenceType: 'transfer',
                    referenceId: transferId,
                    quantity: item.quantity.toString(),
                    reason: `Received from Outlet ${trn[0].sourceOutletId}`,
                    recordedBy: userId
                });
            }
            return { success: true };
        });
    }
}
export const inventoryService = new InventoryService();
