import { eq, and } from 'drizzle-orm';
import { db } from '../lib/db';
import { 
  transactions, 
  transactionItems, 
  payments, 
  stockMovements, 
  products 
} from '../models';

export class TransactionService {
  /**
   * Create a new transaction (POS Cart save)
   */
  static async createTransaction(
    tenantId: string, 
    cashierId: string, 
    payload: {
      items: Array<{ productId: string, quantity: number, unitPrice: number, subtotal: number }>;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
    }
  ) {
    // Basic transaction generation number
    const txNumber = `TRX-${Date.now()}`;
    
    // We use a database transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // 1. Insert header
      const txResult = await tx.insert(transactions).values({
        tenantId,
        cashierId,
        transactionNumber: txNumber,
        status: 'pending',
        subtotal: payload.subtotal.toString(),
        taxAmount: payload.taxAmount.toString(),
        discountAmount: payload.discountAmount.toString(),
        totalAmount: payload.totalAmount.toString(),
      }).returning();
      
      const transactionId = txResult[0].id;
      
      // 2. Insert items
      if (payload.items.length > 0) {
        const itemsToInsert = payload.items.map(item => ({
          transactionId,
          productId: item.productId,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          subtotal: item.subtotal.toString()
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }
      
      return txResult[0];
    });
  }

  /**
   * Process Checkout (Complete transaction, add payment, deduct stock)
   */
  static async checkout(
    tenantId: string, 
    transactionId: string,
    paymentMethod: string,
    amount: number
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update Transaction Status
      const updatedTx = await tx.update(transactions)
        .set({ 
          status: 'completed', 
          paymentMethod,
          paymentStatus: 'completed',
          completedAt: new Date()
        })
        .where(
          and(
            eq(transactions.id, transactionId),
            eq(transactions.tenantId, tenantId)
          )
        ).returning();

      if (!updatedTx.length) throw new Error('Transaction not found');

      // 2. Insert Payment Record
      await tx.insert(payments).values({
        transactionId,
        paymentMethod,
        amount: amount.toString(),
        status: 'completed'
      });

      // 3. Deduct Stock & Record Movements
      const items = await tx.select().from(transactionItems).where(eq(transactionItems.transactionId, transactionId));
      
      for (const item of items) {
        // Fetch current stock
        const prod = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (prod.length > 0) {
          const currentStock = parseInt(prod[0].stockQuantity || '0');
          const soldQty = parseInt(item.quantity);
          const newStock = currentStock - soldQty;
          
          // Update product stock
          await tx.update(products).set({ stockQuantity: newStock.toString() }).where(eq(products.id, item.productId));
          
          // Record stock movement
          await tx.insert(stockMovements).values({
            tenantId,
            productId: item.productId,
            movementType: 'out',
            referenceType: 'transaction',
            referenceId: transactionId,
            quantity: soldQty.toString(),
            reason: 'POS Sale'
          });
        }
      }

      return updatedTx[0];
    });
  }
}
