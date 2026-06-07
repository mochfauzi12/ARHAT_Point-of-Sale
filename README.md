ARHAT POS

Cloud-Based Point of Sale & Business Management Platform for UMKM

> **Status:** MVP Version 1.0 (Phase 1-6) telah **SELESAI** diimplementasikan, mencakup fitur POS, Inventaris, CRM, Laporan Penjualan, WhatsApp Integration, dan Optimasi Performa.

---

Product Overview

ARHAT POS adalah aplikasi Point of Sale (POS) berbasis cloud yang dirancang untuk membantu pelaku UMKM mengelola operasional bisnis secara lebih efisien, modern, dan terintegrasi. Platform ini menggabungkan sistem kasir digital, manajemen inventaris, manajemen pelanggan (CRM), pelaporan bisnis, dan otomatisasi komunikasi pelanggan dalam satu aplikasi yang mudah digunakan.

ARHAT POS ditujukan untuk berbagai jenis usaha seperti toko retail, minimarket, toko kelontong, cafe, restoran, laundry, bengkel, toko fashion, toko elektronik, hingga bisnis dengan banyak cabang.

Tujuan utama aplikasi ini adalah membantu pemilik usaha mendapatkan kontrol penuh terhadap transaksi, stok barang, pelanggan, dan performa bisnis secara real-time tanpa harus menggunakan banyak aplikasi terpisah.

---

Product Vision

Menjadi platform manajemen bisnis UMKM yang sederhana, terjangkau, dan dapat membantu pemilik usaha mengambil keputusan berdasarkan data secara real-time.

---

Product Mission

- Digitalisasi operasional UMKM.
- Menyederhanakan proses transaksi penjualan.
- Mengurangi kesalahan pencatatan manual.
- Mengoptimalkan pengelolaan stok barang.
- Membantu meningkatkan loyalitas pelanggan.
- Menyediakan laporan bisnis yang mudah dipahami.
- Memberikan solusi yang dapat berkembang seiring pertumbuhan bisnis.

---

Target Users

Retail

- Toko Kelontong
- Minimarket
- Toko Grosir
- Toko Fashion
- Toko Elektronik
- Toko Bangunan

Food & Beverage

- Cafe
- Coffee Shop
- Restoran
- Kedai Makanan

Services

- Laundry
- Bengkel
- Salon
- Barbershop

Multi Outlet Business

- Franchise
- Bisnis dengan banyak cabang

---

Problems to Solve

Penjualan

- Transaksi masih dicatat secara manual.
- Sulit mengetahui omzet harian dan bulanan.
- Kesalahan perhitungan transaksi.

Inventaris

- Tidak mengetahui jumlah stok secara akurat.
- Kehabisan stok tanpa peringatan.
- Sulit melakukan stock opname.

Pelanggan

- Tidak memiliki database pelanggan.
- Sulit melakukan promosi.
- Tidak memiliki program loyalitas pelanggan.

Pelaporan

- Membutuhkan waktu lama untuk membuat laporan.
- Sulit mengetahui laba dan rugi usaha.
- Sulit mengetahui produk yang paling laris.

---

Core Modules

Authentication & User Management

Features

- Login
- Register
- Forgot Password
- Email Verification
- Session Management

Roles

Super Admin

- Mengelola seluruh tenant
- Mengelola paket langganan
- Monitoring sistem

Owner

- Akses penuh seluruh fitur

Manager

- Mengelola operasional bisnis

Cashier

- Melakukan transaksi penjualan

---

Dashboard Analytics

Dashboard memberikan informasi bisnis secara real-time.

KPI

- Penjualan Hari Ini
- Penjualan Bulan Ini
- Total Transaksi
- Total Produk
- Total Pelanggan
- Total Stok

Analytics

- Grafik Penjualan Harian
- Grafik Penjualan Bulanan
- Produk Terlaris
- Kategori Terlaris
- Jam Transaksi Tersibuk

---

Point of Sale (POS)

Modul utama untuk transaksi penjualan.

Features

- Product Search
- Barcode Scanner
- Shopping Cart
- Hold Transaction
- Resume Transaction
- Refund Transaction
- Void Transaction
- Discount Per Item
- Discount Per Transaction
- Automatic Tax Calculation

Payment Methods

- Cash
- QRIS
- Bank Transfer
- Debit Card
- Credit Card
- E-Wallet

Receipt

- Print Receipt
- Email Receipt
- WhatsApp Receipt

---

Product Management

Features

- Create Product
- Update Product
- Delete Product
- Product Categories
- Product Variants
- Product Import
- Product Export

Product Information

- Product Name
- SKU
- Barcode
- Category
- Description
- Purchase Price
- Selling Price
- Product Image
- Product Status

---

Inventory Management

Features

- Stock In
- Stock Out
- Stock Adjustment
- Stock Transfer
- Stock Opname

Monitoring

- Real-Time Stock Monitoring
- Inventory Movement History
- Product Availability Tracking

Notifications

- Low Stock Alert
- Out of Stock Alert
- Expired Product Alert

---

Customer Relationship Management (CRM)

Features

- Customer Database
- Purchase History
- Customer Notes
- Customer Segmentation

Customer Information

- Name
- Phone Number
- Email
- Address
- Birthday

Loyalty Program

- Reward Points
- Membership Level
- Cashback Program
- Voucher Program

---

Supplier Management

Features

- Supplier Database
- Purchase Orders
- Goods Receiving
- Supplier Payment Tracking

Supplier Information

- Supplier Name
- Contact Person
- Phone Number
- Email
- Address

---

Financial Management

Features

- Cash Management
- Income Tracking
- Expense Tracking
- Petty Cash

Financial Reports

- Profit & Loss
- Revenue Analysis
- Expense Analysis
- Cash Flow

---

Reporting & Analytics

Sales Reports

- Daily Sales
- Weekly Sales
- Monthly Sales
- Annual Sales

Product Reports

- Best Selling Products
- Slow Moving Products
- Inventory Reports

Customer Reports

- Top Customers
- Repeat Customers
- Customer Retention

Export Options

- PDF
- Excel
- CSV

---

WhatsApp Integration

Features

- Send Digital Receipt
- Customer Notifications
- Promotional Messages
- Payment Reminder
- Order Status Updates

---

Multi Outlet Management

Features

- Multiple Store Management
- Outlet Performance Monitoring
- Centralized Inventory Management
- Outlet Comparison Reports

---

Subscription Management

Starter Plan

- 1 Outlet
- 2 Users
- Basic Features

Professional Plan

- 5 Outlets
- 20 Users
- Advanced Features

Enterprise Plan

- Unlimited Outlets
- Unlimited Users
- Custom Features

---

Non Functional Requirements

Security

- JWT Authentication
- Refresh Token
- Role-Based Access Control (RBAC)
- HTTPS Encryption
- Audit Logs
- API Rate Limiting

Performance

- Response Time < 300ms
- Optimized Database Queries
- Real-Time Dashboard Updates

Availability

- Target Uptime 99.9%

Scalability

- Multi Tenant Architecture
- Horizontal Service Deployment Using Docker Containers

---

MVP Technology Stack

Frontend

Framework

- Next.js 15
- React 19
- TypeScript

UI

- Tailwind CSS
- Shadcn/UI

Data Fetching

- TanStack Query

Charts

- Recharts

---

Backend

Runtime

- Cloudflare Workers

API

- Hono Framework
- TypeScript

Authentication

- JWT
- Supabase Auth

---

Database

- PostgreSQL (Supabase)

---

Storage

- Supabase Storage
- Cloudflare R2

---

Cache

- Cloudflare KV

---

DevOps

Source Control

- GitHub

CI/CD

- GitHub Actions

Deployment

- Vercel
- Cloudflare Workers

---

Production Architecture (Growth Stage)

Ketika jumlah pelanggan meningkat, arsitektur dapat dimigrasikan secara bertahap ke VPS tanpa perlu mengubah struktur aplikasi secara signifikan.

Infrastructure

- Ubuntu Server
- Docker
- Docker Compose
- Nginx Reverse Proxy

Backend

- Golang (Gin Framework)

Database

- PostgreSQL

Cache

- Redis

Storage

- MinIO

Monitoring

- Grafana
- Prometheus
- Loki

---

MVP Scope Version 1.0

Fitur yang wajib tersedia pada peluncuran pertama:

- Authentication
- User Management
- Dashboard
- Product Management
- Inventory Management
- POS Transaction
- Customer Management
- Sales Reporting
- WhatsApp Receipt

Target pengembangan MVP:

12–16 minggu.

---

Future Roadmap

Version 2.0

- Loyalty Program
- Supplier Management
- Expense Management

Version 3.0

- WhatsApp Marketing Automation
- Customer Segmentation
- Campaign Management

Version 4.0

- AI Sales Analytics
- Stock Forecasting
- Business Insights

Version 5.0

- Marketplace Integration
- Accounting Module
- Multi Warehouse Management

---

Success Metrics

- 1.000+ UMKM aktif dalam tahun pertama.
- Retensi pengguna lebih dari 80%.
- Akurasi stok lebih dari 95%.
- Waktu transaksi kasir kurang dari 30 detik.
- Pengurangan kesalahan pencatatan manual hingga 90%.

ARHAT POS dirancang sebagai solusi modern yang membantu UMKM Indonesia mengelola bisnis secara digital melalui sistem kasir, inventaris, CRM, laporan bisnis, dan komunikasi pelanggan yang terintegrasi dalam satu platform cloud yang mudah digunakan dan dapat berkembang sesuai kebutuhan bisnis.
