import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller';

const authRoutes = new Hono();

authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);

export default authRoutes;
