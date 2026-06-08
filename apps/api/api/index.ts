export default async function handler(req: any, res: any) {
  try {
    const { getRequestListener } = await import('@hono/node-server');
    const appModule = await import('../src/index');
    const app = (appModule as any).default || appModule;
    const listener = getRequestListener(app.fetch);
    return listener(req, res);
  } catch (err: any) {
    console.error("FATAL INIT ERROR CAUGHT:", err);
    res.statusCode = 500;
    res.end("FATAL INIT ERROR: " + (err.stack || err.message || String(err)));
  }
}
