import { Context, Next } from 'hono';

export const authMiddleware = async (c: Context, next: Next) => {
  // TODO: Implement actual JWT authentication later
  // For development, we set a mock user context so the API works
  
  const mockTenantId = '00000000-0000-0000-0000-000000000000';
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  
  c.set('user', {
    id: mockUserId,
    tenantId: mockTenantId,
    role: 'owner'
  });
  
  await next();
};
