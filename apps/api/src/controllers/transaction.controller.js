import { TransactionService } from '../services/transaction.service';
import { WhatsAppService } from '../services/whatsapp.service';
export const transactionController = {
    async list(c) {
        const user = c.get('user');
        try {
            const result = await TransactionService.listTransactions(user.tenantId);
            return c.json({ data: result });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async create(c) {
        const user = c.get('user');
        const body = await c.req.json();
        try {
            const transaction = await TransactionService.createTransaction(user.tenantId, user.id, body);
            // WhatsApp Receipt Trigger (Mock)
            if (body.customerPhone) {
                // Send asynchronously so it doesn't block the API response
                WhatsAppService.sendReceipt(body.customerPhone, transaction).catch(console.error);
            }
            return c.json({ message: 'Transaction created successfully', data: transaction }, 201);
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async checkout(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();
        try {
            const transaction = await TransactionService.checkout(user.tenantId, id, body.paymentMethod, body.amount);
            return c.json({ message: 'Checkout successful', data: transaction });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async hold(c) {
        const user = c.get('user');
        const body = await c.req.json();
        try {
            const transaction = await TransactionService.holdTransaction(user.tenantId, user.id, body);
            return c.json({ message: 'Transaction held successfully', data: transaction }, 201);
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async getHeld(c) {
        const user = c.get('user');
        try {
            const transactions = await TransactionService.getHeldTransactions(user.tenantId);
            return c.json({ data: transactions });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async resume(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        try {
            const transaction = await TransactionService.resumeTransaction(user.tenantId, id);
            return c.json({ message: 'Transaction resumed', data: transaction });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async refund(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        try {
            const transaction = await TransactionService.refundTransaction(user.tenantId, id);
            return c.json({ message: 'Transaction refunded', data: transaction });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    },
    async voidTransaction(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        try {
            const transaction = await TransactionService.voidTransaction(user.tenantId, id);
            return c.json({ message: 'Transaction voided', data: transaction });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
};
