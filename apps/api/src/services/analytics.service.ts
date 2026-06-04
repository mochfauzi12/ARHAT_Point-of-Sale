import { db } from '../lib/db';
import { transactions, transactionItems, products } from '../models';
import { and, eq, gte, sql, desc } from 'drizzle-orm';

export class AnalyticsService {
  static async getDashboardData(tenantId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all completed transactions to calculate safely in JS
      const allTransactionsRaw = await db
        .select({
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.tenantId, tenantId),
            eq(transactions.status, 'completed')
          )
        );

      const todayStr = today.toISOString().split('T')[0];

      let revenue = 0;
      let count = 0;
      for (const t of allTransactionsRaw) {
        if (!t.createdAt) continue;
        const txDate = new Date(t.createdAt).toISOString().split('T')[0];
        if (txDate === todayStr) {
          revenue += Number(t.totalAmount) || 0;
          count++;
        }
      }

      // 2. Total Active Products
      const productsCount = await db
        .select({ count: sql<number>`count(${products.id})` })
        .from(products)
        .where(
          and(
            eq(products.tenantId, tenantId),
            eq(products.isActive, true)
          )
        );

      // 3. Top Products (Best Sellers) via JS aggregation to avoid CAST errors
      const allTxItems = await db
        .select({
          productId: products.id,
          productName: products.name,
          quantity: transactionItems.quantity,
          subtotal: transactionItems.subtotal
        })
        .from(transactionItems)
        .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
        .innerJoin(products, eq(transactionItems.productId, products.id))
        .where(
          and(
            eq(transactions.tenantId, tenantId),
            eq(transactions.status, 'completed')
          )
        );

      const productMap: Record<string, { id: string, name: string, totalQuantity: number, totalRevenue: number }> = {};
      
      for (const item of allTxItems) {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productMap[item.productId].totalQuantity += Number(item.quantity) || 0;
        productMap[item.productId].totalRevenue += Number(item.subtotal) || 0;
      }

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      // 4. Sales Chart (Last 7 Days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const chartMap: Record<string, number> = {};
      for (const t of allTransactionsRaw) {
        if (!t.createdAt) continue;
        const txDateObj = new Date(t.createdAt);
        if (txDateObj >= sevenDaysAgo) {
          const dateStr = txDateObj.toISOString().split('T')[0];
          chartMap[dateStr] = (chartMap[dateStr] || 0) + Number(t.totalAmount || 0);
        }
      }

      // Format chart data to ensure all 7 days exist even if 0
      const chartData = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        
        chartData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          revenue: chartMap[dateStr] || 0
        });
      }

      return {
        todayRevenue: Number(revenue),
        todayTransactions: Number(count),
        activeProducts: Number(productsCount[0]?.count || 0),
        topProducts,
        chartData
      };
    } catch (error: any) {
      console.error('FULL ERROR:', error);
      console.error('ERROR STACK:', error.stack);
      console.error('ERROR CAUSE:', error.cause);
      return c.json({ error: 'Failed to load analytics: ' + (error as Error).message }, 400);
    }
  }
}
