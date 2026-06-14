import * as bcrypt from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../lib/errors';
import { db } from '../lib/db';
import { users, emailVerificationTokens, sessions, passwordResetTokens, tenants, outlets, otpCodes } from '../models';
import { emailService } from './email.service';

export class AuthService {
  async registerTenant(data: {
    tenantName: string;
    email: string;
    password: string;
    fullName: string;
  }) {
    if (!data.tenantName || !data.email || !data.password || !data.fullName) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    this.validatePassword(data.password);
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Use a transaction to ensure all or nothing
    return await db.transaction(async (tx) => {
      // 1. Create Tenant
      const newTenant = await tx
        .insert(tenants)
        .values({
          name: data.tenantName,
          email: data.email, // using owner email for tenant contact
        })
        .returning();

      const tenantId = newTenant[0].id;

      // 2. Create HQ Outlet
      const newOutlet = await tx
        .insert(outlets)
        .values({
          tenantId,
          name: 'Pusat (HQ)',
          address: 'Alamat Toko',
          phone: '-',
        })
        .returning();

      // 3. Create Admin User
      const newUser = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash,
          fullName: data.fullName,
          tenantId,
          role: 'admin',
          status: 'active',
          emailVerified: false,
        })
        .returning();

      return {
        tenant: newTenant[0],
        outlet: newOutlet[0],
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          fullName: newUser[0].fullName,
          role: newUser[0].role,
        }
      };
    });

    // Generate and send OTP
    const code = this.generateOtp(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.insert(otpCodes).values({
      email: data.email,
      code,
      type: 'register',
      expiresAt,
    });

    await emailService.sendOtp(data.email, code, 'register');

    return {
      success: true,
      requiresOtp: true,
      email: data.email,
      ...result
    };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    tenantId: string;
  }) {
    if (!data.email || !data.password || !data.fullName || !data.tenantId) {
      throw new AppError('Missing required fields', 400);
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    this.validatePassword(data.password);
    const passwordHash = await bcrypt.hash(data.password, 10);

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

    const code = this.generateOtp(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(otpCodes).values({
      email: data.email,
      code,
      type: 'register',
      expiresAt,
    });

    await emailService.sendOtp(newUser[0].email, code, 'register');

    return {
      success: true,
      requiresOtp: true,
      email: newUser[0].email,
      user: newUser[0],
    };
  }

  async login(email: string, password: string, ipAddress?: string) {
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (usersList.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    let userRecord = usersList.find(u => u.status === 'active');
    
    if (!userRecord) {
      // If no active user found but inactive exists
      userRecord = usersList[0];
      if (userRecord.status === 'deleted' || userRecord.status === 'inactive') {
        throw new AppError('Akun ini sudah dinonaktifkan atau dihapus', 403);
      }
    }

    const isValidPassword = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!userRecord.emailVerified) {
      throw new AppError('Please verify your email first', 403);
    }

    const code = this.generateOtp(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete previous login OTPs to avoid clutter
    await db.delete(otpCodes).where(and(eq(otpCodes.email, email), eq(otpCodes.type, 'login')));

    await db.insert(otpCodes).values({
      email,
      code,
      type: 'login',
      expiresAt,
    });

    await emailService.sendOtp(email, code, 'login');

    return {
      success: true,
      requiresOtp: true,
      email: userRecord.email,
    };
  }

  async verifyRegisterOtp(email: string, code: string) {
    const otpList = await db
      .select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        eq(otpCodes.type, 'register')
      ));

    const otpRecord = otpList.find(o => !o.usedAt && o.expiresAt > new Date());

    if (!otpRecord) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa', 400);
    }

    await db.update(users).set({ emailVerified: true }).where(eq(users.email, email));
    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otpRecord.id));

    return { success: true, message: 'Email berhasil diverifikasi' };
  }

  async verifyLoginOtp(email: string, code: string, ipAddress?: string) {
    const otpList = await db
      .select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        eq(otpCodes.type, 'login')
      ));

    const otpRecord = otpList.find(o => !o.usedAt && o.expiresAt > new Date());

    if (!otpRecord) {
      throw new AppError('Kode OTP tidak valid atau sudah kadaluarsa', 400);
    }

    const usersList = await db.select().from(users).where(eq(users.email, email));
    const userRecord = usersList[0];

    await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, otpRecord.id));

    const accessToken = this.generateAccessToken(userRecord);
    const refreshToken = this.generateRefreshToken(userRecord);

    await this.createSession(userRecord.id, refreshToken, ipAddress);
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userRecord.id));

    return {
      accessToken,
      refreshToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.fullName,
        role: userRecord.role,
        tenantId: userRecord.tenantId,
      }
    };
  }

  async loginPin(pin: string, ipAddress?: string) {
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.pin, pin));

    if (usersList.length === 0) {
      throw new AppError('Invalid PIN', 401);
    }

    let userRecord = usersList.find(u => u.status === 'active');
    
    if (!userRecord) {
      userRecord = usersList[0];
      if (userRecord.status === 'deleted' || userRecord.status === 'inactive') {
        throw new AppError('Akun ini sudah dinonaktifkan atau dihapus', 403);
      }
    }

    const accessToken = this.generateAccessToken(userRecord);
    const refreshToken = this.generateRefreshToken(userRecord);

    await this.createSession(userRecord.id, refreshToken, ipAddress);
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userRecord.id));

    return {
      accessToken,
      refreshToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.fullName,
        role: userRecord.role,
        tenantId: userRecord.tenantId,
      },
    };
  }

  private validatePassword(password: string): void {
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
  }

  private generateRandomToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateOtp(length: number): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateAccessToken(user: any): string {
    return sign(
      { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  }

  private generateRefreshToken(user: any): string {
    return sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      { expiresIn: '7d' }
    );
  }

  private async createSession(userId: string, refreshToken: string, ipAddress?: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId,
      refreshToken,
      ipAddress: ipAddress || 'unknown',
      expiresAt,
    });
  }
}

export const authService = new AuthService();
