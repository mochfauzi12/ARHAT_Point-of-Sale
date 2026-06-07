import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const authRoutes = new Hono();

authRoutes.post('/register-tenant', authController.registerTenant);
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/login-pin', authController.loginPin);

authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user') as any;
  return c.json({ success: true, data: user });
});

export default authRoutes;
