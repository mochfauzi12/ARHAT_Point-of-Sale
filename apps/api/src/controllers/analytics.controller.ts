import { Context } from 'hono';
import { AnalyticsService } from '../services/analytics.service';

export const analyticsController = {
  async getDashboard(c: Context) {
    const user = c.get('user');
    try {
      const data = await AnalyticsService.getDashboardData(user.tenantId);
      return c.json({ data });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
};
