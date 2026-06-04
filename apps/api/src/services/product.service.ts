import { eq, or, ilike, and } from 'drizzle-orm';
import { db } from '../lib/db';
import { products } from '../models';

export class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(data: {
    tenantId: string;
    name: string;
    sku?: string;
    barcode?: string;
    sellingPrice: string;
    purchasePrice?: string;
    stockQuantity?: string;
    description?: string;
  }) {
    const result = await db.insert(products).values(data).returning();
    return result[0];
  }

  /**
   * Search products by name, sku, or barcode
   */
  static async searchProducts(tenantId: string, query: string) {
    return await db.select().from(products).where(
      and(
        eq(products.tenantId, tenantId),
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.sku, `%${query}%`),
          ilike(products.barcode, `%${query}%`)
        )
      )
    );
  }

  /**
   * Get product by ID
   */
  static async getProductById(tenantId: string, productId: string) {
    const result = await db.select().from(products).where(
      and(
        eq(products.id, productId),
        eq(products.tenantId, tenantId)
      )
    ).limit(1);
    
    return result[0] || null;
  }
}
