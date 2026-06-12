# ARHAT POS 🛒

<div align="center">
  <p><strong>Cloud-Based Point of Sale & Business Management Platform for MSMEs</strong></p>
</div>

## 📖 Overview

ARHAT POS is a modern, cloud-based Point of Sale (POS) application designed specifically to help Micro, Small, and Medium Enterprises (MSMEs) manage their business operations efficiently. This platform combines a digital cashier system, inventory management, Customer Relationship Management (CRM), and business analytics within a single, integrated ecosystem (Monorepo).

## ✨ Key Features

- **Point of Sale (POS)**: Fast and seamless transactions with a modern interface, multi-payment support (Cash, QRIS, Card), and automatic tax calculation.
- **Inventory Management**: Real-time stock tracking, low stock alerts, and detailed goods movement history.
- **Dashboard & Analytics**: Monitor daily sales, profit/loss margins, and best-selling products interactively.
- **CRM & Loyalty**: Centralized customer database with built-in loyalty and reward points support.
- **Multi-Outlet Support**: Manage multiple business branches seamlessly from a single admin dashboard.
- **Digital Receipts**: Send eco-friendly receipts directly via Email or WhatsApp.

## 🛠️ Tech Stack

This project is built using a **Turborepo** (Monorepo) architecture to separate the frontend, backend, and shared packages efficiently.

**Frontend:**
- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)

**Backend & Infrastructure:**
- [Hono](https://hono.dev/) (Cloudflare Workers)
- [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- TypeScript & Docker

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed on your local environment:
- [Node.js](https://nodejs.org/) (v18.0.0 or newer)
- [pnpm](https://pnpm.io/) (v8.0.0 or newer)

### Installation & Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/arhat-pos.git
   cd arhat-pos
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file (or copy from `.env.example`) and fill in the required credentials (e.g., Supabase URL, Anon Key).

4. **Run the Development Server**
   ```bash
   pnpm run dev
   ```
   The application will start and can be accessed at `http://localhost:3000`.

## 📁 Project Structure (Monorepo)

This project utilizes a [Turborepo](https://turbo.build/repo) based architecture.

```text
arhat-pos/
├── apps/
│   ├── web/             # Next.js Frontend app (Web Dashboard & POS)
│   └── api/             # Hono / Supabase backend functions
├── packages/
│   ├── ui/              # Shared UI components (Shadcn)
│   ├── config/          # Shared ESLint, Prettier, and TypeScript configs
│   └── utils/           # Shared utility functions
├── PRD/                 # Product Documentation (PRD, Guides, etc.)
└── package.json
```

## 📜 Basic Commands

From the root directory, you can run the following scripts:

- `pnpm run dev`: Starts all applications in development mode.
- `pnpm run build`: Builds all apps and packages for production.
- `pnpm run lint`: Checks for linting issues across the codebase.
- `pnpm run format`: Formats code using Prettier.

## 📚 Comprehensive Documentation

For detailed information regarding the architecture, product vision, and development roadmap, please refer to the `PRD/` folder:
- 📄 [Product Requirement Document (PRD)](./PRD/PRD.md)
- ⚙️ [Setup Guide](./PRD/SETUP_GUIDE.md)
- 🎨 [UI/UX Guidelines](./PRD/PRD_UI&UX.md)

## 📄 License
Copyright &copy; 2026 ARHAT POS. All rights reserved.
