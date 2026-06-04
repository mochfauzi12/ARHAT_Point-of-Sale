import { Hono } from 'hono';
import { inventoryService } from '../services/inventory.service';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../lib/errors';

const inventoryRoutes = new Hono();

// Secure all inventory routes
inventoryRoutes.use('*', authMiddleware);

inventoryRoutes.get('/movements', async (c) => {
  const user = c.get('user');
  const movements = await inventoryService.getStockMovements(user.tenantId);
  return c.json({ success: true, data: movements });
});

inventoryRoutes.post('/restock', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  if (!body.productId || !body.quantity) {
    throw new AppError('Product ID and quantity are required', 400);
  }

  const result = await inventoryService.restockProduct(user.tenantId, body.productId, Number(body.quantity), body.reason);
  return c.json({ success: true, data: result });
});

export default inventoryRoutes;
