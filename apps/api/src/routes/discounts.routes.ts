import { Hono } from 'hono';
import { db } from '../db';
import { discounts } from '../models';
import { eq, and, getTableColumns } from 'drizzle-orm';
import { authMiddleware, requireTenant } from '../middleware/auth';

const router = new Hono();

router.use('*', authMiddleware);

// Get all discounts
router.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    const data = await db.select().from(discounts).where(eq(discounts.tenantId, user.tenantId));
    return c.json(data);
  } catch (err: any) {
    console.error('Failed to get discounts:', err);
    return c.json({ error: 'Failed to retrieve discounts' }, 500);
  }
});

// Validate discount code for checkout
router.get('/validate', async (c) => {
  const user = c.get('user');
  const code = c.req.query('code');
  const subtotal = parseFloat(c.req.query('subtotal') || '0');

  if (!code) return c.json({ error: 'Promo code is required' }, 400);

  try {
    const [discount] = await db.select()
      .from(discounts)
      .where(and(
        eq(discounts.tenantId, user.tenantId),
        eq(discounts.code, code.toUpperCase())
      ));

    if (!discount) return c.json({ error: 'Promo code not found' }, 404);
    if (!discount.isActive) return c.json({ error: 'Promo code is inactive' }, 400);

    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return c.json({ error: 'Promo code is not yet active' }, 400);
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return c.json({ error: 'Promo code has expired' }, 400);
    }

    if (discount.minPurchaseAmount && subtotal < parseFloat(discount.minPurchaseAmount)) {
      return c.json({ error: `Minimum purchase of Rp ${parseFloat(discount.minPurchaseAmount).toLocaleString('id-ID')} required` }, 400);
    }

    // Calculate discount amount based on subtotal
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * parseFloat(discount.value)) / 100;
    } else {
      discountAmount = parseFloat(discount.value);
    }

    // Cap discount to subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return c.json({
      id: discount.id,
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: parseFloat(discount.value),
      calculatedAmount: discountAmount
    });
  } catch (err: any) {
    console.error('Failed to validate discount:', err);
    return c.json({ error: 'Failed to validate promo code' }, 500);
  }
});

// Create discount
router.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  if (user.role !== 'admin' && user.role !== 'supervisor') {
    return c.json({ error: 'Unauthorized. Only admins can create discounts.' }, 403);
  }

  try {
    const [newDiscount] = await db.insert(discounts).values({
      tenantId: user.tenantId,
      code: body.code.toUpperCase(),
      description: body.description,
      type: body.type,
      value: body.value.toString(),
      minPurchaseAmount: (body.minPurchaseAmount || 0).toString(),
      isActive: body.isActive !== undefined ? body.isActive : true,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    }).returning();
    
    return c.json(newDiscount, 201);
  } catch (err: any) {
    console.error('Failed to create discount:', err);
    if (err.code === '23505') {
       return c.json({ error: 'Promo code already exists' }, 400);
    }
    return c.json({ error: 'Failed to create discount' }, 500);
  }
});

// Update discount
router.put('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  if (user.role !== 'admin' && user.role !== 'supervisor') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const [updated] = await db.update(discounts).set({
      code: body.code ? body.code.toUpperCase() : undefined,
      description: body.description,
      type: body.type,
      value: body.value ? body.value.toString() : undefined,
      minPurchaseAmount: body.minPurchaseAmount ? body.minPurchaseAmount.toString() : undefined,
      isActive: body.isActive,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(discounts.id, id), eq(discounts.tenantId, user.tenantId)))
    .returning();
    
    if (!updated) return c.json({ error: 'Discount not found' }, 404);
    
    return c.json(updated);
  } catch (err: any) {
    console.error('Failed to update discount:', err);
    return c.json({ error: 'Failed to update discount' }, 500);
  }
});

// Delete discount
router.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  if (user.role !== 'admin') {
    return c.json({ error: 'Unauthorized. Only admins can delete discounts.' }, 403);
  }

  try {
    const [deleted] = await db.delete(discounts)
      .where(and(eq(discounts.id, id), eq(discounts.tenantId, user.tenantId)))
      .returning();
      
    if (!deleted) return c.json({ error: 'Discount not found' }, 404);
    
    return c.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete discount:', err);
    return c.json({ error: 'Failed to delete discount' }, 500);
  }
});

export default router;
