import { Hono } from 'hono';
import { analyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth';

const analyticsRoutes = new Hono();

analyticsRoutes.use('*', authMiddleware);
analyticsRoutes.get('/dashboard', analyticsController.getDashboard);

export default analyticsRoutes;
