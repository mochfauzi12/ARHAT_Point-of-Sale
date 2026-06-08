import { handle } from 'hono/vercel';
import appModule from '../src/index';

// Handle both ESM and CJS import variations for default exports
const app = (appModule as any).default || appModule;

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
