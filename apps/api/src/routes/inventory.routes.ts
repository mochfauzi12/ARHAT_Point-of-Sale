import { Hono } from 'hono';
import { inventoryService } from '../services/inventory.service';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../lib/errors';

const inventoryRoutes = new Hono();
inventoryRoutes.use('*', authMiddleware);

inventoryRoutes.get('/movements', async (c) => {
  const user = c.get('user');
  const movements = await inventoryService.getStockMovements(user.tenantId);
  return c.json({ success: true, data: movements });
});

// 1. Outlets
inventoryRoutes.get('/outlets', async (c) => {
  const user = c.get('user');
  const outlets = await inventoryService.getOutlets(user.tenantId);
  return c.json({ success: true, data: outlets });
});

inventoryRoutes.post('/outlets', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  if (!body.name) throw new AppError('Outlet name is required', 400);
  const result = await inventoryService.createOutlet(user.tenantId, body.name, body.address || '');
  return c.json({ success: true, data: result });
});

// 2. Product Stocks by Outlet
inventoryRoutes.get('/outlets/:outletId/products', async (c) => {
  const user = c.get('user');
  const { outletId } = c.req.param();
  const products = await inventoryService.getProductStockByOutlet(user.tenantId, outletId);
  return c.json({ success: true, data: products });
});

// 3. Stock Movements
inventoryRoutes.post('/movements', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  if (!body.outletId || !body.productId || !body.type || !body.quantity) {
    throw new AppError('Missing required fields', 400);
  }
  const result = await inventoryService.recordStockMovement(
    user.tenantId, body.outletId, user.id, 
    { productId: body.productId, type: body.type, quantity: Number(body.quantity), reason: body.reason || '' }
  );
  return c.json({ success: true, data: result });
});

// 4. Adjustments
inventoryRoutes.get('/outlets/:outletId/adjustments', async (c) => {
  const user = c.get('user');
  const { outletId } = c.req.param();
  const adjustments = await inventoryService.getAdjustments(user.tenantId, outletId);
  return c.json({ success: true, data: adjustments });
});

inventoryRoutes.post('/outlets/:outletId/adjustments', async (c) => {
  const user = c.get('user');
  const { outletId } = c.req.param();
  const body = await c.req.json();
  const result = await inventoryService.createAdjustment(user.tenantId, outletId, user.id, body.items);
  return c.json({ success: true, data: result });
});

inventoryRoutes.patch('/adjustments/:id/approve', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const result = await inventoryService.approveAdjustment(user.tenantId, id, user.id);
  return c.json({ success: true, data: result });
});

// 5. Stock Opname
inventoryRoutes.post('/outlets/:outletId/opname', async (c) => {
  const user = c.get('user');
  const { outletId } = c.req.param();
  const result = await inventoryService.createOpname(user.tenantId, outletId, user.id);
  return c.json({ success: true, data: result });
});

inventoryRoutes.post('/opname/:id/complete', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const body = await c.req.json();
  const result = await inventoryService.completeOpname(user.tenantId, id, user.id, body.items);
  return c.json({ success: true, data: result });
});

// 6. Transfers
inventoryRoutes.post('/transfers', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  if (!body.sourceOutletId || !body.destinationOutletId || !body.items) {
    throw new AppError('Missing required fields', 400);
  }
  const result = await inventoryService.createTransfer(user.tenantId, body.sourceOutletId, body.destinationOutletId, user.id, body.items);
  return c.json({ success: true, data: result });
});

inventoryRoutes.patch('/transfers/:id/receive', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();
  const result = await inventoryService.receiveTransfer(user.tenantId, id, user.id);
  return c.json({ success: true, data: result });
});

export default inventoryRoutes;
