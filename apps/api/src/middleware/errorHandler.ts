import { Context } from 'hono';
import { AppError } from '../lib/errors';

export const errorHandler = (err: Error, ctx: Context) => {
  if (err instanceof AppError) {
    return ctx.json({ error: err.message }, err.statusCode as any);
  }
  console.error(err);
  const code = (err as any).code || 'UNKNOWN';
  return ctx.json({ error: 'Internal Server Error', debug: `${err.constructor.name}:${code}` }, 500);
};
