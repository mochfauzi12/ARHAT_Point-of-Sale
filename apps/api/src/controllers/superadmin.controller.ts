import { Context } from 'hono';
import { db } from '../lib/db';
import { tenants, users, outlets } from '../models';
import { eq, sql } from 'drizzle-orm';
import { AppError } from '../lib/errors';

export const getTenants = async (c: Context) => {
  const user = c.get('user');

  if (user.role !== 'superadmin') {
    throw new AppError('Unauthorized: Only superadmin can perform this action', 403);
  }

  try {
    // Fetch all tenants with owner email and outlet count
    const allTenants = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        email: tenants.email, // This is usually the owner's email from registration
        createdAt: sql`MIN(${outlets.createdAt})`.as('created_at'), // Approximate creation date based on first outlet
        outletCount: sql`COUNT(DISTINCT ${outlets.id})`.as('outlet_count'),
        userCount: sql`COUNT(DISTINCT ${users.id})`.as('user_count'),
      })
      .from(tenants)
      .leftJoin(outlets, eq(outlets.tenantId, tenants.id))
      .leftJoin(users, eq(users.tenantId, tenants.id))
      .groupBy(tenants.id, tenants.name, tenants.email);

    return c.json({
      success: true,
      data: allTenants,
    });
  } catch (error: any) {
    console.error('Get tenants error:', error);
    throw new AppError('Failed to fetch tenants', 500);
  }
};
