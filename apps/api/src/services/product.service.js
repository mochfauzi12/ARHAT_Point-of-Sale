import { eq, or, ilike, and } from 'drizzle-orm';
import { db } from '../lib/db';
import { products } from '../models';
export class ProductService {
    /**
     * Create a new product
     */
    static async createProduct(data) {
        const result = await db.insert(products).values(data).returning();
        return result[0];
    }
    /**
     * Search products by name, sku, or barcode
     */
    static async searchProducts(tenantId, query) {
        return await db.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.isActive, true), or(ilike(products.name, `%${query}%`), ilike(products.sku, `%${query}%`), ilike(products.barcode, `%${query}%`))));
    }
    /**
     * Get product by ID
     */
    static async getProductById(tenantId, productId) {
        const result = await db.select().from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);
        return result[0] || null;
    }
    /**
     * Update product
     */
    static async updateProduct(tenantId, productId, data) {
        const result = await db.update(products).set({ ...data, updatedAt: new Date() }).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).returning();
        return result[0];
    }
    /**
     * Delete product
     */
    static async deleteProduct(tenantId, productId) {
        const result = await db.delete(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).returning();
        return result[0];
    }
}
