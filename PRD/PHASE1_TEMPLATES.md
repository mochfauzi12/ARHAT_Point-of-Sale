# ARHAT POS - Phase 1 Implementation Templates

Boilerplate code dan template untuk memulai implementation Phase 1: Authentication.

---

## Backend Templates

### 1. Database Migration Template

**File:** `apps/api/migrations/001_initial_setup.sql`

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- USERS & AUTHENTICATION TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  country VARCHAR(100),
  business_type VARCHAR(50),
  tax_id VARCHAR(50),
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  subscription_plan VARCHAR(50) DEFAULT 'starter', -- starter, professional, enterprise
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'cashier',
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, deleted
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  last_password_change TIMESTAMP,
  force_password_change BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT phone_format CHECK (phone_number IS NULL OR phone_number ~* '^\+?[0-9\-\(\)\s]{7,}$'),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Email Verification Tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_tokens_expires_at ON email_verification_tokens(expires_at);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_tokens_expires_at ON password_reset_tokens(expires_at);

-- Session Management
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- ========================================
-- ROLES & PERMISSIONS TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- Insert system roles
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
  ('super_admin', 'Super Administrator', 'Full access to all system features', TRUE),
  ('owner', 'Business Owner', 'Owner of the business, full access to business', FALSE),
  ('manager', 'Manager', 'Can manage operasional bisnis', FALSE),
  ('cashier', 'Cashier', 'Can do transactions', FALSE)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(150) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_permissions_module ON permissions(module);

-- Insert basic permissions
INSERT INTO permissions (name, display_name, module, description) VALUES
  ('auth.login', 'Login', 'auth', 'Can login to the system'),
  ('auth.logout', 'Logout', 'auth', 'Can logout from the system'),
  ('users.create', 'Create User', 'users', 'Can create new user'),
  ('users.read', 'Read User', 'users', 'Can view user details'),
  ('users.update', 'Update User', 'users', 'Can edit user information'),
  ('users.delete', 'Delete User', 'users', 'Can delete user'),
  ('products.create', 'Create Product', 'products', 'Can create new product'),
  ('products.read', 'Read Product', 'products', 'Can view product details'),
  ('products.update', 'Update Product', 'products', 'Can edit product information'),
  ('products.delete', 'Delete Product', 'products', 'Can delete product'),
  ('pos.transaction', 'POS Transaction', 'pos', 'Can process POS transaction'),
  ('pos.refund', 'Refund Transaction', 'pos', 'Can refund transaction'),
  ('inventory.adjust', 'Adjust Inventory', 'inventory', 'Can adjust stock quantity'),
  ('reports.view', 'View Reports', 'reports', 'Can view business reports')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Assign permissions to system roles
-- Super Admin - all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- ========================================
-- AUDIT LOGGING
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success', -- success, error
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);

-- ========================================
-- LOGIN ATTEMPTS (untuk Rate Limiting)
-- ========================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address, created_at);

-- Auto cleanup old records (every month)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CONSTRAINTS & TRIGGERS
-- ========================================

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PERMISSIONS GRANT
-- ========================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO arhat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO arhat_user;
```

---

### 2. Backend Service Template

**File:** `apps/api/src/services/auth.service.ts`

```typescript
import * as bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';
import type { Context } from 'hono';
import { AppError } from '@/lib/errors';
import { db } from '@/lib/db';
import { users, emailVerificationTokens } from '@/models';
import { emailService } from '@/services/email.service';

export class AuthService {
  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    tenantId: string;
  }): Promise<{ user: any; verificationTokenId: string }> {
    // Validate input
    if (!data.email || !data.password || !data.fullName) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Validate password strength
    this.validatePassword(data.password);

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        tenantId: data.tenantId,
        status: 'active',
        emailVerified: false,
      })
      .returning();

    // Generate verification token
    const token = this.generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verificationToken = await db
      .insert(emailVerificationTokens)
      .values({
        userId: newUser[0].id,
        token,
        expiresAt,
      })
      .returning();

    // Send verification email
    await emailService.sendVerificationEmail(newUser[0].email, token);

    return {
      user: newUser[0],
      verificationTokenId: verificationToken[0].id,
    };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const verificationToken = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.used, false)
        )
      )
      .limit(1);

    if (verificationToken.length === 0) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    const tokenRecord = verificationToken[0];

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      throw new AppError('Verification token expired', 400);
    }

    // Update user
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, tokenRecord.id));
  }

  /**
   * Login user
   */
  async login(email: string, password: string, ipAddress?: string) {
    // Check if email exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      // Log failed attempt
      await this.logLoginAttempt(email, false, ipAddress);
      throw new AppError('Invalid email or password', 401);
    }

    const userRecord = user[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isValidPassword) {
      await this.logLoginAttempt(email, false, ipAddress);
      throw new AppError('Invalid email or password', 401);
    }

    // Check if email verified
    if (!userRecord.emailVerified) {
      throw new AppError('Please verify your email first', 403);
    }

    // Log successful login
    await this.logLoginAttempt(email, true, ipAddress);

    // Generate tokens
    const accessToken = this.generateAccessToken(userRecord);
    const refreshToken = this.generateRefreshToken(userRecord);

    // Save session
    await this.createSession(userRecord.id, refreshToken, ipAddress);

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, userRecord.id));

    return {
      accessToken,
      refreshToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.fullName,
        role: userRecord.role,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (user.length === 0) {
        throw new AppError('User not found', 404);
      }

      return this.generateAccessToken(user[0]);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Always return success to prevent user enumeration
    if (user.length === 0) {
      return;
    }

    // Generate reset token
    const token = this.generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db
      .insert(passwordResetTokens)
      .values({
        userId: user[0].id,
        token,
        expiresAt,
      });

    // Send email
    await emailService.sendPasswordResetEmail(user[0].email, token);
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate new password
    this.validatePassword(newPassword);

    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      )
      .limit(1);

    if (resetToken.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const tokenRecord = resetToken[0];

    if (new Date() > tokenRecord.expiresAt) {
      throw new AppError('Reset token expired', 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({
        passwordHash,
        lastPasswordChange: new Date(),
      })
      .where(eq(users.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, tokenRecord.id));

    // Revoke all sessions
    await this.revokeAllSessions(tokenRecord.userId);
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }
    if (!/[A-Z]/.test(password)) {
      throw new AppError('Password must contain uppercase letter', 400);
    }
    if (!/[a-z]/.test(password)) {
      throw new AppError('Password must contain lowercase letter', 400);
    }
    if (!/[0-9]/.test(password)) {
      throw new AppError('Password must contain number', 400);
    }
  }

  private generateRandomToken(length: number): string {
    return require('crypto').randomBytes(length).toString('hex');
  }

  private generateAccessToken(user: any): string {
    return sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: any): string {
    return sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    ipAddress?: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(sessions).values({
      userId,
      refreshToken,
      ipAddress: ipAddress || 'unknown',
      expiresAt,
    });
  }

  private async logLoginAttempt(
    email: string,
    success: boolean,
    ipAddress?: string
  ): Promise<void> {
    await db.insert(loginAttempts).values({
      email,
      success,
      ipAddress: ipAddress || 'unknown',
    });
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.userId, userId));
  }
}

export const authService = new AuthService();
```

---

### 3. Backend Controller Template

**File:** `apps/api/src/controllers/auth.controller.ts`

```typescript
import { Context } from 'hono';
import { authService } from '@/services/auth.service';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export class AuthController {
  /**
   * POST /auth/register
   */
  async register(ctx: Context) {
    try {
      const { email, password, fullName } = await ctx.req.json();

      const result = await authService.register({
        email,
        password,
        fullName,
        tenantId: ctx.get('tenantId'), // From middleware
      });

      logger.info('User registered', {
        userId: result.user.id,
        email: result.user.email,
      });

      return ctx.json(
        {
          success: true,
          message: 'Registration successful. Please verify your email.',
          data: {
            userId: result.user.id,
            email: result.user.email,
          },
        },
        201
      );
    } catch (error) {
      if (error instanceof AppError) {
        return ctx.json(
          { success: false, message: error.message },
          error.statusCode
        );
      }
      logger.error('Registration error', error);
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }

  /**
   * POST /auth/verify-email
   */
  async verifyEmail(ctx: Context) {
    try {
      const { token } = await ctx.req.json();

      await authService.verifyEmail(token);

      logger.info('Email verified', { token: token.substring(0, 8) });

      return ctx.json({
        success: true,
        message: 'Email verified successfully. You can now login.',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ctx.json(
          { success: false, message: error.message },
          error.statusCode
        );
      }
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }

  /**
   * POST /auth/login
   */
  async login(ctx: Context) {
    try {
      const { email, password } = await ctx.req.json();
      const ipAddress = ctx.req.header('x-forwarded-for') || 'unknown';

      const result = await authService.login(email, password, ipAddress);

      logger.info('User logged in', { userId: result.user.id });

      return ctx.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ctx.json(
          { success: false, message: error.message },
          error.statusCode
        );
      }
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }

  /**
   * POST /auth/refresh-token
   */
  async refreshToken(ctx: Context) {
    try {
      const { refreshToken } = await ctx.req.json();

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      return ctx.json({
        success: true,
        data: { accessToken: newAccessToken },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ctx.json(
          { success: false, message: error.message },
          error.statusCode
        );
      }
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(ctx: Context) {
    try {
      const { email } = await ctx.req.json();

      await authService.requestPasswordReset(email);

      return ctx.json({
        success: true,
        message: 'Check your email for password reset instructions',
      });
    } catch (error) {
      logger.error('Forgot password error', error);
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(ctx: Context) {
    try {
      const { token, password } = await ctx.req.json();

      await authService.resetPassword(token, password);

      logger.info('Password reset successful');

      return ctx.json({
        success: true,
        message: 'Password reset successful. Please login with your new password.',
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ctx.json(
          { success: false, message: error.message },
          error.statusCode
        );
      }
      return ctx.json(
        { success: false, message: 'Internal server error' },
        500
      );
    }
  }
}

export const authController = new AuthController();
```

---

### 4. Backend Routes Template

**File:** `apps/api/src/routes/auth.ts`

```typescript
import { Hono } from 'hono';
import { authController } from '@/controllers/auth.controller';
import { rateLimiter } from '@/middleware/rateLimiter';
import { validateJSON } from '@/middleware/validateJSON';

const authRouter = new Hono();

// Apply rate limiting to auth endpoints
authRouter.use('*', rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));

// Registration
authRouter.post(
  '/register',
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 5 }), // Strict limit
  validateJSON(['email', 'password', 'fullName']),
  (ctx) => authController.register(ctx)
);

// Email verification
authRouter.post(
  '/verify-email',
  validateJSON(['token']),
  (ctx) => authController.verifyEmail(ctx)
);

// Login
authRouter.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), // Strict limit
  validateJSON(['email', 'password']),
  (ctx) => authController.login(ctx)
);

// Refresh token
authRouter.post(
  '/refresh-token',
  validateJSON(['refreshToken']),
  (ctx) => authController.refreshToken(ctx)
);

// Forgot password
authRouter.post(
  '/forgot-password',
  rateLimiter({ windowMs: 60 * 60 * 1000, maxRequests: 3 }), // Very strict
  validateJSON(['email']),
  (ctx) => authController.forgotPassword(ctx)
);

// Reset password
authRouter.post(
  '/reset-password',
  validateJSON(['token', 'password']),
  (ctx) => authController.resetPassword(ctx)
);

export default authRouter;
```

---

## Frontend Templates

### 1. Registration Form Component

**File:** `apps/web/src/components/auth/RegisterForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthAPI } from '@/lib/api/authApi';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await AuthAPI.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      // Redirect to email verification page
      router.push(`/auth/verify-email?email=${data.email}`);
    } catch (error: any) {
      // Handle error
      console.error('Registration error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <input
          {...register('fullName')}
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your full name"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium mb-2">Confirm Password</label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
```

---

### 2. Auth API Client

**File:** `apps/web/src/lib/api/authApi.ts`

```typescript
import { api } from '@/lib/api';

export class AuthAPI {
  static async register(data: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  static async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  }

  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }

  static async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
}
```

---

### 3. Tests Template

**File:** `apps/api/tests/unit/auth.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/services/auth.service';
import * as bcrypt from 'bcryptjs';

vi.mock('bcryptjs');
vi.mock('@/lib/db');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('validatePassword', () => {
    it('should reject password less than 8 characters', () => {
      expect(() => authService['validatePassword']('Pass1')).toThrow();
    });

    it('should reject password without uppercase', () => {
      expect(() => authService['validatePassword']('password123')).toThrow();
    });

    it('should reject password without lowercase', () => {
      expect(() => authService['validatePassword']('PASSWORD123')).toThrow();
    });

    it('should reject password without number', () => {
      expect(() => authService['validatePassword']('Password')).toThrow();
    });

    it('should accept valid password', () => {
      expect(() =>
        authService['validatePassword']('ValidPass123')
      ).not.toThrow();
    });
  });

  describe('register', () => {
    it('should create new user with valid data', async () => {
      const data = {
        email: 'test@example.com',
        password: 'ValidPass123',
        fullName: 'Test User',
        tenantId: 'tenant-123',
      };

      // Mock bcrypt
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password');

      // Test would continue...
    });

    it('should throw error if user already exists', async () => {
      // Test implementation...
    });
  });
});
```

---

## Quick Start Checklist

Gunakan checklist ini untuk memulai Phase 1 implementation:

```markdown
## Phase 1 Quick Start

### Backend Setup
- [ ] Create migration file (001_initial_setup.sql)
- [ ] Run migration: `pnpm migrate`
- [ ] Create auth.service.ts
- [ ] Create auth.controller.ts
- [ ] Create auth routes
- [ ] Setup middleware (auth, error handling, rate limiting)
- [ ] Create email service
- [ ] Setup unit tests

### Frontend Setup
- [ ] Create register page
- [ ] Create RegisterForm component
- [ ] Create login page
- [ ] Create auth API client
- [ ] Setup Redux store for auth state
- [ ] Create auth hook (useAuth)
- [ ] Create protected route wrapper

### Testing
- [ ] Unit tests for auth service (coverage > 85%)
- [ ] Integration tests for auth flow
- [ ] Manual testing register → verify → login

### Documentation
- [ ] API documentation (Swagger)
- [ ] Database schema diagram
- [ ] Setup guide updated
```

---

**Next Steps:** Follow the IMPLEMENTATION_CHECKLIST.md untuk detailed progress tracking per user story.

**Last Updated:** June 2026
