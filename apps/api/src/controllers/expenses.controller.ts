import { Context } from 'hono';
import { db } from '../lib/db';
import { expenses } from '../models';
import { eq, and, desc } from 'drizzle-orm';

export const expensesController = {
  async getExpenses(c: Context) {
    const user = c.get('user');
    try {
      const data = await db
        .select()
        .from(expenses)
        .where(eq(expenses.tenantId, user.tenantId))
        .orderBy(desc(expenses.date));
      return c.json({ data });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async createExpense(c: Context) {
    const user = c.get('user');
    try {
      const body = await c.req.json();
      const newExpense = await db.insert(expenses).values({
        tenantId: user.tenantId,
        outletId: body.outletId, // Optional
        category: body.category,
        amount: body.amount.toString(),
        date: body.date ? new Date(body.date) : new Date(),
        notes: body.notes,
        recordedBy: user.id
      }).returning();
      
      return c.json({ data: newExpense[0] }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async updateExpense(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      const body = await c.req.json();
      
      // Verify ownership
      const existing = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.tenantId, user.tenantId)));
      if (!existing.length) {
        return c.json({ error: 'Expense not found' }, 404);
      }

      const updatedExpense = await db.update(expenses).set({
        category: body.category,
        amount: body.amount ? body.amount.toString() : undefined,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
        updatedAt: new Date()
      }).where(eq(expenses.id, id)).returning();
      
      return c.json({ data: updatedExpense[0] });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async deleteExpense(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      // Verify ownership
      const existing = await db.select().from(expenses).where(and(eq(expenses.id, id), eq(expenses.tenantId, user.tenantId)));
      if (!existing.length) {
        return c.json({ error: 'Expense not found' }, 404);
      }

      await db.delete(expenses).where(eq(expenses.id, id));
      return c.json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
};
