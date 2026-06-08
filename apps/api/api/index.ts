import { handle } from 'hono/vercel';
import appModule from '../src/index';

// Handle both ESM and CJS import variations for default exports
const app = (appModule as any).default || appModule;

export default handle(app);
