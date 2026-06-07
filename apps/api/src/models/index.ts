import { pgTable, uuid, varchar, text, timestamp, boolean, index, decimal } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});

export const outlets = pgTable('outlets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }),
  phone: varchar('phone', { length: 50 }),
  taxRate: varchar('tax_rate', { length: 10 }).default('0'),
  receiptFooter: varchar('receipt_footer', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
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
  imageUrl: text('image_url'),
  categoryId: uuid('category_id'), // To be implemented
  description: varchar('description', { length: 1000 }),
  purchasePrice: varchar('purchase_price', { length: 20 }), // Use varchar/numeric for decimals
  sellingPrice: varchar('selling_price', { length: 20 }).notNull(),
  stockQuantity: varchar('stock_quantity', { length: 10 }).default('0'), // Legacy: total stock or simple mode stock
  minStockLevel: varchar('min_stock_level', { length: 10 }).default('0'), // Legacy: min stock for simple mode
  isActive: boolean('is_active').default(true),
  isService: boolean('is_service').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  price: varchar('price', { length: 20 }).notNull(),
  stockQuantity: varchar('stock_quantity', { length: 10 }).default('0'),
  isActive: boolean('is_active').default(true),
});

export const productModifiers = pgTable('product_modifiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  name: varchar('name', { length: 255 }).notNull(),
  price: varchar('price', { length: 20 }).default('0'),
  isActive: boolean('is_active').default(true),
});

export const productStocks = pgTable('product_stocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  stockQuantity: varchar('stock_quantity', { length: 10 }).default('0'),
  minStockLevel: varchar('min_stock_level', { length: 10 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  points: varchar('points', { length: 20 }).default('0'),
  totalSpent: varchar('total_spent', { length: 20 }).default('0'),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  phoneIdx: index('idx_customers_phone').on(table.phone)
}));

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  cashierId: uuid('cashier_id').references(() => users.id),
  shiftId: uuid('shift_id'), // Add shift relationship
  customerId: uuid('customer_id').references(() => customers.id),
  transactionNumber: varchar('transaction_number', { length: 50 }).unique().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, refunded, voided
  subtotal: varchar('subtotal', { length: 20 }).notNull(),
  discountAmount: varchar('discount_amount', { length: 20 }).default('0'),
  taxAmount: varchar('tax_amount', { length: 20 }).default('0'),
  totalAmount: varchar('total_amount', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 50 }), // pending, completed, failed
  pointsEarned: varchar('points_earned', { length: 20 }).default('0'),
  pointsRedeemed: varchar('points_redeemed', { length: 20 }).default('0'),
  notes: varchar('notes', { length: 1000 }),
  heldUntil: timestamp('held_until'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  transactionNumberIdx: index('idx_transactions_number').on(table.transactionNumber),
  createdAtIdx: index('idx_transactions_created_at').on(table.createdAt)
}));

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').notNull().references(() => transactions.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  variantId: uuid('variant_id').references(() => productVariants.id),
  variantName: varchar('variant_name', { length: 255 }),
  modifiers: varchar('modifiers', { length: 1000 }), // JSON array of selected modifiers
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

export const stockAdjustments = pgTable('stock_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  adjustmentNumber: varchar('adjustment_number', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, approved, rejected
  createdBy: uuid('created_by').notNull().references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
});

export const stockAdjustmentItems = pgTable('stock_adjustment_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  adjustmentId: uuid('adjustment_id').notNull().references(() => stockAdjustments.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  currentStock: varchar('current_stock', { length: 10 }).notNull(),
  adjustedStock: varchar('adjusted_stock', { length: 10 }).notNull(),
  variance: varchar('variance', { length: 10 }).notNull(),
  reason: varchar('reason', { length: 255 }),
});

export const stockOpnameSessions = pgTable('stock_opname_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  outletId: uuid('outlet_id').notNull().references(() => outlets.id),
  opnameNumber: varchar('opname_number', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('in_progress'), // in_progress, completed
  startedBy: uuid('started_by').notNull().references(() => users.id),
  completedBy: uuid('completed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const stockOpnameItems = pgTable('stock_opname_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  opnameId: uuid('opname_id').notNull().references(() => stockOpnameSessions.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  expectedQuantity: varchar('expected_quantity', { length: 10 }).notNull(),
  actualQuantity: varchar('actual_quantity', { length: 10 }).notNull(),
  variance: varchar('variance', { length: 10 }).notNull(),
});

export const stockTransfers = pgTable('stock_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  transferNumber: varchar('transfer_number', { length: 50 }).notNull(),
  sourceOutletId: uuid('source_outlet_id').notNull().references(() => outlets.id),
  destinationOutletId: uuid('destination_outlet_id').notNull().references(() => outlets.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, received, cancelled
  createdBy: uuid('created_by').notNull().references(() => users.id),
  receivedBy: uuid('received_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  receivedAt: timestamp('received_at'),
});

export const stockTransferItems = pgTable('stock_transfer_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transferId: uuid('transfer_id').notNull().references(() => stockTransfers.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: varchar('quantity', { length: 10 }).notNull(),
});

export const shifts = pgTable('shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  cashierId: uuid('cashier_id').notNull().references(() => users.id),
  outletId: uuid('outlet_id').references(() => outlets.id),
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  startingCash: varchar('starting_cash', { length: 20 }).notNull(),
  actualEndingCash: varchar('actual_ending_cash', { length: 20 }),
  expectedEndingCash: varchar('expected_ending_cash', { length: 20 }),
  status: varchar('status', { length: 50 }).notNull().default('open'), // open, closed
  notes: varchar('notes', { length: 1000 }),
});

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  customerId: uuid('customer_id').references(() => customers.id),
  recipientPhone: varchar('recipient_phone', { length: 50 }).notNull(),
  messageType: varchar('message_type', { length: 50 }).notNull(), // 'receipt', 'notification'
  content: text('content'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'sent', 'delivered', 'read', 'failed'
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  errorMessage: text('error_message'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
