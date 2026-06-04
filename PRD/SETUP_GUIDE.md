# ARHAT POS - Setup Guide

Panduan lengkap untuk setup development environment ARHAT POS.

## Prerequisites

Pastikan Anda sudah menginstall:

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (package manager)
- Docker & Docker Compose
- Git
- PostgreSQL CLI (psql)
- Visual Studio Code (recommended)

```bash
# Verify installations
node --version
pnpm --version
docker --version
git --version
psql --version
```

---

## Step 1: Initialize Project Structure

### 1.1 Create Root Directory & Initialize Git

```bash
# Create project directory
mkdir arhat-pos
cd arhat-pos

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Create initial directories
mkdir -p apps/{web,api} packages/{ui,types,eslint-config,typescript-config} docs tests
```

### 1.2 Setup pnpm Workspace

```bash
# Root package.json
cat > package.json << 'EOF'
{
  "name": "arhat-pos",
  "version": "1.0.0",
  "description": "Cloud-Based POS for UMKM",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  }
}
EOF

# pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

---

## Step 2: Setup Frontend (Next.js + React)

### 2.1 Initialize Next.js Application

```bash
cd apps/web

# Create Next.js app
pnpm create next-app@latest . --typescript --tailwind --eslint --git=false

# Or manual setup
pnpm init -y

# Install dependencies
pnpm add next@15 react@19 react-dom@19 typescript
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D typescript @types/node @types/react @types/react-dom

# Initialize Tailwind
pnpm exec tailwindcss init -p
```

### 2.2 Create Folder Structure for Frontend

```bash
cd apps/web/src

# Create folders structure
mkdir -p app/{auth,dashboard/\{pos,products,inventory,customers,reports,settings\}}
mkdir -p components/{auth,layouts,pos,inventory,customers,reports,common}
mkdir -p features/{auth,pos,inventory,customers,reports}
mkdir -p hooks
mkdir -p lib
mkdir -p store
mkdir -p types
mkdir -p constants
mkdir -p styles

# Create empty index files for organization
touch components/index.ts
touch hooks/index.ts
touch lib/index.ts
touch types/index.ts
```

### 2.3 Setup TypeScript Configuration

```bash
# Create tsconfig.json di apps/web
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skip": "all",
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
EOF
```

### 2.4 Setup Environment Variables

```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_NAME=ARHAT POS
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

# Create .env.example untuk repository
cat > .env.example << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_APP_NAME=ARHAT POS
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
```

### 2.5 Install Required Dependencies

```bash
# State Management & Data Fetching
pnpm add redux react-redux @reduxjs/toolkit
pnpm add @tanstack/react-query axios

# UI Components & Styling
pnpm add @headlessui/react @heroicons/react
pnpm add shadcn-ui lucide-react
pnpm add clsx class-variance-authority

# Forms & Validation
pnpm add react-hook-form zod @hookform/resolvers

# Charts
pnpm add recharts

# Utilities
pnpm add date-fns lodash-es
pnpm add zustand immer

# Dev dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom vitest
pnpm add -D @types/lodash-es
```

---

## Step 3: Setup Backend (Hono + Cloudflare Workers)

### 3.1 Initialize Hono Application

```bash
cd ../../apps/api

# Initialize with npm then convert to pnpm
pnpm init -y

# Install Hono & dependencies
pnpm add hono
pnpm add @supabase/supabase-js
pnpm add jsonwebtoken bcryptjs
pnpm add zod
pnpm add dotenv

# Dev dependencies
pnpm add -D @cloudflare/workers-types wrangler
pnpm add -D typescript @types/node vitest
pnpm add -D tsx
```

### 3.2 Create Folder Structure for Backend

```bash
mkdir -p src/{routes,controllers,services,repositories,models,middleware,lib,config,types,utils}
mkdir -p tests/{unit,integration}
mkdir -p migrations
```

### 3.3 Create Initial Backend Files

```bash
# Main entry point
cat > src/index.ts << 'EOF'
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/errorHandler';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// app.route('/api/auth', authRoutes);
// app.route('/api/products', productRoutes);
// ... more routes

// Error handling
app.onError(errorHandler);

export default app;
EOF
```

### 3.4 Setup wrangler.toml (Cloudflare Workers Config)

```bash
cat > wrangler.toml << 'EOF'
name = "arhat-pos-api"
type = "service-worker"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true
route = "api.arhat.local/*"
zone_id = "YOUR_ZONE_ID"

[env.development]
name = "arhat-pos-api-dev"
workers_dev = true

[[env.development.kv_namespaces]]
binding = "KV_CACHE"
id = "YOUR_KV_ID"

[env.staging]
name = "arhat-pos-api-staging"
routes = [
  { pattern = "staging-api.arhat.com/*", zone_id = "YOUR_ZONE_ID" }
]

[[env.staging.kv_namespaces]]
binding = "KV_CACHE"
id = "YOUR_STAGING_KV_ID"

[env.production]
name = "arhat-pos-api"
routes = [
  { pattern = "api.arhat.com/*", zone_id = "YOUR_ZONE_ID" }
]

[[env.production.kv_namespaces]]
binding = "KV_CACHE"
id = "YOUR_PROD_KV_ID"

[build]
command = "pnpm run build"
cwd = "apps/api"
main = "src/index.ts"
EOF
```

### 3.5 Setup TypeScript Configuration for Backend

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 3.6 Setup Environment Variables

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arhat_pos

# JWT
JWT_SECRET=your-secret-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Environment
NODE_ENV=development
EOF

cp .env.example .env.local
```

---

## Step 4: Setup Database (PostgreSQL + Supabase)

### 4.1 Setup Local PostgreSQL dengan Docker

```bash
cd /root

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: arhat_postgres
    environment:
      POSTGRES_USER: arhat_user
      POSTGRES_PASSWORD: arhat_password
      POSTGRES_DB: arhat_pos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - arhat-network

  redis:
    image: redis:7-alpine
    container_name: arhat_redis
    ports:
      - "6379:6379"
    networks:
      - arhat-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: arhat_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    networks:
      - arhat-network

volumes:
  postgres_data:

networks:
  arhat-network:
    driver: bridge
EOF

# Start services
docker-compose up -d

# Verify
docker-compose ps
```

### 4.2 Create Initial Database Schema

```bash
# Connect ke database
psql -U arhat_user -d arhat_pos -h localhost

# Create initial schema
psql -U arhat_user -d arhat_pos -h localhost << 'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indices
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO arhat_user;
EOF

# Verify schema
psql -U arhat_user -d arhat_pos -h localhost -c "\dt"
```

### 4.3 Setup Database Migrations Framework

```bash
cd apps/api

# Create migration helper script
mkdir -p scripts

cat > scripts/migrate.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function runMigrations() {
  const migrationDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const content = fs.readFileSync(path.join(migrationDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: content });
      if (error) {
        console.error(`Migration failed: ${file}`, error);
        process.exit(1);
      }
    }
  }

  console.log('All migrations completed');
}

runMigrations().catch(console.error);
EOF

# Add to package.json
cat >> package.json << 'EOF'
"scripts": {
  "migrate": "tsx scripts/migrate.ts"
}
EOF
```

---

## Step 5: Setup Development Tools

### 5.1 Setup ESLint & Prettier

```bash
cd /root

# Create shared ESLint config
cat > packages/eslint-config/.eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "@typescript-eslint/explicit-function-return-types": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
EOF

# Create root .eslintrc.json
cat > .eslintrc.json << 'EOF'
{
  "extends": ["packages/eslint-config"]
}
EOF

# Create .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "useTabs": false,
  "tabWidth": 2
}
EOF
```

### 5.2 Setup Husky untuk Pre-commit Hooks

```bash
# Install husky
pnpm add -D husky

# Initialize husky
pnpm exec husky install

# Add pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
EOF

# Add commit-msg hook untuk conventional commits
cat > .husky/commit-msg << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm commitlint --edit
EOF

# Setup lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{md,json}": ["prettier --write"]
}
EOF

chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### 5.3 Setup Turbo for Build Orchestration

```bash
# Create turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/json-schema.json",
  "globalDependencies": [".env.local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": false
    },
    "type-check": {
      "outputs": [],
      "cache": false
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
EOF
```

### 5.4 Setup GitHub Workflows

```bash
mkdir -p .github/workflows

# Create test workflow
cat > .github/workflows/test.yml << 'EOF'
name: Test

on:
  pull_request:
    branches: [develop, staging, main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
EOF
```

---

## Step 6: Run Development Servers

### 6.1 Start All Services

```bash
# Terminal 1: Database & Cache
docker-compose up

# Terminal 2: Root directory
cd /root
pnpm dev

# This will start:
# - Frontend: http://localhost:3000
# - API: http://localhost:8787
# - PgAdmin: http://localhost:5050
```

### 6.2 Verify Everything Works

```bash
# Check frontend
curl http://localhost:3000

# Check API health
curl http://localhost:8787/health

# Check database
psql -U arhat_user -d arhat_pos -h localhost -c "SELECT * FROM users;"

# Check Redis
redis-cli ping
```

---

## Step 7: Project Initialization Checklist

- [ ] Clone repository
- [ ] Install Node.js & pnpm
- [ ] Run `pnpm install`
- [ ] Setup environment variables (.env.local files)
- [ ] Start Docker services: `docker-compose up -d`
- [ ] Run database migrations: `pnpm migrate`
- [ ] Verify API health: `curl http://localhost:8787/health`
- [ ] Start dev servers: `pnpm dev`
- [ ] Access frontend: http://localhost:3000
- [ ] Setup IDE extensions:
  - ESLint
  - Prettier
  - Thunder Client (API testing)
  - PostgreSQL extension

---

## Useful Commands

```bash
# Development
pnpm dev              # Start all dev servers
pnpm build            # Build all apps
pnpm lint             # Lint all code
pnpm type-check       # Check TypeScript types
pnpm test             # Run all tests
pnpm format           # Format all code

# Database
docker-compose up -d          # Start services
docker-compose down           # Stop services
pnpm migrate                  # Run migrations
psql -U arhat_user -d arhat_pos -h localhost  # Connect to DB

# Git
git flow feature start feature-name
git flow feature finish feature-name
git push origin develop

# Turbo specific
turbo run build --filter=@arhat-pos/web
turbo run test --filter=@arhat-pos/api
turbo prune --scope=@arhat-pos/web
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :3000
kill -9 <PID>

# Or change port in development
PORT=3001 pnpm dev
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down
docker volume rm arhat-pos_postgres_data
docker-compose up -d
```

### pnpm Lock File Issues
```bash
# Clean install
rm pnpm-lock.yaml
pnpm install --frozen-lockfile
```

### TypeScript Errors
```bash
# Rebuild types
pnpm type-check --force

# Clear TypeScript cache
rm -rf apps/*/node_modules/.cache
```

---

## Next Steps

1. ✅ Complete project setup
2. ⏭️ Create Phase 1 branch: `git checkout -b develop && git checkout -b feature/phase-1-auth`
3. ⏭️ Start implementing authentication module (refer to PRD.md Phase 1)
4. ⏭️ Write unit tests for auth service
5. ⏭️ Create pull request untuk code review

---

**Last Updated:** June 2026  
**Maintained By:** ARHAT Team
