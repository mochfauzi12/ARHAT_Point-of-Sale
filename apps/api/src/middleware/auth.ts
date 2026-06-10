import { Context, Next } from 'hono';
import { verify } from 'jsonwebtoken';
import { AppError } from '../lib/errors';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized: Missing or invalid token', 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Server misconfigured: JWT_SECRET is not set', 500);
    }
    const decoded = verify(token, secret) as any;
    
    // Set user data to context
    c.set('user', {
      id: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
      email: decoded.email
    });
    
    await next();
  } catch (error) {
    throw new AppError('Unauthorized: Invalid or expired token', 401);
  }
};
