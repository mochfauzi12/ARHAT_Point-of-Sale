import { Hono } from 'hono';
import { db } from '../lib/db';
import { users } from '../models';
import { eq } from 'drizzle-orm';
import { AppError } from '../lib/errors';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { authService } from '../services/auth.service';
const usersRoutes = new Hono();
// Get all users for tenant
usersRoutes.get('/', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || !user.tenantId) {
        throw new AppError('Unauthorized', 401);
    }
    // Admin and supervisor can view users
    if (user.role !== 'admin' && user.role !== 'supervisor') {
        throw new AppError('Forbidden', 403);
    }
    const userList = await db.select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        status: users.status,
        lastLogin: users.lastLogin
    }).from(users).where(eq(users.tenantId, user.tenantId));
    return c.json({ success: true, data: userList });
});
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    role: z.enum(['admin', 'supervisor', 'cashier']),
    pin: z.string().optional(),
});
// Create new user
usersRoutes.post('/', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || !user.tenantId) {
        throw new AppError('Unauthorized', 401);
    }
    // Only admin can create users
    if (user.role !== 'admin') {
        throw new AppError('Forbidden: Only admins can manage users', 403);
    }
    const body = await c.req.json();
    const data = createUserSchema.parse(body);
    const newUser = await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        tenantId: user.tenantId,
    });
    // Update role and pin
    const updatedUser = await db.update(users)
        .set({
        role: data.role,
        pin: data.pin || null,
    })
        .where(eq(users.id, newUser.id))
        .returning();
    return c.json({
        success: true,
        data: {
            id: updatedUser[0].id,
            email: updatedUser[0].email,
            fullName: updatedUser[0].fullName,
            role: updatedUser[0].role
        }
    }, 201);
});
export default usersRoutes;
