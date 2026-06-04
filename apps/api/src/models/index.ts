import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  pin: varchar('pin', { length: 10 }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('cashier'),
  status: varchar('status', { length: 50 }).default('active'),
  emailVerified: boolean('email_verified').default(false),
  lastLogin: timestamp('last_login'),
});

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  refreshToken: varchar('refresh_token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  expiresAt: timestamp('expires_at').notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  barcode: varchar('barcode', { length: 100 }),
  imageUrl: varchar('image_url', { length: 255 }),
  categoryId: uuid('category_id'), // To be implemented
  description: varchar('description', { length: 1000 }),
  purchasePrice: varchar('purchase_price', { length: 20 }), // Use varchar/numeric for decimals
  sellingPrice: varchar('selling_price', { length: 20 }).notNull(),
  stockQuantity: varchar('stock_quantity', { length: 10 }).default('0'), // or integer
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  cashierId: uuid('cashier_id').references(() => users.id),
  transactionNumber: varchar('transaction_number', { length: 50 }).unique().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, refunded, voided
  subtotal: varchar('subtotal', { length: 20 }).notNull(),
  discountAmount: varchar('discount_amount', { length: 20 }).default('0'),
  taxAmount: varchar('tax_amount', { length: 20 }).default('0'),
  totalAmount: varchar('total_amount', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 50 }), // pending, completed, failed
  notes: varchar('notes', { length: 1000 }),
  heldUntil: timestamp('held_until'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: varchar('quantity', { length: 10 }).notNull(), // or int
  unitPrice: varchar('unit_price', { length: 20 }).notNull(),
  discount: varchar('discount', { length: 20 }).default('0'),
  tax: varchar('tax', { length: 20 }).default('0'),
  subtotal: varchar('subtotal', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  amount: varchar('amount', { length: 20 }).notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('completed'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  outletId: uuid('outlet_id'),
  movementType: varchar('movement_type', { length: 50 }).notNull(), // in, out, adjustment, transfer_out, transfer_in
  quantity: varchar('quantity', { length: 10 }).notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // transaction, purchase_order, manual
  referenceId: uuid('reference_id'),
  reason: varchar('reason', { length: 255 }),
  recordedBy: uuid('recorded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
