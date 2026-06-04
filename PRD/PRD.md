# ARHAT POS - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** June 2026  
**Status:** In Development  
**Product Manager:** Team ARHAT  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Development Phases](#development-phases)
4. [Phase 1: Foundation & Authentication](#phase-1-foundation--authentication)
5. [Phase 2: POS & Basic Sales](#phase-2-pos--basic-sales)
6. [Phase 3: Inventory Management](#phase-3-inventory-management)
7. [Phase 4: Customer Management & CRM](#phase-4-customer-management--crm)
8. [Phase 5: Reporting & Analytics](#phase-5-reporting--analytics)
9. [Phase 6: Advanced Features](#phase-6-advanced-features)
10. [Project Folder Structure](#project-folder-structure)
11. [SDLC Best Practices](#sdlc-best-practices)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

ARHAT POS adalah platform cloud-based Point of Sale & Business Management untuk UMKM Indonesia. Aplikasi ini membantu pelaku UMKM mengelola operasional bisnis secara efisien melalui sistem kasir digital, manajemen inventaris, CRM, pelaporan bisnis, dan komunikasi pelanggan terintegrasi.

**Target Market:** Retail, Food & Beverage, Services, Multi-Outlet Business  
**MVP Timeline:** 12-16 minggu  
**Success Target:** 1.000+ UMKM aktif dalam tahun pertama

---

## Product Overview

### Vision
Menjadi platform manajemen bisnis UMKM yang sederhana, terjangkau, dan dapat membantu pemilik usaha mengambil keputusan berdasarkan data secara real-time.

### Mission
- ✅ Digitalisasi operasional UMKM
- ✅ Menyederhanakan proses transaksi penjualan
- ✅ Mengurangi kesalahan pencatatan manual
- ✅ Mengoptimalkan pengelolaan stok barang
- ✅ Membantu meningkatkan loyalitas pelanggan
- ✅ Menyediakan laporan bisnis yang mudah dipahami
- ✅ Memberikan solusi yang dapat berkembang seiring pertumbuhan bisnis

### Core Features (MVP)
1. Authentication & User Management
2. Dashboard Analytics
3. Point of Sale (POS)
4. Product Management
5. Inventory Management
6. Customer Management
7. Sales Reporting
8. WhatsApp Integration

### Success Metrics
| Metric | Target |
|--------|--------|
| Active UMKM (Year 1) | 1.000+ |
| User Retention | > 80% |
| Stock Accuracy | > 95% |
| Kasir Transaction Time | < 30 detik |
| Manual Recording Error Reduction | 90% |

---

## Development Phases

Development dibagi menjadi 6 phase dengan timeline sequential. Setiap phase harus selesai dan di-review sebelum lanjut ke phase berikutnya.

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| P1 | Foundation & Authentication | 2-3 minggu | 🔵 Ready |
| P2 | POS & Basic Sales | 2-3 minggu | ⚪ Pending |
| P3 | Inventory Management | 2-3 minggu | ⚪ Pending |
| P4 | Customer Management & CRM | 1-2 minggu | ⚪ Pending |
| P5 | Reporting & Analytics | 2-3 minggu | ⚪ Pending |
| P6 | Advanced Features & Polish | 1-2 minggu | ⚪ Pending |

---

## Phase 1: Foundation & Authentication

**Duration:** 2-3 minggu  
**Status:** 🔵 Ready to Start  
**Dependencies:** None  

### Objectives
- Setup project infrastructure & development environment
- Implement authentication system
- Create user management module
- Establish project structure & naming conventions
- Setup CI/CD pipeline

### User Stories

#### US1.1: User Registration
```
As a new UMKM owner
I want to register to ARHAT POS
So that I can create a business account

Acceptance Criteria:
- User dapat melakukan registrasi dengan email dan password
- Email verification dikirim otomatis
- Password harus memenuhi kriteria keamanan (min 8 karakter, ada kombinasi huruf & angka)
- Error handling untuk email yang sudah terdaftar
- Success: redirect ke email verification page
```

#### US1.2: Email Verification
```
As a registered user
I want to verify my email
So that I can activate my account

Acceptance Criteria:
- Email verification link valid selama 24 jam
- Satu kali klik link → email terverifikasi
- User dapat request resend verification email
- Notifikasi success setelah verifikasi
- Redirect ke login page
```

#### US1.3: User Login
```
As a registered user
I want to login to ARHAT POS
So that I can access my business dashboard

Acceptance Criteria:
- Login dengan email dan password
- JWT token digenerate setelah login sukses
- Refresh token untuk session extension (valid 7 hari)
- Remember me option (simpan preference, bukan password)
- Error message untuk invalid credentials
- Rate limiting: max 5 failed attempts / 15 menit
```

#### US1.4: Forgot Password
```
As a user
I want to reset password jika lupa
So that I dapat kembali mengakses akun

Acceptance Criteria:
- User input email yang terdaftar
- Reset link dikirim ke email (valid 1 jam)
- User dapat set password baru
- Password lama tidak bisa digunakan kembali
- Success notification & redirect ke login
```

#### US1.5: Role-Based Access Control (RBAC)
```
As a system administrator
I want to manage user roles dan permissions
So that users hanya dapat akses fitur yang sesuai

Acceptance Criteria:
- Ada 4 role: Super Admin, Owner, Manager, Cashier
- Setiap role memiliki permission yang berbeda
- Permission check di setiap endpoint
- Audit log untuk permission changes
- Dropdown role selection saat owner manage users
```

#### US1.6: User Management
```
As an UMKM owner
I want to manage team members
So that saya dapat assign roles dan tanggung jawab

Acceptance Criteria:
- Owner dapat add/edit/delete users
- Invite user via email (bulk invite available)
- Set role untuk setiap user
- View list semua user dengan role & status
- Deactivate user tanpa menghapus data
- Audit log untuk user changes
```

### Technical Requirements

#### Backend (Cloudflare Workers + Hono)
```typescript
// Authentication Flow
- POST /auth/register - Register user
- POST /auth/verify-email - Email verification
- POST /auth/login - Login user
- POST /auth/refresh-token - Refresh JWT
- POST /auth/forgot-password - Request password reset
- POST /auth/reset-password - Reset password
- POST /auth/logout - Logout user

// User Management
- GET /users - List users (Owner/Manager)
- POST /users - Create user (Owner only)
- GET /users/:id - Get user detail
- PATCH /users/:id - Update user
- DELETE /users/:id - Delete user
- GET /users/:id/permissions - Get user permissions
```

#### Frontend (Next.js + React)
```typescript
// Pages & Components
- /auth/register - Registration page
- /auth/verify-email - Email verification page
- /auth/login - Login page
- /auth/forgot-password - Password reset request
- /auth/reset-password - Password reset form
- /dashboard/users - User management page
- /dashboard/profile - User profile page

// State Management
- Redux untuk auth state
- React Context untuk user permissions
- Session management dengan cookies
```

#### Database Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  role VARCHAR(50) DEFAULT 'cashier',
  status VARCHAR(50) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Deliverables

- ✅ Project setup dengan Next.js, Hono, PostgreSQL, Supabase
- ✅ Authentication system (Register, Login, Email Verification, Password Reset)
- ✅ RBAC implementation
- ✅ User management module
- ✅ CI/CD pipeline setup
- ✅ Unit tests (coverage > 80%)
- ✅ API documentation (Swagger/OpenAPI)
- ✅ Database migration scripts

### Definition of Done (DoD)

- [ ] Semua user stories completed & tested
- [ ] Unit tests written dengan coverage > 80%
- [ ] Integration tests passed
- [ ] Code review approved oleh 2 engineers
- [ ] API documentation updated
- [ ] Database migrations tested
- [ ] Security audit passed (password hashing, SQL injection, CORS)
- [ ] Performance test: auth response < 300ms
- [ ] Deployment ke staging berhasil
- [ ] Stakeholder approval

### Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Email delivery delay | High | Setup backup email service, implement retry logic |
| Rate limiting bypass | High | Implement Redis-based rate limiting |
| Database downtime | Critical | Setup backup, automated failover |
| Token expiration issues | Medium | Clear documentation, refresh token mechanism |

---

## Phase 2: POS & Basic Sales

**Duration:** 2-3 minggu  
**Status:** ⚪ Pending Phase 1 Completion  
**Dependencies:** Phase 1 (Authentication)  

### Objectives
- Implement complete POS transaction system
- Integrate barcode scanning
- Support multiple payment methods
- Handle transaction hold & resume
- Generate digital receipts

### User Stories

#### US2.1: Product Search & Selection
```
As a cashier
I want to search and select products quickly
So that I can process transactions faster

Acceptance Criteria:
- Search by product name / SKU / barcode
- Display product list dengan harga dan stock
- Auto-complete suggestion saat typing
- Pilih product → tambah ke cart
- Search response time < 1 detik
```

#### US2.2: Barcode Scanner Integration
```
As a cashier
I want to scan barcode to add products
So that I dapat input produk tanpa typing

Acceptance Criteria:
- Compatible dengan USB barcode scanner
- Trigger: barcode scan → product auto-added to cart
- Jika barcode tidak ditemukan → error notification
- Batching: dapat scan multiple items quickly
```

#### US2.3: Shopping Cart Management
```
As a cashier
I want to manage items in shopping cart
So that I dapat adjust quantity dan remove items sebelum checkout

Acceptance Criteria:
- View cart items dengan qty, harga per item, subtotal
- Update item quantity
- Remove item from cart
- Real-time total calculation (include discount & tax)
- Discard cart option
```

#### US2.4: Discount Management
```
As a cashier
I want to apply discount ke items atau transaction
So that I dapat memberikan penawaran khusus

Acceptance Criteria:
- Discount per item (fixed amount atau percentage)
- Discount per transaction
- Discount code / voucher system
- Tampilkan discount breakdown di receipt
- Approval diperlukan jika discount > threshold
```

#### US2.5: Tax Calculation
```
As a cashier
I want to automatically calculate tax
So that tax terintegrasi di setiap transaksi

Acceptance Criteria:
- Automatic PPN calculation (11%)
- Tax applied to each item atau transaction level
- Option untuk tax-exempt items
- Display tax amount di cart dan receipt
- Tax report generation
```

#### US2.6: Payment Processing
```
As a cashier
I want to process payment dengan multiple methods
So that customer dapat membayar sesuai preferensi

Acceptance Criteria:
- Payment methods: Cash, QRIS, Bank Transfer, Debit, Credit, E-Wallet
- QRIS integration untuk mobile payment
- Validation untuk setiap payment method
- Change calculation untuk cash payment
- Payment confirmation display
- Receipt generation otomatis
```

#### US2.7: Transaction Hold & Resume
```
As a cashier
I want to hold transaction dan resume later
So that saya dapat assist multiple customers

Acceptance Criteria:
- Hold transaction → state di-save
- Resume transaction → cart di-restore
- List held transactions (max 10)
- Cancel held transaction
- Held transaction auto-expire setelah 24 jam
```

#### US2.8: Refund & Void Transaction
```
As a cashier/manager
I want to refund atau void transaction
So that dapat correct mistakes

Acceptance Criteria:
- Refund: setelah pembayaran successful (< 1 hari)
- Void: sebelum pembayaran complete
- Approval required dari manager untuk refund
- Original receipt disimpan
- Refund receipt di-generate
- Transaction history tercatat
```

#### US2.9: Digital Receipt
```
As a system
I want to generate dan send digital receipt
So that customer dapat menerima bukti pembelian

Acceptance Criteria:
- Print receipt ke printer thermal
- Email receipt ke customer
- WhatsApp receipt ke customer (integration di Phase 5)
- Receipt format: clear, professional, contain all transaction details
- QR code untuk receipt tracking (future feature)
```

### Technical Requirements

#### Backend APIs
```typescript
// POS Transaction
- GET /products/search?q=query - Search products
- GET /products/:id - Get product detail
- POST /transactions - Create transaction
- PATCH /transactions/:id - Update transaction (add items, discount, etc)
- DELETE /transactions/:id - Cancel transaction
- POST /transactions/:id/checkout - Process checkout
- POST /transactions/:id/hold - Hold transaction
- GET /transactions/held - List held transactions
- POST /transactions/:id/resume - Resume held transaction
- POST /transactions/:id/refund - Refund transaction
- POST /transactions/:id/void - Void transaction
- GET /transactions/:id/receipt - Get receipt data
- POST /transactions/:id/receipt/print - Print receipt
- POST /transactions/:id/receipt/email - Email receipt

// Payment Processing
- POST /payments/process - Process payment
- POST /payments/qris/generate - Generate QRIS code
- POST /payments/validate - Validate payment
- GET /payments/methods - Get available payment methods
```

#### Frontend Components
```typescript
// POS Page (/pos)
- POS Layout: Product Search | Shopping Cart | Payment
- ProductSearch Component
- BarcodeScannerInput Component
- ShoppingCart Component
- DiscountSection Component
- PaymentMethod Selection Component
- CartSummary Component (Total, Tax, Discount)
- ReceiptPreview Component

// Transaction Management
- TransactionHistory Component
- HeldTransactionsList Component
- RefundForm Component

// Receipt
- ReceiptTemplate Component (Print/Email/WhatsApp)
```

#### Database Schema Addition
```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  category_id UUID,
  description TEXT,
  purchase_price DECIMAL(12, 2),
  selling_price DECIMAL(12, 2),
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  cashier_id UUID REFERENCES users(id),
  transaction_number VARCHAR(50) UNIQUE,
  status VARCHAR(50), -- pending, completed, refunded, voided
  subtotal DECIMAL(12, 2),
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50), -- pending, completed, failed
  notes TEXT,
  held_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Transaction Items
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  product_id UUID REFERENCES products(id),
  quantity INT,
  unit_price DECIMAL(12, 2),
  discount DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2),
  subtotal DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Records
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  payment_method VARCHAR(50),
  amount DECIMAL(12, 2),
  reference_number VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receipts
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  receipt_number VARCHAR(50),
  content TEXT,
  sent_to_email VARCHAR(255),
  sent_to_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Deliverables

- ✅ POS module dengan product search, cart, checkout
- ✅ Barcode scanner integration
- ✅ Multiple payment methods support
- ✅ Transaction hold & resume
- ✅ Refund & void functionality
- ✅ Receipt generation (print & email)
- ✅ Transaction data model & migration
- ✅ Unit & integration tests (coverage > 80%)
- ✅ Performance test: transaction < 30 detik

### Definition of Done

- [ ] Semua US completed & tested
- [ ] Manual testing: POS transaction end-to-end
- [ ] Performance test: transaction processing < 30 detik
- [ ] Barcode scanner tested dengan real hardware
- [ ] Payment method simulation tested
- [ ] Receipt format reviewed & approved
- [ ] Code review passed
- [ ] Deployed ke staging
- [ ] Stakeholder testing & approval

---

## Phase 3: Inventory Management

**Duration:** 2-3 minggu  
**Status:** ⚪ Pending Phase 2 Completion  
**Dependencies:** Phase 2 (Products)  

### Objectives
- Implement real-time inventory tracking
- Support stock in/out/adjustment operations
- Generate low stock alerts
- Enable stock opname functionality
- Track inventory movement history

### User Stories

#### US3.1: Stock In (Receiving Goods)
```
As a warehouse manager
I want to record incoming stock
So that inventory tetap accurate

Acceptance Criteria:
- Create stock in dengan purchase order / supplier reference
- Scan atau input product barcode
- Enter quantity diterima
- Option untuk batch number / expiry date
- Stock updated di product master
- Auto-generate stock in receipt
```

#### US3.2: Stock Out (Sales/Usage)
```
As a system
I want to auto-reduce stock when sale occurs
So that inventory always accurate

Acceptance Criteria:
- Stock automatically reduced saat transaction completed
- Manual stock out option (for non-sale adjustment)
- Track reason untuk manual stock out
- Stock out history recorded
```

#### US3.3: Stock Adjustment
```
As a warehouse manager
I want to adjust stock for corrections
So that saya dapat fix stock discrepancies

Acceptance Criteria:
- Increase atau decrease stock quantity
- Require reason untuk adjustment
- Require approval jika adjustment > threshold
- Adjustment history recorded
- Audit trail untuk tracking
```

#### US3.4: Low Stock Alert
```
As a store manager
I want to be notified of low stock
So that saya dapat order produk sebelum kehabisan

Acceptance Criteria:
- Set minimum stock level per product
- Alert triggered saat stock <= minimum
- Alert di dashboard dan via notification
- Alert frequency: daily reminder
- Bulk edit minimum stock untuk multiple products
```

#### US3.5: Stock Opname (Physical Count)
```
As a warehouse manager
I want to conduct stock opname
So that saya dapat validate fisik stock dengan system

Acceptance Criteria:
- Create stock opname session
- Input physical count per product (via barcode scan)
- System calculate variance (expected vs actual)
- Approval untuk adjustment jika ada discrepancy
- Generate stock opname report
- Lock stock opname after completion
```

#### US3.6: Stock Transfer Between Outlets
```
As a store manager (multi-outlet)
I want to transfer stock antar outlet
So that saya dapat optimize stock distribution

Acceptance Criteria:
- Select source dan destination outlet
- Input products & quantities
- Create transfer request
- Approval workflow (dari destination)
- Receipt confirmation saat stock diterima
- Stock reduced dari source, increased di destination
```

#### US3.7: Inventory History & Monitoring
```
As a manager
I want to view inventory movement history
So that saya dapat track stock changes

Acceptance Criteria:
- View stock in, stock out, adjustments per product
- Filter by date range, product, type
- Export history ke Excel/CSV
- Real-time stock quantity display
- Last updated timestamp
```

#### US3.8: Expired Product Alert
```
As a manager
I want to be alerted of expired products
So that saya dapat remove expired items

Acceptance Criteria:
- Set expiry date saat stock in
- Alert 7 hari sebelum expiry
- Alert saat product sudah expired
- Mark product sebagai expired
- Cannot sell expired product (block di POS)
```

### Technical Requirements

#### Backend APIs
```typescript
// Inventory Management
- POST /inventory/stock-in - Record incoming stock
- POST /inventory/stock-out - Record outgoing stock
- POST /inventory/adjustments - Create stock adjustment
- GET /inventory/adjustments/:id - Get adjustment detail
- PATCH /inventory/adjustments/:id/approve - Approve adjustment
- GET /inventory/stock-levels - Get current stock levels
- GET /inventory/low-stock - Get low stock products
- GET /inventory/history - Get movement history
- POST /inventory/opname - Create stock opname session
- PATCH /inventory/opname/:id - Update opname item
- POST /inventory/opname/:id/complete - Complete opname
- POST /inventory/transfer - Create stock transfer
- PATCH /inventory/transfer/:id/receive - Receive transfer
- GET /inventory/expired-products - Get expired products
```

#### Frontend Components
```typescript
// Inventory Pages
- /inventory/stock-in - Stock in form
- /inventory/stock-out - Stock out form
- /inventory/adjustments - Stock adjustment management
- /inventory/opname - Stock opname session
- /inventory/transfers - Stock transfer (multi-outlet)
- /inventory/monitoring - Real-time stock levels
- /inventory/alerts - Low stock & expired product alerts
- /inventory/history - Movement history & reporting

// Components
- StockInForm Component
- StockOpnameScanner Component
- InventoryTable Component
- StockAlertPanel Component
- StockTransferFlow Component
```

#### Database Schema Addition
```sql
-- Stock Movement Log
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  product_id UUID REFERENCES products(id),
  outlet_id UUID, -- NULL jika single outlet
  movement_type VARCHAR(50), -- in, out, adjustment, transfer_out, transfer_in
  quantity INT,
  reference_type VARCHAR(50), -- transaction, purchase_order, manual
  reference_id UUID,
  reason VARCHAR(255),
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock Adjustments
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  adjustment_number VARCHAR(50),
  status VARCHAR(50), -- pending, approved, rejected
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP
);

-- Stock Adjustment Items
CREATE TABLE stock_adjustment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id UUID REFERENCES stock_adjustments(id),
  product_id UUID REFERENCES products(id),
  current_stock INT,
  adjusted_stock INT,
  variance INT,
  reason VARCHAR(255)
);

-- Stock Opname
CREATE TABLE stock_opname_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  opname_number VARCHAR(50),
  status VARCHAR(50), -- in_progress, completed
  started_by UUID REFERENCES users(id),
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Stock Opname Items
CREATE TABLE stock_opname_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opname_id UUID REFERENCES stock_opname_sessions(id),
  product_id UUID REFERENCES products(id),
  expected_quantity INT,
  actual_quantity INT,
  variance INT,
  variance_percentage DECIMAL(5, 2)
);

-- Stock Transfers
CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  transfer_number VARCHAR(50),
  source_outlet_id UUID,
  destination_outlet_id UUID,
  status VARCHAR(50), -- pending, received, cancelled
  created_by UUID REFERENCES users(id),
  received_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  received_at TIMESTAMP
);

-- Product Expiry Tracking
ALTER TABLE products ADD COLUMN expiry_date DATE;
ALTER TABLE stock_movements ADD COLUMN batch_number VARCHAR(100);
ALTER TABLE stock_movements ADD COLUMN expiry_date DATE;
```

### Deliverables

- ✅ Inventory management module lengkap
- ✅ Real-time stock tracking
- ✅ Stock opname functionality
- ✅ Low stock & expiry alerts
- ✅ Multi-outlet stock transfer
- ✅ Inventory history & reporting
- ✅ Database migrations
- ✅ Tests (coverage > 80%)

### Definition of Done

- [ ] Semua US completed & tested
- [ ] Manual testing: stock opname end-to-end
- [ ] Alert system tested & working
- [ ] Stock accuracy test: > 95%
- [ ] Multi-outlet transfer tested
- [ ] Code review passed
- [ ] Deployed ke staging
- [ ] Stakeholder approval

---

## Phase 4: Customer Management & CRM

**Duration:** 1-2 minggu  
**Status:** ⚪ Pending Phase 3 Completion  
**Dependencies:** Phase 2 (Transactions)  

### Objectives
- Build customer database
- Track purchase history
- Implement loyalty program
- Support customer segmentation
- Enable promotional campaigns

### User Stories

#### US4.1: Customer Registration
```
As a cashier
I want to register customer during transaction
So that saya dapat track customer data

Acceptance Criteria:
- Capture: name, phone, email, address, birthday
- Optional: customer reference number
- Phone number validation
- Auto-detect existing customer (by phone)
- Save customer ke database
```

#### US4.2: Customer Database
```
As a store manager
I want to view dan manage customer list
So that saya dapat understand customer base

Acceptance Criteria:
- View all customers dengan filter & search
- Sort by name, registration date, total purchase
- View customer detail: info, purchase history, loyalty points
- Edit customer information
- Export customer list ke Excel
```

#### US4.3: Purchase History
```
As a manager
I want to view customer purchase history
So that saya dapat understand buying patterns

Acceptance Criteria:
- Display transaction list per customer
- Show: date, amount, items purchased, payment method
- Filter by date range
- Calculate: total spent, frequency, average transaction
- Export history
```

#### US4.4: Customer Segmentation
```
As a marketing manager
I want to segment customers by behavior
So that saya dapat target promotions effectively

Acceptance Criteria:
- Auto-segment by: frequency, total spent, last purchase
- Manual segment creation
- Rules-based segmentation
- View segment size & metrics
- Apply targeted offer to segment
```

#### US4.5: Loyalty Program
```
As a store manager
I want to implement loyalty program
So that saya dapat reward loyal customers

Acceptance Criteria:
- Earn points per transaction (1 point = Rp 1.000 spent)
- View loyalty balance di receipt
- Redeem points: discount, voucher, free item
- Tiered membership: Silver, Gold, Platinum
- Automatic tier upgrade based on criteria
```

#### US4.6: Customer Notes & Preferences
```
As a cashier
I want to add notes tentang customer
So that saya dapat provide better service

Acceptance Criteria:
- Add internal notes (tidak visible ke customer)
- Record preferences: payment method, favorite items
- Flag VIP customers
- Track contact preferences (email, SMS, WhatsApp)
```

### Technical Requirements

#### Backend APIs
```typescript
// Customer Management
- POST /customers - Create customer
- GET /customers - List customers
- GET /customers/:id - Get customer detail
- PATCH /customers/:id - Update customer
- DELETE /customers/:id - Delete customer
- GET /customers/:id/purchases - Get purchase history
- GET /customers/search?phone=... - Quick search by phone

// Loyalty Program
- GET /customers/:id/loyalty - Get loyalty balance
- POST /customers/:id/loyalty/redeem - Redeem points
- GET /loyalty/tiers - Get tier definitions
- GET /loyalty/transactions/:id - Get loyalty transaction

// Segmentation
- GET /customers/segments - List segments
- POST /customers/segments - Create segment
- GET /customers/segments/:id/members - Get segment members
```

#### Frontend Components
```typescript
// Customer Pages
- /customers - Customer list & management
- /customers/:id - Customer detail & profile
- /customers/:id/purchases - Purchase history
- /customers/segments - Customer segmentation
- /loyalty - Loyalty program dashboard

// Components
- CustomerForm Component
- CustomerSearchInput Component
- PurchaseHistoryTable Component
- LoyaltyCard Component
- SegmentBuilder Component
```

#### Database Schema Addition
```sql
-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  birthday DATE,
  customer_type VARCHAR(50) DEFAULT 'regular', -- regular, vip
  total_spent DECIMAL(12, 2) DEFAULT 0,
  total_transactions INT DEFAULT 0,
  last_purchase_date TIMESTAMP,
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Points
CREATE TABLE loyalty_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE REFERENCES customers(id),
  points_balance DECIMAL(12, 2) DEFAULT 0,
  tier_level VARCHAR(50) DEFAULT 'silver',
  tier_upgraded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty Transactions
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  transaction_type VARCHAR(50), -- earn, redeem
  points DECIMAL(12, 2),
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Notes
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  note_text TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Segments
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(100),
  description TEXT,
  rules JSONB, -- dynamic rules
  created_at TIMESTAMP DEFAULT NOW()
);

-- Segment Membership
CREATE TABLE segment_members (
  segment_id UUID REFERENCES customer_segments(id),
  customer_id UUID REFERENCES customers(id),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (segment_id, customer_id)
);
```

### Deliverables

- ✅ Customer database & management
- ✅ Purchase history tracking
- ✅ Loyalty program implementation
- ✅ Customer segmentation
- ✅ Customer notes & preferences
- ✅ Database migrations
- ✅ Tests (coverage > 80%)

### Definition of Done

- [ ] Semua US completed & tested
- [ ] Loyalty calculation tested & accurate
- [ ] Segmentation rules tested
- [ ] Customer import/export tested
- [ ] Code review passed
- [ ] Deployed ke staging
- [ ] Stakeholder approval

---

## Phase 5: Reporting & Analytics

**Duration:** 2-3 minggu  
**Status:** ⚪ Pending Phase 4 Completion  
**Dependencies:** Phases 2, 3, 4  

### Objectives
- Create comprehensive dashboard
- Implement sales analytics
- Generate inventory & customer reports
- Support data export
- Enable business insights

### User Stories

#### US5.1: Dashboard Overview
```
As an UMKM owner
I want to see key business metrics at a glance
So that saya dapat quickly assess business performance

Acceptance Criteria:
- Show real-time KPIs: Today's sales, Monthly sales, Total transactions
- Display trends: Sales chart (daily/weekly/monthly)
- Top 5 best-selling products
- Recent transactions
- Low stock alerts
- Load time < 2 detik
```

#### US5.2: Sales Reports
```
As a manager
I want to generate detailed sales reports
So that saya dapat analyze sales performance

Acceptance Criteria:
- Sales by date, product, category, payment method
- Filter by date range
- Show: quantity sold, revenue, gross profit
- Compare with previous period
- Export to Excel/PDF
```

#### US5.3: Product Analytics
```
As a manager
I want to analyze product performance
So that saya dapat make inventory decisions

Acceptance Criteria:
- Best selling products (by quantity & revenue)
- Slow-moving products
- Product category performance
- Price elasticity analysis
- Stock turnover rate
- Export capability
```

#### US5.4: Customer Analytics
```
As a manager
I want to understand customer behavior
So that saya dapat improve customer service

Acceptance Criteria:
- Top customers by revenue
- Customer acquisition rate
- Repeat customer rate
- Average transaction value
- Customer lifetime value
- Churn analysis
```

#### US5.5: Profit & Loss Report
```
As a business owner
I want to see profit & loss statement
So that saya dapat understand profitability

Acceptance Criteria:
- Revenue by category / product line
- Cost of goods sold
- Operating expenses tracking
- Gross profit & net profit
- Profit margin analysis
- Monthly P&L comparison
```

#### US5.6: Export & Scheduling
```
As a manager
I want to export reports dan schedule delivery
So that saya dapat share reports automatically

Acceptance Criteria:
- Export formats: PDF, Excel, CSV
- Schedule report delivery (daily, weekly, monthly)
- Email delivery to stakeholders
- Customizable columns & data
- Save report templates
```

### Technical Requirements

#### Backend APIs
```typescript
// Analytics & Reporting
- GET /analytics/dashboard - Get dashboard KPIs
- GET /analytics/sales - Get sales metrics
- GET /analytics/products - Get product analytics
- GET /analytics/customers - Get customer analytics
- GET /analytics/profit-loss - Get P&L data
- POST /reports/generate - Generate custom report
- GET /reports/:id - Get report detail
- POST /reports/export - Export report
- POST /reports/schedule - Schedule report delivery
```

#### Frontend Components
```typescript
// Analytics Pages
- /analytics/dashboard - Main dashboard
- /analytics/sales - Sales reports
- /analytics/products - Product analytics
- /analytics/customers - Customer analytics
- /analytics/profit-loss - P&L statement
- /reports - Report management

// Chart Components (using Recharts)
- LineChart (Sales trend)
- BarChart (Product performance, Category comparison)
- PieChart (Payment method distribution)
- AreaChart (Revenue over time)
- DataTable (Detailed data view)
```

#### Database Views (PostgreSQL)
```sql
-- Sales Summary View
CREATE VIEW sales_summary AS
SELECT 
  DATE(t.created_at) as sale_date,
  COUNT(*) as transaction_count,
  SUM(t.total_amount) as total_revenue,
  AVG(t.total_amount) as avg_transaction
FROM transactions t
WHERE t.status = 'completed'
GROUP BY DATE(t.created_at);

-- Product Performance View
CREATE VIEW product_performance AS
SELECT 
  p.id,
  p.name,
  SUM(ti.quantity) as quantity_sold,
  SUM(ti.subtotal) as revenue,
  SUM(ti.subtotal - (ti.quantity * p.purchase_price)) as gross_profit
FROM products p
JOIN transaction_items ti ON p.id = ti.product_id
GROUP BY p.id, p.name;

-- Customer Value View
CREATE VIEW customer_value AS
SELECT 
  c.id,
  c.name,
  COUNT(t.id) as transaction_count,
  SUM(t.total_amount) as total_spent,
  AVG(t.total_amount) as avg_transaction,
  MAX(t.created_at) as last_purchase_date
FROM customers c
LEFT JOIN transactions t ON c.id = t.customer_id
GROUP BY c.id, c.name;
```

### Deliverables

- ✅ Comprehensive dashboard
- ✅ Sales, product, customer analytics
- ✅ P&L report generation
- ✅ Export functionality
- ✅ Report scheduling
- ✅ Database views & optimization
- ✅ Tests (coverage > 80%)

### Definition of Done

- [ ] Semua US completed & tested
- [ ] Dashboard load time tested (< 2 detik)
- [ ] All charts rendering correctly
- [ ] Export tested dengan different formats
- [ ] Report accuracy verified
- [ ] Code review passed
- [ ] Deployed ke staging
- [ ] Stakeholder approval

---

## Phase 6: Advanced Features & Polish

**Duration:** 1-2 minggu  
**Status:** ⚪ Pending Phase 5 Completion  
**Dependencies:** All previous phases  

### Objectives
- Implement WhatsApp integration
- Fine-tune performance
- Enhance UI/UX
- Complete documentation
- Production readiness

### User Stories

#### US6.1: WhatsApp Receipt
```
As a customer
I want to receive receipt via WhatsApp
So that saya dapat save transaction proof

Acceptance Criteria:
- Send receipt ke customer phone setelah transaksi
- Receipt format: clear, include all transaction details
- Option: customer opt-in/opt-out
- Scheduled delivery jika send immediately fails
```

#### US6.2: WhatsApp Customer Notifications
```
As a store manager
I want to send notifications via WhatsApp
So that saya dapat keep customers updated

Acceptance Criteria:
- Low stock notifications ke store managers
- Payment reminders untuk outstanding invoices
- Order status updates
- Promotional messages (batch)
- Respects quiet hours (9 PM - 8 AM)
```

#### US6.3: Performance Optimization
```
As a developer
I want to optimize application performance
So that system dapat handle more users

Acceptance Criteria:
- Page load time < 2 detik
- API response time < 300ms
- Database query optimization
- Image optimization & compression
- Implement caching strategies (Redis)
- Monitor dengan Monitoring tools
```

#### US6.4: UI/UX Polish
```
As a user
I want smooth dan beautiful interface
So that saya enjoy using the application

Acceptance Criteria:
- Consistent design system
- Loading states & animations
- Error handling & messaging
- Accessibility compliance (WCAG 2.1)
- Mobile responsive
- Dark mode support (future)
```

#### US6.5: Comprehensive Documentation
```
As a user/developer
I want complete documentation
So that saya dapat use dan maintain the system

Acceptance Criteria:
- User manual untuk setiap module
- API documentation (Swagger)
- Developer guide untuk setup & deployment
- Video tutorials untuk key features
- FAQ & troubleshooting guide
```

### Technical Requirements

#### WhatsApp Integration
```typescript
// WhatsApp APIs (using WhatsApp Business API)
- Integration dengan WhatsApp Business Account
- Message templates pre-approval
- Queue system untuk message delivery
- Webhook untuk delivery status tracking
- Rate limiting compliance
```

#### Performance Optimization
```typescript
// Frontend Optimization
- Code splitting & lazy loading
- Image optimization (WebP, responsive sizes)
- CSS-in-JS optimization
- Bundle size monitoring
- Lighthouse score target: > 85

// Backend Optimization
- Database query optimization (indexes, joins)
- Connection pooling
- Caching strategy (CDN, Redis)
- API response compression (gzip)
- Rate limiting & throttling
```

### Deliverables

- ✅ WhatsApp integration fully functional
- ✅ Performance metrics optimized
- ✅ UI/UX polish completed
- ✅ Complete documentation
- ✅ Final testing & bug fixes
- ✅ Security audit passed
- ✅ Ready for production launch

### Definition of Done

- [ ] All features tested & working
- [ ] Performance benchmarks met
- [ ] Documentation complete & reviewed
- [ ] Security audit passed
- [ ] Load testing completed (> 100 concurrent users)
- [ ] Final code review & approval
- [ ] Production deployment checklist completed
- [ ] Go-live approval from stakeholders

---

## Project Folder Structure

Struktur folder dirancang untuk scalability, maintainability, dan separation of concerns.

```
arhat-pos/
├── apps/                           # Mono-repo structure
│   ├── web/                        # Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/               # Next.js 15 app router
│   │   │   │   ├── (auth)/        # Auth layout group
│   │   │   │   │   ├── register/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── ...
│   │   │   │   ├── (dashboard)/   # Protected routes
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx   # Dashboard home
│   │   │   │   │   ├── pos/
│   │   │   │   │   ├── products/
│   │   │   │   │   ├── inventory/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── ...
│   │   │   │   └── api/           # API routes (if needed)
│   │   │   ├── components/        # Reusable React components
│   │   │   │   ├── auth/          # Auth components
│   │   │   │   ├── layouts/
│   │   │   │   ├── pos/           # POS module components
│   │   │   │   │   ├── ShoppingCart.tsx
│   │   │   │   │   ├── ProductSearch.tsx
│   │   │   │   │   ├── PaymentMethod.tsx
│   │   │   │   │   └── ...
│   │   │   │   ├── inventory/
│   │   │   │   ├── customers/
│   │   │   │   ├── reports/
│   │   │   │   ├── common/        # Shared components (Button, Modal, etc)
│   │   │   │   └── ...
│   │   │   ├── features/          # Feature-based modules (Redux, API slices)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   ├── useAuth.ts
│   │   │   │   │   └── authApi.ts
│   │   │   │   ├── pos/
│   │   │   │   │   ├── posSlice.ts
│   │   │   │   │   ├── usePOS.ts
│   │   │   │   │   └── posApi.ts
│   │   │   │   ├── inventory/
│   │   │   │   ├── customers/
│   │   │   │   ├── reports/
│   │   │   │   └── ...
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   ├── useApi.ts
│   │   │   │   ├── usePagination.ts
│   │   │   │   ├── useLocalStorage.ts
│   │   │   │   └── ...
│   │   │   ├── lib/               # Utilities & helpers
│   │   │   │   ├── api.ts         # API client configuration
│   │   │   │   ├── validators.ts
│   │   │   │   ├── formatters.ts  # Format date, currency, etc
│   │   │   │   ├── calculations.ts
│   │   │   │   └── ...
│   │   │   ├── styles/            # Global styles & CSS
│   │   │   │   ├── globals.css
│   │   │   │   ├── variables.css
│   │   │   │   └── ...
│   │   │   ├── store/             # Redux store
│   │   │   │   ├── store.ts
│   │   │   │   ├── rootReducer.ts
│   │   │   │   └── middleware.ts
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   │   ├── index.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── domain.ts      # Business domain types
│   │   │   │   └── ...
│   │   │   ├── constants/         # Constants & configs
│   │   │   │   ├── apiEndpoints.ts
│   │   │   │   ├── appConfig.ts
│   │   │   │   └── ...
│   │   │   └── env.ts             # Environment configuration
│   │   ├── public/                # Static assets
│   │   ├── tests/                 # Test files
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   ├── e2e/
│   │   │   └── __mocks__/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   └── tailwind.config.js
│   │
│   └── api/                       # Backend (Hono + Cloudflare Workers)
│       ├── src/
│       │   ├── index.ts           # Main entry point
│       │   ├── middleware/        # Middleware (auth, error handling, etc)
│       │   │   ├── auth.ts
│       │   │   ├── errorHandler.ts
│       │   │   ├── rateLimiter.ts
│       │   │   ├── requestLogger.ts
│       │   │   └── ...
│       │   ├── routes/            # API routes
│       │   │   ├── auth.ts        # /auth routes
│       │   │   ├── users.ts       # /users routes
│       │   │   ├── products.ts    # /products routes
│       │   │   ├── pos.ts         # /pos routes
│       │   │   ├── transactions.ts
│       │   │   ├── inventory.ts
│       │   │   ├── customers.ts
│       │   │   ├── reports.ts
│       │   │   └── ...
│       │   ├── controllers/       # Business logic
│       │   │   ├── auth.controller.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── products.controller.ts
│       │   │   ├── pos.controller.ts
│       │   │   ├── inventory.controller.ts
│       │   │   ├── customers.controller.ts
│       │   │   ├── reports.controller.ts
│       │   │   └── ...
│       │   ├── services/          # Business services / use cases
│       │   │   ├── auth.service.ts
│       │   │   ├── users.service.ts
│       │   │   ├── products.service.ts
│       │   │   ├── pos.service.ts
│       │   │   ├── inventory.service.ts
│       │   │   ├── customers.service.ts
│       │   │   ├── reports.service.ts
│       │   │   └── ...
│       │   ├── repositories/      # Data access layer
│       │   │   ├── users.repository.ts
│       │   │   ├── products.repository.ts
│       │   │   ├── transactions.repository.ts
│       │   │   ├── inventory.repository.ts
│       │   │   ├── customers.repository.ts
│       │   │   └── ...
│       │   ├── models/            # Data models & database queries
│       │   │   ├── User.ts
│       │   │   ├── Product.ts
│       │   │   ├── Transaction.ts
│       │   │   ├── Inventory.ts
│       │   │   ├── Customer.ts
│       │   │   └── ...
│       │   ├── types/             # TypeScript interfaces & types
│       │   │   ├── index.ts
│       │   │   ├── api.ts         # API request/response types
│       │   │   ├── domain.ts      # Business domain types
│       │   │   ├── database.ts    # Database model types
│       │   │   └── ...
│       │   ├── lib/               # Utilities & helpers
│       │   │   ├── db.ts          # Database connection
│       │   │   ├── auth.ts        # Auth utilities (JWT, password hashing)
│       │   │   ├── validators.ts  # Input validation
│       │   │   ├── logger.ts      # Logging
│       │   │   ├── errors.ts      # Custom error classes
│       │   │   ├── cache.ts       # Caching utilities
│       │   │   └── ...
│       │   ├── config/            # Configuration
│       │   │   ├── database.ts
│       │   │   ├── env.ts
│       │   │   ├── constants.ts
│       │   │   └── ...
│       │   └── utils/             # Helper functions
│       │       ├── pagination.ts
│       │       ├── formatters.ts
│       │       ├── calculations.ts
│       │       └── ...
│       ├── tests/                 # Test files
│       │   ├── unit/
│       │   ├── integration/
│       │   └── __mocks__/
│       ├── migrations/            # Database migrations (Supabase)
│       │   ├── 001_initial_schema.sql
│       │   ├── 002_add_transactions.sql
│       │   └── ...
│       ├── package.json
│       ├── tsconfig.json
│       ├── wrangler.toml          # Cloudflare Workers config
│       └── vitest.config.ts       # Test configuration
│
├── packages/                      # Shared packages
│   ├── eslint-config/
│   ├── typescript-config/
│   ├── ui/                        # Shared UI components library
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   └── package.json
│   └── types/                     # Shared type definitions
│       ├── src/
│       │   ├── api.ts
│       │   ├── domain.ts
│       │   └── ...
│       └── package.json
│
├── docs/                          # Documentation
│   ├── api/                       # API documentation (Swagger specs)
│   │   ├── openapi.yaml
│   │   └── ...
│   ├── user-guide/               # User manual
│   │   ├── getting-started.md
│   │   ├── pos-module.md
│   │   ├── inventory.md
│   │   ├── customers.md
│   │   ├── reports.md
│   │   └── ...
│   ├── developer-guide/          # Developer documentation
│   │   ├── setup.md
│   │   ├── architecture.md
│   │   ├── coding-standards.md
│   │   ├── database.md
│   │   ├── api-integration.md
│   │   └── deployment.md
│   ├── architecture/             # Architecture diagrams & docs
│   │   ├── system-architecture.md
│   │   ├── data-flow.md
│   │   ├── database-schema.md
│   │   └── ...
│   ├── CHANGELOG.md
│   └── README.md
│
├── .github/                      # GitHub configuration
│   ├── workflows/               # GitHub Actions CI/CD
│   │   ├── test.yml
│   │   ├── lint.yml
│   │   ├── build.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE/
│   └── ...
│
├── .env.example                 # Environment variables template
├── docker-compose.yml           # Docker compose untuk local development
├── Dockerfile                   # Production Dockerfile (untuk VPS migration)
├── package.json                 # Root package.json (workspace)
├── pnpm-workspace.yaml         # PNPM workspace configuration
├── turbo.json                  # Turbo build orchestration
├── tsconfig.base.json          # Base TypeScript config
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── jest.config.js              # Jest testing configuration
├── README.md                    # Project README
└── CONTRIBUTING.md             # Contributing guidelines
```

### Folder Structure Explanation

#### Apps Directory
- **web**: Frontend Next.js aplikasi user-facing
- **api**: Backend Hono API (Cloudflare Workers)

#### Folder Organization Principles
1. **Feature-based organization** di dalam setiap modul (pos/, inventory/, customers/)
2. **Layer separation**: routes → controllers → services → repositories
3. **Shared utilities** di lib/ dan utils/
4. **Type safety**: Centralized type definitions di types/
5. **Tests collocated** dengan kode source atau di tests/ directory

#### Key Directories
- `packages/`: Reusable packages untuk shared code
- `docs/`: All documentation
- `.github/`: CI/CD workflows & templates
- `migrations/`: Database versioning

---

## SDLC Best Practices

### 1. Version Control Strategy

#### Git Workflow
```bash
# Main branches
- main (production ready)
- staging (pre-production testing)
- develop (integration branch)

# Feature branches
- feature/feature-name (dari develop)
- bugfix/bug-name
- hotfix/bug-name (dari main)

# Naming convention
- feature/auth-login-form
- feature/pos-barcode-scanner
- bugfix/inventory-calculation
- hotfix/payment-timeout
```

#### Commit Message Convention
```
<type>(<scope>): <subject>
<blank line>
<body>
<blank line>
<footer>

Type:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- test: adding tests
- chore: maintenance tasks

Example:
feat(pos): implement barcode scanner integration

- Add BarcodeScannerInput component
- Integrate with hardware via WebUSB API
- Add validation for barcode format
- Write unit tests for validation

Closes #123
```

### 2. Code Quality Standards

#### ESLint & Prettier Configuration
```javascript
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/explicit-function-return-types": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}

// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "useTabs": false,
  "tabWidth": 2
}
```

#### TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

#### Code Review Checklist
```markdown
### Code Quality
- [ ] Code follows ESLint & Prettier standards
- [ ] TypeScript strict mode compliant
- [ ] No console.log in production code
- [ ] No hardcoded values/URLs
- [ ] Proper error handling implemented

### Testing
- [ ] Unit tests written (coverage > 80%)
- [ ] Integration tests if applicable
- [ ] All tests passing

### Documentation
- [ ] Functions documented with JSDoc
- [ ] Complex logic explained
- [ ] Types properly defined

### Performance
- [ ] No N+1 queries
- [ ] API response < 300ms
- [ ] No memory leaks
- [ ] Bundle size optimized

### Security
- [ ] No SQL injection vulnerabilities
- [ ] No hardcoded secrets/credentials
- [ ] Proper input validation
- [ ] Authorization checks implemented
```

### 3. Testing Strategy

#### Test Pyramid
```
        /\
       /  \        E2E Tests (5%)
      /    \       - User workflow testing
     /______\
      /    \       Integration Tests (15%)
     /      \      - API integration
    /________\     - Database operations
     /      \      Unit Tests (80%)
    /        \     - Functions, components
   /          \    - Business logic
  /____________\
```

#### Test File Organization
```
src/
├── features/
│   ├── pos/
│   │   ├── pos.service.ts
│   │   ├── pos.service.test.ts
│   │   ├── pos.controller.ts
│   │   ├── pos.controller.test.ts
│   │   └── ...
│   └── ...

tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── auth.e2e.test.ts
    └── pos.e2e.test.ts
```

#### Testing Tools
```json
{
  "devDependencies": {
    "vitest": "latest",           // Unit & integration testing
    "@testing-library/react": "latest",  // React testing
    "@testing-library/jest-dom": "latest",
    "msw": "latest",              // Mock Service Worker
    "supertest": "latest",        // HTTP testing
    "jest-mock-extended": "latest" // Mocking utilities
  }
}
```

#### Example Test Cases
```typescript
// pos.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POSService } from './pos.service';
import { mockTransactionRepository } from '@/__mocks__';

describe('POSService', () => {
  let service: POSService;

  beforeEach(() => {
    service = new POSService(mockTransactionRepository);
  });

  describe('createTransaction', () => {
    it('should create a transaction with items', async () => {
      const transaction = await service.createTransaction({
        items: [{ productId: '1', quantity: 2 }],
        customerId: 'cust-1',
      });

      expect(transaction).toBeDefined();
      expect(transaction.items).toHaveLength(1);
      expect(transaction.status).toBe('pending');
    });

    it('should calculate total including tax', async () => {
      const transaction = await service.createTransaction({
        items: [{ productId: '1', quantity: 1, price: 100000 }],
      });

      expect(transaction.taxAmount).toBe(11000); // PPN 11%
      expect(transaction.totalAmount).toBe(111000);
    });

    it('should throw error if item stock insufficient', async () => {
      await expect(
        service.createTransaction({
          items: [{ productId: '999', quantity: 1000 }],
        })
      ).rejects.toThrow('Insufficient stock');
    });
  });
});
```

### 4. CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [develop, staging, main]
  push:
    branches: [develop, staging, main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test
    if: success()

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
```

#### Deploy Workflow
```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel (Frontend)
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: arhat-team
      
      - name: Deploy to Cloudflare Workers (API)
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          secrets: |
            DATABASE_URL
            JWT_SECRET
```

### 5. Monitoring & Logging

#### Application Logging
```typescript
// lib/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Usage
logger.info('User logged in', { userId: 'user-123' });
logger.error('Payment processing failed', { transactionId: 'txn-456' });
```

#### Error Tracking
```typescript
// Sentry integration untuk error tracking
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Di API error handler
app.use((err, ctx) => {
  Sentry.captureException(err);
  // ... error response
});
```

### 6. Database Migration Management

#### Migration Strategy
```bash
# Directory: apps/api/migrations/

001_initial_schema.sql       # Initial tables
002_add_transactions.sql     # Add transaction tables
003_add_inventory.sql        # Add inventory tables
004_add_customers.sql        # Add customer tables
005_add_indices.sql          # Add performance indices
006_add_audit_logs.sql       # Add audit logging
```

#### Migration Best Practices
```sql
-- Use transactions
BEGIN;

-- Backward compatible changes
ALTER TABLE users ADD COLUMN new_field VARCHAR(255) DEFAULT '';

-- Create index separately
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Test data migration
UPDATE products SET category_id = 1 WHERE category_id IS NULL;

COMMIT;
```

### 7. Release Management

#### Semantic Versioning
```
Version: MAJOR.MINOR.PATCH

1.0.0 (MVP Release)
  └─ 1.0.1 (Bugfix)
  └─ 1.1.0 (Feature: Loyalty Program)
  └─ 2.0.0 (Major: Migration to production infrastructure)
```

#### Release Checklist
```markdown
## Pre-Release
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Database migration tested
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Changelog updated

## Release
- [ ] Tag version di git
- [ ] Build artifacts created
- [ ] Deploy ke production
- [ ] Verify deployment
- [ ] Monitor error rates (< 0.1%)

## Post-Release
- [ ] User notifications sent
- [ ] Monitor user feedback
- [ ] Track KPI changes
- [ ] Hot-fix ready if needed
```

---

## Testing Strategy

### Unit Testing Requirements by Module

#### Phase 1: Authentication (Target: 85% coverage)
```typescript
// Test cases to cover
- User registration validation
- Password hashing & comparison
- JWT token generation & refresh
- Email verification logic
- RBAC permission checks
- Session management
- Error handling
```

#### Phase 2: POS (Target: 80% coverage)
```typescript
// Test cases to cover
- Shopping cart calculations
- Tax calculations (different scenarios)
- Discount application (per item, per transaction)
- Payment processing (all payment methods)
- Transaction state management
- Receipt generation
- Error handling for edge cases
```

#### Phase 3: Inventory (Target: 85% coverage)
```typescript
// Test cases to cover
- Stock movement calculations
- Stock opname variance calculations
- Low stock alert logic
- Stock transfer between outlets
- Expired product detection
- Stock level validation
```

### Integration Testing

```typescript
// Database integration tests
- User creation flow
- Transaction with inventory deduction
- Customer loyalty points calculation
- Multi-outlet stock transfer

// API integration tests
- Complete auth flow (register → login → access protected route)
- Full POS transaction flow (product search → cart → payment)
- Stock adjustment workflow
```

### E2E Testing

```typescript
// Critical user journeys
- New customer registration & first purchase
- Cashier transaction workflow
- Manager creating stock opname
- Admin viewing reports & analytics
```

---

## Deployment Strategy

### Development Environment
```bash
# Setup
docker-compose up -d
pnpm install
pnpm dev

# Access
Frontend: http://localhost:3000
API: http://localhost:8787
Database: localhost:5432
```

### Staging Deployment
```bash
# Automatic via GitHub Actions on push to staging branch
# Deployed to:
# - Frontend: Vercel (staging project)
# - API: Cloudflare Workers (staging environment)
# - Database: Supabase (staging project)

# Manual testing
curl https://staging-api.arhat.com/health
```

### Production Deployment
```bash
# Step 1: Create release tag
git tag -a v1.0.0 -m "MVP Release"
git push origin v1.0.0

# Step 2: Monitor deployment via GitHub Actions
# Automatic deployment pipeline triggered

# Step 3: Post-deployment verification
curl https://api.arhat.com/health
# Check monitoring dashboards
# Monitor error rates & performance metrics

# Step 4: Rollback if needed
# Revert to previous version
git revert <commit-hash>
```

### Production Infrastructure (Future VPS Migration)
```yaml
# docker-compose.yml for VPS deployment
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    networks:
      - app-network

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/arhat
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    ports:
      - "3001:3000"

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

---

## Success Metrics & KPIs

Track setiap fase completion dengan metrics berikut:

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Development** | | |
| Feature completion rate | 100% | Per phase |
| Test coverage | > 80% | Code coverage reports |
| Code review time | < 24 hours | GitHub metrics |
| Bug escape rate | < 1% | Staging to production |
| **Performance** | | |
| API response time | < 300ms | APM monitoring |
| Page load time | < 2s | Lighthouse scores |
| Transaction processing | < 30s | User timing data |
| **Quality** | | |
| Critical bugs in prod | 0 | Incident tracking |
| User-reported issues | < 5% | Support tickets |
| Uptime | > 99.9% | Monitoring dashboard |
| **User Adoption** | | |
| Active UMKM (Y1) | 1.000+ | Analytics |
| User retention (30d) | > 80% | Cohort analysis |
| Repeat transactions | > 70% | Usage analytics |

---

## Conclusion

PRD ini dirancang untuk memberikan clear roadmap development ARHAT POS dari fase foundation hingga production-ready MVP. Setiap fase memiliki:

✅ Clear objectives & user stories  
✅ Technical requirements & API specs  
✅ Database schema designs  
✅ Definition of Done criteria  
✅ Risk mitigation strategies  

Folder structure mendukung scalability dan maintainability untuk pengembangan jangka panjang.

SDLC best practices memastikan code quality, testing rigor, dan deployment safety.

**Next Steps:**
1. Align dengan stakeholders
2. Setup development environment
3. Start Phase 1 implementation
4. Weekly progress review
5. Adjust timeline based on learnings

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Maintained By:** ARHAT Team
