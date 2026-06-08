import { getRequestListener } from '@hono/node-server';
import appModule from '../src/index';

// Handle both ESM and CJS import variations for default exports
const app = (appModule as any).default || appModule;

export default getRequestListener(app.fetch);
