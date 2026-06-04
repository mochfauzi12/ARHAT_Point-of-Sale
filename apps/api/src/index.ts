import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';
import inventoryRoutes from './routes/inventory.routes';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Static files for uploads
app.use('/public/uploads/*', serveStatic({ root: './' }));

// Health check
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/transactions', transactionRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/inventory', inventoryRoutes);

// Error handling
app.onError(errorHandler);

// Run with Node.js if not in Cloudflare Workers
if (typeof process !== 'undefined' && process.release?.name === 'node') {
  const { serve } = require('@hono/node-server');
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8787;
  console.log(`Starting Node server on port ${port}...`);
  serve({ fetch: app.fetch, port });
}

export default app;
