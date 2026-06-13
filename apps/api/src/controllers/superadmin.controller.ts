import { Context } from 'hono';
import { db } from '../lib/db';
import { tenants, users, outlets, products, transactions, transactionItems, payments, customers, stockMovements, shifts, discounts, productStocks, productVariants, productModifiers, whatsappMessages, stockAdjustments, stockAdjustmentItems, stockOpnameSessions, stockOpnameItems, stockTransfers, stockTransferItems, rawMaterials, rawMaterialStocks, boms, sessions, emailVerificationTokens, passwordResetTokens } from '../models';
import { eq, sql, inArray } from 'drizzle-orm';
import { AppError } from '../lib/errors';

// Middleware check for superadmin role
function assertSuperadmin(c: Context) {
  const user = c.get('user');
  if (user.role !== 'superadmin') {
    throw new AppError('Unauthorized: Only superadmin can perform this action', 403);
  }
}

export const getTenants = async (c: Context) => {
  assertSuperadmin(c);

  try {
    const allTenants = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        email: tenants.email,
        createdAt: sql`MIN(${outlets.createdAt})`.as('created_at'),
        outletCount: sql`COUNT(DISTINCT ${outlets.id})`.as('outlet_count'),
        userCount: sql`COUNT(DISTINCT ${users.id})`.as('user_count'),
      })
      .from(tenants)
      .leftJoin(outlets, eq(outlets.tenantId, tenants.id))
      .leftJoin(users, eq(users.tenantId, tenants.id))
      .groupBy(tenants.id, tenants.name, tenants.email);

    return c.json({ success: true, data: allTenants });
  } catch (error: any) {
    console.error('Get tenants error:', error);
    throw new AppError('Failed to fetch tenants', 500);
  }
};

export const deactivateTenant = async (c: Context) => {
  assertSuperadmin(c);
  const tenantId = c.req.param('id');

  try {
    // Deactivate all users under this tenant
    await db.update(users)
      .set({ status: 'inactive' })
      .where(eq(users.tenantId, tenantId));

    return c.json({ success: true, message: 'Tenant has been deactivated. All users are now inactive.' });
  } catch (error: any) {
    console.error('Deactivate tenant error:', error);
    throw new AppError('Failed to deactivate tenant', 500);
  }
};

export const activateTenant = async (c: Context) => {
  assertSuperadmin(c);
  const tenantId = c.req.param('id');

  try {
    // Re-activate all users under this tenant
    await db.update(users)
      .set({ status: 'active' })
      .where(eq(users.tenantId, tenantId));

    return c.json({ success: true, message: 'Tenant has been activated. All users are now active.' });
  } catch (error: any) {
    console.error('Activate tenant error:', error);
    throw new AppError('Failed to activate tenant', 500);
  }
};

export const deleteTenant = async (c: Context) => {
  assertSuperadmin(c);
  const tenantId = c.req.param('id');

  try {
    // Delete in correct order to respect foreign key constraints
    // 1. Transaction-related
    const txList = await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.tenantId, tenantId));
    const txIds = txList.map(t => t.id);
    if (txIds.length > 0) {
      for (const txId of txIds) {
        await db.delete(transactionItems).where(eq(transactionItems.transactionId, txId));
        await db.delete(payments).where(eq(payments.transactionId, txId));
        await db.delete(whatsappMessages).where(eq(whatsappMessages.transactionId, txId));
      }
      await db.delete(transactions).where(eq(transactions.tenantId, tenantId));
    }

    // 2. Inventory-related
    const outletList = await db.select({ id: outlets.id }).from(outlets).where(eq(outlets.tenantId, tenantId));
    const outletIds = outletList.map(o => o.id);

    // Stock transfers
    const transferList = await db.select({ id: stockTransfers.id }).from(stockTransfers).where(eq(stockTransfers.tenantId, tenantId));
    for (const t of transferList) {
      await db.delete(stockTransferItems).where(eq(stockTransferItems.transferId, t.id));
    }
    await db.delete(stockTransfers).where(eq(stockTransfers.tenantId, tenantId));

    // Stock adjustments
    const adjList = await db.select({ id: stockAdjustments.id }).from(stockAdjustments).where(eq(stockAdjustments.tenantId, tenantId));
    for (const a of adjList) {
      await db.delete(stockAdjustmentItems).where(eq(stockAdjustmentItems.adjustmentId, a.id));
    }
    await db.delete(stockAdjustments).where(eq(stockAdjustments.tenantId, tenantId));

    // Stock opname sessions
    const opnameList = await db.select({ id: stockOpnameSessions.id }).from(stockOpnameSessions).where(eq(stockOpnameSessions.tenantId, tenantId));
    for (const o of opnameList) {
      await db.delete(stockOpnameItems).where(eq(stockOpnameItems.opnameId, o.id));
    }
    await db.delete(stockOpnameSessions).where(eq(stockOpnameSessions.tenantId, tenantId));

    // Stock movements
    await db.delete(stockMovements).where(eq(stockMovements.tenantId, tenantId));

    // 3. Product-related
    const productList = await db.select({ id: products.id }).from(products).where(eq(products.tenantId, tenantId));
    const productIds = productList.map(p => p.id);
    if (productIds.length > 0) {
      for (const pId of productIds) {
        await db.delete(boms).where(eq(boms.productId, pId));
        await db.delete(productStocks).where(eq(productStocks.productId, pId));
        await db.delete(productVariants).where(eq(productVariants.productId, pId));
        await db.delete(productModifiers).where(eq(productModifiers.productId, pId));
      }
      await db.delete(products).where(eq(products.tenantId, tenantId));
    }

    // 4. Raw materials
    const rmList = await db.select({ id: rawMaterials.id }).from(rawMaterials).where(eq(rawMaterials.tenantId, tenantId));
    for (const rm of rmList) {
      await db.delete(rawMaterialStocks).where(eq(rawMaterialStocks.rawMaterialId, rm.id));
    }
    await db.delete(rawMaterials).where(eq(rawMaterials.tenantId, tenantId));

    // 5. Customers, Discounts, Shifts
    await db.delete(customers).where(eq(customers.tenantId, tenantId));
    await db.delete(discounts).where(eq(discounts.tenantId, tenantId));
    await db.delete(shifts).where(eq(shifts.tenantId, tenantId));

    // 6. WhatsApp messages (tenant-level)
    await db.delete(whatsappMessages).where(eq(whatsappMessages.tenantId, tenantId));

    // 7. Users (sessions, tokens)
    const userList = await db.select({ id: users.id }).from(users).where(eq(users.tenantId, tenantId));
    const userIds = userList.map(u => u.id);
    if (userIds.length > 0) {
      for (const uId of userIds) {
        await db.delete(sessions).where(eq(sessions.userId, uId));
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, uId));
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, uId));
      }
    }
    await db.delete(users).where(eq(users.tenantId, tenantId));

    // 8. Outlets
    await db.delete(outlets).where(eq(outlets.tenantId, tenantId));

    // 9. Finally, delete the tenant itself
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    return c.json({ success: true, message: 'Tenant and all associated data have been permanently deleted.' });
  } catch (error: any) {
    console.error('Delete tenant error:', error);
    throw new AppError('Failed to delete tenant: ' + error.message, 500);
  }
};

export const bulkDeactivateTenants = async (c: Context) => {
  assertSuperadmin(c);
  const { tenantIds } = await c.req.json();
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) {
    throw new AppError('No tenants selected', 400);
  }

  try {
    await db.update(users)
      .set({ status: 'inactive' })
      .where(inArray(users.tenantId, tenantIds));

    return c.json({ success: true, message: `${tenantIds.length} tenants have been deactivated.` });
  } catch (error: any) {
    console.error('Bulk deactivate tenants error:', error);
    throw new AppError('Failed to deactivate tenants', 500);
  }
};

export const bulkActivateTenants = async (c: Context) => {
  assertSuperadmin(c);
  const { tenantIds } = await c.req.json();
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) {
    throw new AppError('No tenants selected', 400);
  }

  try {
    await db.update(users)
      .set({ status: 'active' })
      .where(inArray(users.tenantId, tenantIds));

    return c.json({ success: true, message: `${tenantIds.length} tenants have been activated.` });
  } catch (error: any) {
    console.error('Bulk activate tenants error:', error);
    throw new AppError('Failed to activate tenants', 500);
  }
};

export const bulkDeleteTenants = async (c: Context) => {
  assertSuperadmin(c);
  const { tenantIds } = await c.req.json();
  if (!Array.isArray(tenantIds) || tenantIds.length === 0) {
    throw new AppError('No tenants selected', 400);
  }

  try {
    // For delete, we can iterate over the IDs and use the existing logic for each ID, 
    // or we can adjust it to use inArray. Iterating is safer to ensure all dependencies are caught per tenant.
    // Since this is a critical destructive operation, iteration over the deletion logic is acceptable.
    for (const tenantId of tenantIds) {
      // 1. Transaction-related
      const txList = await db.select({ id: transactions.id }).from(transactions).where(eq(transactions.tenantId, tenantId));
      const txIds = txList.map(t => t.id);
      if (txIds.length > 0) {
        for (const txId of txIds) {
          await db.delete(transactionItems).where(eq(transactionItems.transactionId, txId));
          await db.delete(payments).where(eq(payments.transactionId, txId));
          await db.delete(whatsappMessages).where(eq(whatsappMessages.transactionId, txId));
        }
        await db.delete(transactions).where(eq(transactions.tenantId, tenantId));
      }

      // 2. Inventory-related
      const outletList = await db.select({ id: outlets.id }).from(outlets).where(eq(outlets.tenantId, tenantId));
      const outletIds = outletList.map(o => o.id);

      // Stock transfers
      const transferList = await db.select({ id: stockTransfers.id }).from(stockTransfers).where(eq(stockTransfers.tenantId, tenantId));
      for (const t of transferList) {
        await db.delete(stockTransferItems).where(eq(stockTransferItems.transferId, t.id));
      }
      await db.delete(stockTransfers).where(eq(stockTransfers.tenantId, tenantId));

      // Stock adjustments
      const adjList = await db.select({ id: stockAdjustments.id }).from(stockAdjustments).where(eq(stockAdjustments.tenantId, tenantId));
      for (const a of adjList) {
        await db.delete(stockAdjustmentItems).where(eq(stockAdjustmentItems.adjustmentId, a.id));
      }
      await db.delete(stockAdjustments).where(eq(stockAdjustments.tenantId, tenantId));

      // Stock opname sessions
      const opnameList = await db.select({ id: stockOpnameSessions.id }).from(stockOpnameSessions).where(eq(stockOpnameSessions.tenantId, tenantId));
      for (const o of opnameList) {
        await db.delete(stockOpnameItems).where(eq(stockOpnameItems.opnameId, o.id));
      }
      await db.delete(stockOpnameSessions).where(eq(stockOpnameSessions.tenantId, tenantId));

      // Stock movements
      await db.delete(stockMovements).where(eq(stockMovements.tenantId, tenantId));

      // 3. Product-related
      const productList = await db.select({ id: products.id }).from(products).where(eq(products.tenantId, tenantId));
      const productIds = productList.map(p => p.id);
      if (productIds.length > 0) {
        for (const pId of productIds) {
          await db.delete(boms).where(eq(boms.productId, pId));
          await db.delete(productStocks).where(eq(productStocks.productId, pId));
          await db.delete(productVariants).where(eq(productVariants.productId, pId));
          await db.delete(productModifiers).where(eq(productModifiers.productId, pId));
        }
        await db.delete(products).where(eq(products.tenantId, tenantId));
      }

      // 4. Raw materials
      const rmList = await db.select({ id: rawMaterials.id }).from(rawMaterials).where(eq(rawMaterials.tenantId, tenantId));
      for (const rm of rmList) {
        await db.delete(rawMaterialStocks).where(eq(rawMaterialStocks.rawMaterialId, rm.id));
      }
      await db.delete(rawMaterials).where(eq(rawMaterials.tenantId, tenantId));

      // 5. Customers, Discounts, Shifts
      await db.delete(customers).where(eq(customers.tenantId, tenantId));
      await db.delete(discounts).where(eq(discounts.tenantId, tenantId));
      await db.delete(shifts).where(eq(shifts.tenantId, tenantId));

      // 6. WhatsApp messages (tenant-level)
      await db.delete(whatsappMessages).where(eq(whatsappMessages.tenantId, tenantId));

      // 7. Users (sessions, tokens)
      const userList = await db.select({ id: users.id }).from(users).where(eq(users.tenantId, tenantId));
      const userIds = userList.map(u => u.id);
      if (userIds.length > 0) {
        for (const uId of userIds) {
          await db.delete(sessions).where(eq(sessions.userId, uId));
          await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, uId));
          await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, uId));
        }
      }
      await db.delete(users).where(eq(users.tenantId, tenantId));

      // 8. Outlets
      await db.delete(outlets).where(eq(outlets.tenantId, tenantId));

      // 9. Finally, delete the tenant itself
      await db.delete(tenants).where(eq(tenants.id, tenantId));
    }

    return c.json({ success: true, message: `${tenantIds.length} tenants have been permanently deleted.` });
  } catch (error: any) {
    console.error('Bulk delete tenants error:', error);
    throw new AppError('Failed to delete tenants: ' + error.message, 500);
  }
};
