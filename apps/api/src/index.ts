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
import customersRoutes from './routes/customers.routes';
import settingsRoutes from './routes/settings.routes';
import usersRoutes from './routes/users.routes';
import shiftsRoutes from './routes/shifts.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import rawMaterialRoutes from './routes/rawMaterial.routes';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: (origin) => {
    return origin || 'http://localhost:3000';
  },
  credentials: true,
}));
app.use('*', logger());

// Static files for uploads
app.use('/public/uploads/*', serveStatic({ root: './' }));

// Health check
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.get('/openapi.json', serveStatic({ path: './public/openapi.json' }));
app.get('/api/docs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="SwaggerUI" />
      <title>API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout",
        });
      };
    </script>
    </body>
    </html>
  `);
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/transactions', transactionRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/inventory', inventoryRoutes);
app.route('/api/customers', customersRoutes);
app.route('/api/shifts', shiftsRoutes);
app.route('/api/whatsapp', whatsappRoutes);
app.route('/api/raw-materials', rawMaterialRoutes);

// Error handling
app.onError(errorHandler);

// Run with Node.js locally is handled by tsx in package.json dev script pointing to src/local.ts (to be created if needed)

export default app;