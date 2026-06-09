import { eq, and, desc } from 'drizzle-orm';
import { db } from '../lib/db';
import { shifts, transactions, users } from '../models';
export class ShiftService {
    /**
     * Start a new shift for a cashier
     */
    static async openShift(tenantId, cashierId, outletId, startingCash) {
        // Check if the cashier already has an open shift
        const existing = await db.select()
            .from(shifts)
            .where(and(eq(shifts.tenantId, tenantId), eq(shifts.cashierId, cashierId), eq(shifts.status, 'open'))).limit(1);
        if (existing.length > 0) {
            throw new Error('You already have an open shift');
        }
        const shift = await db.insert(shifts).values({
            tenantId,
            cashierId,
            outletId: outletId || null,
            startingCash: startingCash.toString(),
            status: 'open',
        }).returning();
        return shift[0];
    }
    /**
     * Get current active shift for a cashier
     */
    static async getCurrentShift(tenantId, cashierId) {
        const shift = await db.select()
            .from(shifts)
            .where(and(eq(shifts.tenantId, tenantId), eq(shifts.cashierId, cashierId), eq(shifts.status, 'open'))).limit(1);
        if (shift.length === 0)
            return null;
        // Calculate current expected cash (startingCash + Cash Sales inside this shift)
        const activeShift = shift[0];
        const shiftTransactions = await db.select()
            .from(transactions)
            .where(and(eq(transactions.tenantId, tenantId), eq(transactions.shiftId, activeShift.id), eq(transactions.status, 'completed'), eq(transactions.paymentMethod, 'Cash')));
        let totalCashSales = 0;
        for (const tx of shiftTransactions) {
            totalCashSales += parseFloat(tx.totalAmount);
        }
        const expectedCash = parseFloat(activeShift.startingCash) + totalCashSales;
        return {
            ...activeShift,
            expectedCash,
            totalCashSales,
            transactionCount: shiftTransactions.length
        };
    }
    /**
     * Close a shift
     */
    static async closeShift(tenantId, cashierId, actualEndingCash, notes) {
        const activeShiftInfo = await this.getCurrentShift(tenantId, cashierId);
        if (!activeShiftInfo) {
            throw new Error('No open shift found');
        }
        const closedShift = await db.update(shifts)
            .set({
            status: 'closed',
            endTime: new Date(),
            actualEndingCash: actualEndingCash.toString(),
            expectedEndingCash: activeShiftInfo.expectedCash.toString(),
            notes: notes || null
        })
            .where(eq(shifts.id, activeShiftInfo.id))
            .returning();
        return closedShift[0];
    }
    /**
     * List all shifts (for Reports)
     */
    static async listShifts(tenantId) {
        const allShifts = await db.select({
            id: shifts.id,
            startTime: shifts.startTime,
            endTime: shifts.endTime,
            startingCash: shifts.startingCash,
            actualEndingCash: shifts.actualEndingCash,
            expectedEndingCash: shifts.expectedEndingCash,
            status: shifts.status,
            cashierName: users.fullName
        })
            .from(shifts)
            .leftJoin(users, eq(shifts.cashierId, users.id))
            .where(eq(shifts.tenantId, tenantId))
            .orderBy(desc(shifts.startTime));
        return allShifts;
    }
}
