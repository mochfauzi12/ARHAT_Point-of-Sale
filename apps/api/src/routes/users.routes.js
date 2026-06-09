import { Hono } from 'hono';
import * as bcrypt from 'bcryptjs';
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
    // Update role, pin, and bypass email verification since admin created them
    const updatedUser = await db.update(users)
        .set({
        role: data.role,
        pin: data.pin || null,
        emailVerified: true,
    })
        .where(eq(users.id, newUser.user.id))
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
const updateUserSchema = z.object({
    fullName: z.string().min(1).optional(),
    role: z.enum(['admin', 'supervisor', 'cashier']).optional(),
    password: z.string().min(6).optional(),
    pin: z.string().optional(),
});
// Update user
usersRoutes.put('/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
        throw new AppError('Forbidden: Only admins can manage users', 403);
    }
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateUserSchema.parse(body);
    const updateData = {};
    if (data.fullName)
        updateData.fullName = data.fullName;
    if (data.role)
        updateData.role = data.role;
    if (data.password)
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
    if (data.pin !== undefined)
        updateData.pin = data.pin;
    const updatedUser = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
    if (updatedUser.length === 0) {
        throw new AppError('User not found', 404);
    }
    return c.json({ success: true, data: updatedUser[0] });
});
// Delete user
usersRoutes.delete('/:id', authMiddleware, async (c) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
        throw new AppError('Forbidden: Only admins can manage users', 403);
    }
    const id = c.req.param('id');
    if (id === user.id) {
        throw new AppError('Cannot delete yourself', 400);
    }
    const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();
    if (deletedUser.length === 0) {
        throw new AppError('User not found', 404);
    }
    return c.json({ success: true });
});
export default usersRoutes;
