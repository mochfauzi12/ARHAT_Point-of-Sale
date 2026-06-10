import { Hono } from 'hono';
import { db } from '../lib/db';
import { customers, transactions } from '../models';
import { eq, desc, ilike, or, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

router.use('*', authMiddleware);

// Get all customers for tenant, optionally search
router.get('/', async (c) => {
  const user = c.get('user') as any;
  const tenantId = user.tenantId;
  const search = c.req.query('q');

  let query = db.select().from(customers).where(eq(customers.tenantId, tenantId)).$dynamic();
  
  if (search) {
    query = query.where(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.phone, `%${search}%`)
      )
    );
  }

  const results = await query.orderBy(desc(customers.createdAt));
  return c.json({ success: true, data: results });
});

// Get a single customer by ID
router.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user') as any;
  const tenantId = user.tenantId;

  const result = await db.select().from(customers).where(
    or(eq(customers.id, id), eq(customers.tenantId, tenantId)) // wait, needs AND
  );
  
  // let's do properly
  const correctResult = await db.select().from(customers).where(eq(customers.id, id));
  
  if (correctResult.length === 0 || correctResult[0].tenantId !== tenantId) {
    return c.json({ success: false, message: 'Customer not found' }, 404);
  }

  return c.json({ success: true, data: correctResult[0] });
});

// Create customer
router.post('/', async (c) => {
  const user = c.get('user') as any;
  const tenantId = user.tenantId;
  const body = await c.req.json();

  const newCustomer = await db.insert(customers).values({
    tenantId,
    name: body.name,
    phone: body.phone,
    email: body.email,
    notes: body.notes
  }).returning();

  return c.json({ success: true, data: newCustomer[0] });
});

// Update customer
router.put('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user') as any;
  const tenantId = user.tenantId;
  const body = await c.req.json();

  // verify ownership
  const existing = await db.select().from(customers).where(eq(customers.id, id));
  if (existing.length === 0 || existing[0].tenantId !== tenantId) {
    return c.json({ success: false, message: 'Customer not found' }, 404);
  }

  const updatedCustomer = await db.update(customers).set({
    name: body.name,
    phone: body.phone,
    email: body.email,
    notes: body.notes,
    updatedAt: new Date()
  }).where(eq(customers.id, id)).returning();

  return c.json({ success: true, data: updatedCustomer[0] });
});

// Get transactions for a customer
router.get('/:id/transactions', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user') as any;
  const tenantId = user.tenantId;

  // Verify ownership
  const customerResult = await db.select().from(customers).where(eq(customers.id, id));
  if (customerResult.length === 0 || customerResult[0].tenantId !== tenantId) {
    return c.json({ success: false, message: 'Customer not found' }, 404);
  }

  const txList = await db.select()
    .from(transactions)
    .where(
      and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.customerId, id),
        eq(transactions.status, 'completed')
      )
    )
    .orderBy(desc(transactions.createdAt))
    .limit(50);

  return c.json({ success: true, data: txList });
});

export default router;
