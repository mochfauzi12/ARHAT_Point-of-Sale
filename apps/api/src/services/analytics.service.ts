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
      throw new Error('Failed to load analytics: ' + (error as Error).message);
    }
  }

  static async getSalesAnalytics(tenantId: string) {
    try {
      const allTransactionsRaw = await db
        .select({
          id: transactions.id,
          totalAmount: transactions.totalAmount,
          createdAt: transactions.createdAt,
          paymentMethod: transactions.paymentMethod
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.tenantId, tenantId),
            eq(transactions.status, 'completed')
          )
        );

      let totalRevenue = 0;
      let totalTransactions = allTransactionsRaw.length;
      
      const paymentMethodMap: Record<string, number> = {};
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      const chartMap: Record<string, number> = {};
      
      for (const t of allTransactionsRaw) {
        if (!t.createdAt) continue;
        const amt = Number(t.totalAmount) || 0;
        totalRevenue += amt;
        
        // Payment methods
        const method = t.paymentMethod || 'Unknown';
        paymentMethodMap[method] = (paymentMethodMap[method] || 0) + amt;
        
        // Chart data
        const txDateObj = new Date(t.createdAt);
        if (txDateObj >= thirtyDaysAgo) {
          const dateStr = txDateObj.toISOString().split('T')[0];
          chartMap[dateStr] = (chartMap[dateStr] || 0) + amt;
        }
      }

      const paymentMethodData = Object.keys(paymentMethodMap).map(name => ({
        name: name === 'cash' ? 'Tunai' : name === 'qris' ? 'QRIS' : name === 'transfer' ? 'Transfer' : name,
        value: paymentMethodMap[name]
      }));

      const chartData = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        chartData.push({
          date: dateStr,
          revenue: chartMap[dateStr] || 0
        });
      }

      return {
        totalRevenue,
        totalTransactions,
        paymentMethodData,
        chartData
      };
    } catch (error: any) {
      throw new Error('Failed to load sales analytics: ' + error.message);
    }
  }

  static async getProductAnalytics(tenantId: string) {
    try {
      const allTxItems = await db
        .select({
          productId: products.id,
          productName: products.name,
          quantity: transactionItems.quantity,
          subtotal: transactionItems.subtotal,
          stock: products.stockQuantity
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

      const productMap: Record<string, { id: string, name: string, stock: number, totalQuantity: number, totalRevenue: number }> = {};
      
      for (const item of allTxItems) {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            stock: Number(item.stock) || 0,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        productMap[item.productId].totalQuantity += Number(item.quantity) || 0;
        productMap[item.productId].totalRevenue += Number(item.subtotal) || 0;
      }

      const topProductsByQty = Object.values(productMap).sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10);
      const topProductsByRev = Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

      // Identify slow moving products (exists in products but low or 0 sales)
      const allProducts = await db.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)));
      const slowMoving = allProducts.filter(p => !productMap[p.id] || productMap[p.id].totalQuantity < 2).slice(0, 10).map(p => ({
        id: p.id,
        name: p.name,
        stock: Number(p.stockQuantity) || 0,
        totalQuantity: productMap[p.id]?.totalQuantity || 0
      }));

      return {
        topProductsByQty,
        topProductsByRev,
        slowMoving
      };
    } catch (error: any) {
      throw new Error('Failed to load product analytics: ' + error.message);
    }
  }

  static async getProfitLoss(tenantId: string) {
    try {
      const allTxItems = await db
        .select({
          createdAt: transactions.createdAt,
          quantity: transactionItems.quantity,
          subtotal: transactionItems.subtotal,
          purchasePrice: products.purchasePrice
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

      let totalRevenue = 0;
      let totalCOGS = 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const chartMap: Record<string, { revenue: number, cogs: number }> = {};

      for (const item of allTxItems) {
        const qty = Number(item.quantity) || 0;
        const rev = Number(item.subtotal) || 0;
        const pp = Number(item.purchasePrice) || 0;
        const cogs = qty * pp;

        totalRevenue += rev;
        totalCOGS += cogs;

        if (item.createdAt) {
          const txDateObj = new Date(item.createdAt);
          if (txDateObj >= thirtyDaysAgo) {
            const dateStr = txDateObj.toISOString().split('T')[0];
            if (!chartMap[dateStr]) chartMap[dateStr] = { revenue: 0, cogs: 0 };
            chartMap[dateStr].revenue += rev;
            chartMap[dateStr].cogs += cogs;
          }
        }
      }

      const chartData = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = chartMap[dateStr] || { revenue: 0, cogs: 0 };
        chartData.push({
          date: dateStr,
          revenue: dayData.revenue,
          profit: dayData.revenue - dayData.cogs
        });
      }

      return {
        totalRevenue,
        totalCOGS,
        grossProfit: totalRevenue - totalCOGS,
        margin: totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0,
        chartData
      };
    } catch (error: any) {
      throw new Error('Failed to load P&L analytics: ' + error.message);
    }
  }
}
