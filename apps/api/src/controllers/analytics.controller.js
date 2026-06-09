import { AnalyticsService } from '../services/analytics.service';
import { memoryCache } from '../utils/cache';
export const analyticsController = {
    async getDashboard(c) {
        const user = c.get('user');
        try {
            const cacheKey = `dashboard_${user.tenantId}`;
            let data = memoryCache.get(cacheKey);
            if (!data) {
                data = await AnalyticsService.getDashboardData(user.tenantId);
                memoryCache.set(cacheKey, data, 60); // Cache for 60 seconds
            }
            return c.json({ data, cached: !!memoryCache.get(cacheKey) });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async getSales(c) {
        const user = c.get('user');
        try {
            const data = await AnalyticsService.getSalesAnalytics(user.tenantId);
            return c.json({ data });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async getProducts(c) {
        const user = c.get('user');
        try {
            const data = await AnalyticsService.getProductAnalytics(user.tenantId);
            return c.json({ data });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async getProfitLoss(c) {
        const user = c.get('user');
        try {
            const data = await AnalyticsService.getProfitLoss(user.tenantId);
            return c.json({ data });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async getCustomers(c) {
        const user = c.get('user');
        try {
            const data = await AnalyticsService.getCustomerAnalytics(user.tenantId);
            return c.json({ data });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
};
