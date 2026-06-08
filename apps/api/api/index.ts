import { handle } from 'hono/vercel';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

let appToExport: any;

try {
  // Synchronously require to catch any top-level execution errors in src/index
  appToExport = require('../src/index').default;
} catch (err: any) {
  console.error("FATAL INITIALIZATION ERROR:", err);
  const fallback = new Hono();
  fallback.use('*', cors());
  fallback.all('*', (c) => c.json({ 
    error: 'Fatal Backend Initialization Error', 
    message: err?.message, 
    stack: err?.stack 
  }, 500));
  appToExport = fallback;
}

export const GET = handle(appToExport);
export const POST = handle(appToExport);
export const PUT = handle(appToExport);
export const PATCH = handle(appToExport);
export const DELETE = handle(appToExport);
export const OPTIONS = handle(appToExport);
