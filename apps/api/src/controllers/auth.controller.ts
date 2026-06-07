import { Context } from 'hono';
import { authService } from '../services/auth.service';
import { AppError } from '../lib/errors';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
  tenantId: z.string().uuid(),
});

const registerTenantSchema = z.object({
  tenantName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authController = {
  registerTenant: async (ctx: Context) => {
    try {
      const body = await ctx.req.json();
      const data = registerTenantSchema.parse(body);
      
      const result = await authService.registerTenant(data);
      return ctx.json({ success: true, data: result }, 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message, 400);
      }
      throw error;
    }
  },

  register: async (ctx: Context) => {
    try {
      const body = await ctx.req.json();
      const data = registerSchema.parse(body);
      
      const result = await authService.register(data);
      return ctx.json({ success: true, data: result }, 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message, 400);
      }
      throw error;
    }
  },

  login: async (ctx: Context) => {
    try {
      const body = await ctx.req.json();
      const data = loginSchema.parse(body);
      
      const ipAddress = ctx.req.header('x-forwarded-for') || 'unknown';
      const result = await authService.login(data.email, data.password, ipAddress);
      
      return ctx.json({ success: true, data: result }, 200);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message, 400);
      }
      throw error;
    }
  },
  loginPin: async (ctx: Context) => {
    try {
      const body = await ctx.req.json();
      if (!body.pin) {
        throw new AppError('PIN is required', 400);
      }
      
      const ipAddress = ctx.req.header('x-forwarded-for') || 'unknown';
      const result = await authService.loginPin(body.pin, ipAddress);
      
      return ctx.json({ success: true, data: result }, 200);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message, 400);
      }
      throw error;
    }
  },
};
