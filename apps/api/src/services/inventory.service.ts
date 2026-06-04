import { db } from '../lib/db';
import { products, stockMovements } from '../models';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../lib/errors';

export class InventoryService {
  async getProductsWithStock(tenantId: string) {
    const data = await db.select().from(products).where(eq(products.tenantId, tenantId)).orderBy(desc(products.createdAt));
    return data;
  }

  async getStockMovements(tenantId: string) {
    // In a real app we would join with products for the name
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

  async restockProduct(tenantId: string, productId: string, quantity: number, reason: string) {
    const productList = await db.select().from(products).where(eq(products.id, productId));
    if (productList.length === 0) throw new AppError('Product not found', 404);
    
    const currentStock = parseInt(productList[0].stockQuantity || '0');
    const newStock = currentStock + quantity;

    await db.transaction(async (tx) => {
      // Update stock
      await tx.update(products).set({ stockQuantity: newStock.toString() }).where(eq(products.id, productId));
      
      // Add movement
      await tx.insert(stockMovements).values({
        tenantId,
        productId,
        movementType: 'in',
        quantity: quantity.toString(),
        reason: reason || 'Restock',
      });
    });

    return { newStock };
  }
}

export const inventoryService = new InventoryService();
