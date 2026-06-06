import { AnalyticsService } from '../services/analytics.service';
export const analyticsController = {
    async getDashboard(c) {
        const user = c.get('user');
        try {
            const data = await AnalyticsService.getDashboardData(user.tenantId);
            return c.json({ data });
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
    }
};
