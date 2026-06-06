import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller';
const authRoutes = new Hono();
authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/login-pin', authController.loginPin);
import { authMiddleware } from '../middleware/auth';
authRoutes.get('/me', authMiddleware, async (c) => {
    const user = c.get('user');
    return c.json({ success: true, data: user });
});
export default authRoutes;
