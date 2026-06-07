import { Context } from 'hono';
import { TransactionService } from '../services/transaction.service';
import { WhatsAppService } from '../services/whatsapp.service';

export const transactionController = {
  async list(c: Context) {
    const user = c.get('user');
    try {
      const result = await TransactionService.listTransactions(user.tenantId);
      return c.json({ data: result });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async create(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    
    try {
      const transaction = await TransactionService.createTransaction(
        user.tenantId,
        user.id,
        body
      );
      
      // WhatsApp Receipt Trigger (Mock)
      if (body.customerPhone) {
        // Send asynchronously so it doesn't block the API response
        WhatsAppService.sendReceipt(user.tenantId, body.customerPhone, transaction).catch(console.error);
      }
      
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
  },

  async offlineSync(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    
    try {
      // Create transaction
      const transaction = await TransactionService.createTransaction(
        user.tenantId,
        user.id,
        body
      );
      
      // Immediately checkout
      const completedTransaction = await TransactionService.checkout(
        user.tenantId,
        transaction.id,
        body.paymentMethod,
        body.totalAmount
      );

      // WhatsApp Receipt Trigger (Mock)
      if (body.customerPhone) {
        WhatsAppService.sendReceipt(user.tenantId, body.customerPhone, completedTransaction).catch(console.error);
      }
      
      return c.json({ message: 'Offline sync successful', data: completedTransaction }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async hold(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    try {
      const transaction = await TransactionService.holdTransaction(user.tenantId, user.id, body);
      return c.json({ message: 'Transaction held successfully', data: transaction }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async getHeld(c: Context) {
    const user = c.get('user');
    try {
      const transactions = await TransactionService.getHeldTransactions(user.tenantId);
      return c.json({ data: transactions });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async resume(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      const transaction = await TransactionService.resumeTransaction(user.tenantId, id);
      return c.json({ message: 'Transaction resumed', data: transaction });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async refund(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      const transaction = await TransactionService.refundTransaction(user.tenantId, id);
      return c.json({ message: 'Transaction refunded', data: transaction });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  },

  async voidTransaction(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    try {
      const transaction = await TransactionService.voidTransaction(user.tenantId, id);
      return c.json({ message: 'Transaction voided', data: transaction });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
};
