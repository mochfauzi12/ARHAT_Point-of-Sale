import { Context } from 'hono';
import { TransactionService } from '../services/transaction.service';

export const transactionController = {
  async create(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    
    try {
      const transaction = await TransactionService.createTransaction(
        user.tenantId,
        user.id,
        body
      );
      return c.json({ message: 'Transaction created successfully', data: transaction }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async checkout(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    try {
      const transaction = await TransactionService.checkout(
        user.tenantId,
        id,
        body.paymentMethod,
        body.amount
      );
      return c.json({ message: 'Checkout successful', data: transaction });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
};
