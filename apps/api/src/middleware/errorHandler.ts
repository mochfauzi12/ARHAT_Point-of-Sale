import { Context } from 'hono';
import { AppError } from '../lib/errors';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, ctx: Context) => {
  if (err instanceof AppError) {
    return ctx.json({ error: err.message }, err.statusCode as any);
  }
  
  if (err instanceof ZodError) {
    return ctx.json({ error: 'Validation failed', details: err.errors }, 400);
  }
  
  console.error(err);
  return ctx.json({ error: 'Internal Server Error' }, 500);
};
