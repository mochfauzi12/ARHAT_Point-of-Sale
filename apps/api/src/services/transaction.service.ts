import { eq, and, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { 
  transactions, 
  transactionItems, 
  payments, 
  stockMovements, 
  products,
  customers,
  shifts,
  boms,
  rawMaterialStocks
} from '../models';

export class TransactionService {
  /**
   * List recent transactions
   */
  static async listTransactions(tenantId: string) {
    // Get last 50 transactions, ordered by descending createdAt
    return await db.select()
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
  }

  /**
   * Create a new transaction (POS Cart save)
   */
  static async createTransaction(
    tenantId: string, 
    cashierId: string, 
    payload: {
      customerId?: string;
      pointsRedeemed?: number;
      items: Array<{ 
        productId: string, 
        quantity: number, 
        unitPrice: number, 
        subtotal: number,
        variantId?: string,
        variantName?: string,
        modifiers?: any
      }>;
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
      // Find active shift
      const activeShift = await tx.select().from(shifts).where(
        and(
          eq(shifts.tenantId, tenantId),
          eq(shifts.cashierId, cashierId),
          eq(shifts.status, 'open')
        )
      ).limit(1);
      
      const currentShiftId = activeShift.length > 0 ? activeShift[0].id : null;

      // 1. Insert header
      const txResult = await tx.insert(transactions).values({
        tenantId,
        cashierId,
        shiftId: currentShiftId,
        customerId: payload.customerId,
        transactionNumber: txNumber,
        status: 'pending',
        subtotal: payload.subtotal.toString(),
        taxAmount: payload.taxAmount.toString(),
        discountAmount: payload.discountAmount.toString(),
        totalAmount: payload.totalAmount.toString(),
        pointsRedeemed: payload.pointsRedeemed?.toString() || '0',
      }).returning();
      
      const transactionId = txResult[0].id;
      
      // 2. Insert items
      if (payload.items.length > 0) {
        const itemsToInsert = payload.items.map(item => ({
          transactionId,
          productId: item.productId,
          variantId: item.variantId,
          variantName: item.variantName,
          modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
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
          if (!prod[0].isService) {
            const soldQty = parseInt(item.quantity);
            
            // Check BOM
            const productBoms = await tx.select().from(boms).where(eq(boms.productId, item.productId));
            
            if (productBoms.length > 0) {
              // Deduct Raw Materials instead of the finished product
              for (const bomItem of productBoms) {
                const requiredQty = parseFloat(bomItem.quantity) * soldQty;
                
                // Get raw material stock
                const rmStocks = await tx.select().from(rawMaterialStocks).where(eq(rawMaterialStocks.rawMaterialId, bomItem.rawMaterialId)).limit(1);
                
                if (rmStocks.length > 0) {
                  const currentRmStock = parseFloat(rmStocks[0].stockQuantity || '0');
                  const newRmStock = currentRmStock - requiredQty;
                  
                  await tx.update(rawMaterialStocks)
                    .set({ stockQuantity: newRmStock.toString() })
                    .where(eq(rawMaterialStocks.id, rmStocks[0].id));
                }
              }
            } else {
              // Standard Product deduction
              const currentStock = parseInt(prod[0].stockQuantity || '0');
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
        }
      }

      // 4. Handle Customer Points if applicable
      const txData = await tx.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
      if (txData.length && txData[0].customerId) {
        const total = parseFloat(txData[0].totalAmount);
        let basePointsEarned = Math.floor(total / 1000); // 1 point per 1000 spent
        
        // Fetch customer to determine tier and apply bonus
        const customerData = await tx.select().from(customers).where(eq(customers.id, txData[0].customerId)).limit(1);
        let finalPointsEarned = basePointsEarned;
        
        if (customerData.length > 0) {
          const currentSpent = parseFloat(customerData[0].totalSpent || '0');
          
          // Determine Tier Bonus (Silver: 1%, Gold: 2%, Platinum: 3%)
          let bonusPercentage = 0;
          if (currentSpent > 10000000) {
            bonusPercentage = 0.03; // Platinum
          } else if (currentSpent >= 1000000) {
            bonusPercentage = 0.02; // Gold
          } else {
            bonusPercentage = 0.01; // Silver
          }
          
          finalPointsEarned = Math.floor(basePointsEarned * (1 + bonusPercentage));
          const pointsRedeemed = parseInt(txData[0].pointsRedeemed || '0');
          
          // Update transaction with actual points earned
          await tx.update(transactions)
            .set({ pointsEarned: finalPointsEarned.toString() })
            .where(eq(transactions.id, transactionId));

          const currentPoints = parseInt(customerData[0].points || '0');
          
          await tx.update(customers).set({
            points: (currentPoints + finalPointsEarned - pointsRedeemed).toString(),
            totalSpent: (currentSpent + total).toString()
          }).where(eq(customers.id, txData[0].customerId));
        }
      }

      return updatedTx[0];
    });
  }

  /**
   * Hold a transaction
   */
  static async holdTransaction(
    tenantId: string, 
    cashierId: string, 
    payload: {
      notes: string;
      items: Array<{ 
        productId: string, 
        quantity: number, 
        unitPrice: number, 
        subtotal: number, 
        discount: number, 
        tax: number,
        variantId?: string,
        variantName?: string,
        modifiers?: any
      }>;
      subtotal: number;
      taxAmount: number;
      discountAmount: number;
      totalAmount: number;
    }
  ) {
    const txNumber = `HLD-${Date.now()}`;
    return await db.transaction(async (tx) => {
      const txResult = await tx.insert(transactions).values({
        tenantId,
        cashierId,
        transactionNumber: txNumber,
        status: 'held',
        notes: payload.notes,
        subtotal: payload.subtotal.toString(),
        taxAmount: payload.taxAmount.toString(),
        discountAmount: payload.discountAmount.toString(),
        totalAmount: payload.totalAmount.toString(),
        heldUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }).returning();
      
      const transactionId = txResult[0].id;
      
      if (payload.items.length > 0) {
        const itemsToInsert = payload.items.map(item => ({
          transactionId,
          productId: item.productId,
          variantId: item.variantId,
          variantName: item.variantName,
          modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          discount: (item.discount || 0).toString(),
          tax: (item.tax || 0).toString(),
          subtotal: item.subtotal.toString()
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }
      return txResult[0];
    });
  }

  /**
   * Get all held transactions
   */
  static async getHeldTransactions(tenantId: string) {
    const held = await db.select().from(transactions).where(
      and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, 'held')
      )
    );

    // Get items for each held transaction
    const result = [];
    for (const tx of held) {
      const items = await db.select({
        id: transactionItems.id,
        productId: transactionItems.productId,
        quantity: transactionItems.quantity,
        unitPrice: transactionItems.unitPrice,
        discount: transactionItems.discount,
        subtotal: transactionItems.subtotal,
        variantId: transactionItems.variantId,
        variantName: transactionItems.variantName,
        modifiers: transactionItems.modifiers,
        productName: products.name,
        productImage: products.imageUrl
      }).from(transactionItems)
      .leftJoin(products, eq(transactionItems.productId, products.id))
      .where(eq(transactionItems.transactionId, tx.id));
      
      result.push({ ...tx, items });
    }
    return result;
  }

  /**
   * Resume a held transaction (moves it to pending)
   */
  static async resumeTransaction(tenantId: string, transactionId: string) {
    const updatedTx = await db.update(transactions)
      .set({ status: 'pending' })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.tenantId, tenantId),
          eq(transactions.status, 'held')
        )
      ).returning();
    if (!updatedTx.length) throw new Error('Held transaction not found');
    return updatedTx[0];
  }

  /**
   * Refund a completed transaction
   */
  static async refundTransaction(tenantId: string, transactionId: string) {
    return await db.transaction(async (tx) => {
      // 1. Update status
      const updatedTx = await tx.update(transactions)
        .set({ status: 'refunded' })
        .where(
          and(
            eq(transactions.id, transactionId),
            eq(transactions.tenantId, tenantId),
            eq(transactions.status, 'completed')
          )
        ).returning();

      if (!updatedTx.length) throw new Error('Transaction not found or not completed');

      // 2. Refund Payment
      await tx.update(payments)
        .set({ status: 'refunded' })
        .where(eq(payments.transactionId, transactionId));

      // 3. Restore Stock
      const items = await tx.select().from(transactionItems).where(eq(transactionItems.transactionId, transactionId));
      for (const item of items) {
        const prod = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
        if (prod.length > 0) {
          const currentStock = parseInt(prod[0].stockQuantity || '0');
          const refundQty = parseInt(item.quantity);
          const newStock = currentStock + refundQty;
          
          await tx.update(products).set({ stockQuantity: newStock.toString() }).where(eq(products.id, item.productId));
          
          await tx.insert(stockMovements).values({
            tenantId,
            productId: item.productId,
            movementType: 'in',
            referenceType: 'transaction',
            referenceId: transactionId,
            quantity: refundQty.toString(),
            reason: 'Refund'
          });
        }
      }
      return updatedTx[0];
    });
  }

  /**
   * Void a pending or uncompleted transaction
   */
  static async voidTransaction(tenantId: string, transactionId: string) {
    const updatedTx = await db.update(transactions)
      .set({ status: 'voided' })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.tenantId, tenantId)
        )
      ).returning();
    if (!updatedTx.length) throw new Error('Transaction not found');
    return updatedTx[0];
  }
}
