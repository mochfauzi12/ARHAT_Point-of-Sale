import { eq, or, ilike, and, inArray } from 'drizzle-orm';
import { db } from '../lib/db';
import { products, productVariants, productModifiers } from '../models';
export class ProductService {
    /**
     * Create a new product
     */
    static async createProduct(data) {
        const { variants, modifiers, price, cost, stock, category, ...restData } = data;
        // Map frontend fields to DB schema
        const productData = {
            ...restData,
            sku: restData.sku === '' ? null : restData.sku,
            sellingPrice: price !== undefined ? price.toString() : '0',
            purchasePrice: cost !== undefined ? cost.toString() : '0',
            stockQuantity: stock !== undefined ? stock.toString() : '0'
        };
        const result = await db.insert(products).values(productData).returning();
        const product = result[0];
        if (variants && variants.length > 0) {
            await db.insert(productVariants).values(variants.map((v) => ({ ...v, productId: product.id })));
        }
        if (modifiers && modifiers.length > 0) {
            await db.insert(productModifiers).values(modifiers.map((m) => ({ ...m, productId: product.id })));
        }
        return product;
    }
    /**
     * Search products by name, sku, or barcode
     */
    static async searchProducts(tenantId, query) {
        const prods = await db.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.isActive, true), or(ilike(products.name, `%${query}%`), ilike(products.sku, `%${query}%`), ilike(products.barcode, `%${query}%`))));
        if (prods.length === 0)
            return prods;
        const productIds = prods.map(p => p.id);
        const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, productIds));
        const modifiers = await db.select().from(productModifiers).where(inArray(productModifiers.productId, productIds));
        return prods.map(p => ({
            ...p,
            variants: variants.filter(v => v.productId === p.id),
            modifiers: modifiers.filter(m => m.productId === p.id)
        }));
    }
    /**
     * Get product by ID
     */
    static async getProductById(tenantId, productId) {
        const result = await db.select().from(products).where(and(eq(products.id, productId), eq(products.tenantId, tenantId))).limit(1);
        if (!result[0])
            return null;
        const variants = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
        const modifiers = await db.select().from(productModifiers).where(eq(productModifiers.productId, productId));
        return {
            ...result[0],
            variants,
            modifiers
        };
    }
    /**
     * Update product
     */
    static async updateProduct(tenantId, productId, data) {
        const { variants, modifiers, price, cost, stock, category, ...restData } = data;
        const productData = { ...restData };
        if (restData.sku === '')
            productData.sku = null;
        if (price !== undefined)
            productData.sellingPrice = price.toString();
        if (cost !== undefined)
            productData.purchasePrice = cost.toString();
        if (stock !== undefined)
            productData.stockQuantity = stock.toString();
        const result = await db.update(products)
            .set({ ...productData, updatedAt: new Date() })
            .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
            .returning();
        if (!result[0])
            return null;
        if (variants !== undefined) {
            await db.delete(productVariants).where(eq(productVariants.productId, productId));
            if (variants.length > 0) {
                await db.insert(productVariants).values(variants.map((v) => ({ ...v, id: undefined, productId })));
            }
        }
        if (modifiers !== undefined) {
            await db.delete(productModifiers).where(eq(productModifiers.productId, productId));
            if (modifiers.length > 0) {
                await db.insert(productModifiers).values(modifiers.map((m) => ({ ...m, id: undefined, productId })));
            }
        }
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
