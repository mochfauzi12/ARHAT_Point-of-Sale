import { Hono } from 'hono';
import { ShiftService } from '../services/shift.service';
import { authMiddleware } from '../middleware/auth';
import { AppError } from '../lib/errors';
const shiftsRoutes = new Hono();
shiftsRoutes.use('*', authMiddleware);
shiftsRoutes.get('/', async (c) => {
    const user = c.get('user');
    const shifts = await ShiftService.listShifts(user.tenantId);
    return c.json({ success: true, data: shifts });
});
shiftsRoutes.get('/current', async (c) => {
    const user = c.get('user');
    const shift = await ShiftService.getCurrentShift(user.tenantId, user.id);
    return c.json({ success: true, data: shift });
});
shiftsRoutes.post('/open', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    if (body.startingCash === undefined) {
        throw new AppError('startingCash is required', 400);
    }
    const shift = await ShiftService.openShift(user.tenantId, user.id, body.outletId || null, Number(body.startingCash));
    return c.json({ success: true, data: shift });
});
shiftsRoutes.post('/close', async (c) => {
    const user = c.get('user');
    const body = await c.req.json();
    if (body.actualEndingCash === undefined) {
        throw new AppError('actualEndingCash is required', 400);
    }
    const shift = await ShiftService.closeShift(user.tenantId, user.id, Number(body.actualEndingCash), body.notes);
    return c.json({ success: true, data: shift });
});
export default shiftsRoutes;
