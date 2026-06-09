import { serve } from '@hono/node-server';
import app from './index';

const port = process.env.PORT ? parseInt(process.env.PORT) : 8787;
console.log(`Starting Node server on port ${port}...`);

serve({ fetch: app.fetch, port });
