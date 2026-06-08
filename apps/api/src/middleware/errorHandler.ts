import { Context } from 'hono';
import { AppError } from '../lib/errors';

export const errorHandler = (err: Error, ctx: Context) => {
  if (err instanceof AppError) {
    return ctx.json({ error: err.message }, err.statusCode as any);
  }
  console.error("GLOBAL ERROR:", err);
  return ctx.json({ error: 'Internal Server Error (API: ' + err.message + ')' }, 500);
};
