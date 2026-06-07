# ARHAT POS - Implementation Checklist & Quick Reference

Document ini adalah quick reference untuk tim development mengimplementasikan setiap phase ARHAT POS.

---

## Phase 1: Foundation & Authentication (Weeks 1-3)

### User Stories Progress

#### US1.1: User Registration
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 3 days

**Tasks:**
- [ ] Create registration form component (Frontend)
- [ ] Implement registration API endpoint (Backend)
- [ ] Add email validation
- [ ] Setup password hashing (bcryptjs)
- [ ] Create user database table migration
- [ ] Write unit tests for validation logic
- [ ] Setup email sending service
- [ ] Create error handling & user feedback

**Code Files to Create:**
```
Frontend:
- src/app/(auth)/register/page.tsx
- src/components/auth/RegisterForm.tsx
- src/features/auth/authSlice.ts
- src/lib/validators/registerValidator.ts

Backend:
- src/routes/auth.ts
- src/controllers/auth.controller.ts
- src/services/auth.service.ts
- src/repositories/user.repository.ts
```

**Testing Checklist:**
- [ ] Unit test: Password validation
- [ ] Unit test: Email format validation
- [ ] Unit test: Duplicate email handling
- [ ] Integration test: Registration flow
- [ ] Manual test: Form submission & error handling

**Review Checklist:**
- [ ] Code follows ESLint standards
- [ ] TypeScript strict mode compliant
- [ ] Test coverage > 80%
- [ ] API documentation updated
- [ ] Database migration tested

---

#### US1.2: Email Verification
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 3 days

**Tasks:**
- [ ] Generate verification tokens
- [ ] Create email template for verification
- [ ] Implement verification link handler
- [ ] Add token expiry logic (24 hours)
- [ ] Create resend verification email feature
- [ ] Add verification status tracking
- [ ] Write tests for token validation

**Code Files to Create:**
```
Backend:
- src/routes/auth.ts (verification endpoints)
- src/services/email.service.ts
- src/lib/jwt.ts (token utilities)
- migrations/002_add_email_verification.sql
```

**Testing:**
- [ ] Token generation & validation
- [ ] Token expiry handling
- [ ] Resend email functionality
- [ ] Database state management

---

#### US1.3: User Login
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 3 days

**Tasks:**
- [ ] Create login form component
- [ ] Implement login API with JWT
- [ ] Setup refresh token mechanism
- [ ] Implement rate limiting (max 5 attempts per 15 mins)
- [ ] Add remember me functionality
- [ ] Create session management
- [ ] Implement logout functionality
- [ ] Add error handling & user feedback

**Code Files to Create:**
```
Frontend:
- src/app/(auth)/login/page.tsx
- src/components/auth/LoginForm.tsx
- src/hooks/useAuth.ts
- src/lib/api/authApi.ts

Backend:
- src/middleware/auth.ts (JWT validation)
- src/lib/rateLimiter.ts
- src/config/jwt.ts
```

**Testing:**
- [ ] Valid credentials login
- [ ] Invalid credentials error
- [ ] Rate limiting functionality
- [ ] Token refresh mechanism
- [ ] Logout functionality

---

#### US1.4: Forgot Password
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 2 days

**Tasks:**
- [ ] Create forgot password form
- [ ] Generate reset tokens (1 hour expiry)
- [ ] Create password reset email template
- [ ] Implement reset password endpoint
- [ ] Add password reset validation
- [ ] Prevent reuse of old passwords
- [ ] Write comprehensive tests

**Code Files to Create:**
```
Frontend:
- src/app/(auth)/forgot-password/page.tsx
- src/app/(auth)/reset-password/page.tsx

Backend:
- src/services/password.service.ts
- migrations/003_add_password_reset_tokens.sql
```

---

#### US1.5: Role-Based Access Control
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 3 days

**Tasks:**
- [ ] Define 4 roles (Super Admin, Owner, Manager, Cashier)
- [ ] Create roles & permissions database tables
- [ ] Implement permission checking middleware
- [ ] Create role checking utilities
- [ ] Add audit logging for permission changes
- [ ] Document permission matrix
- [ ] Write tests for RBAC logic

**Code Files to Create:**
```
Backend:
- src/middleware/rbac.ts
- src/services/rbac.service.ts
- src/lib/permissions.ts (permission definitions)
- migrations/004_add_roles_permissions.sql

Documentation:
- docs/developer-guide/rbac.md
```

**Permission Matrix to Define:**
```
| Module | Super Admin | Owner | Manager | Cashier |
|--------|-------------|-------|---------|---------|
| Users | C/R/U/D | C/R/U | None | None |
| Products | C/R/U/D | C/R/U/D | R/U | R |
| Transactions | R | R | R | C/R |
| Inventory | R | R | U/D | None |
| Reports | R | R | R | None |
```

---

#### US1.6: User Management
**Status:** ⬜ Not Started  
**Assigned To:** [Name]  
**Estimated:** 3 days

**Tasks:**
- [ ] Create user management page
- [ ] Implement add user functionality
- [ ] Create bulk invite feature
- [ ] Implement edit user form
- [ ] Add role assignment UI
- [ ] Create user deactivation feature
- [ ] Implement audit logging
- [ ] Write tests

**Code Files to Create:**
```
Frontend:
- src/app/(dashboard)/users/page.tsx
- src/components/users/UserList.tsx
- src/components/users/UserForm.tsx
- src/components/users/BulkInvite.tsx

Backend:
- src/routes/users.ts
- src/controllers/users.controller.ts
- src/services/users.service.ts
- migrations/005_add_user_management.sql
```

---

### Phase 1 Database Migrations Checklist

**Migration Files to Create:**
- [ ] 001_initial_setup.sql (Users, Roles, Permissions tables)
- [ ] 002_email_verification.sql
- [ ] 003_password_reset_tokens.sql
- [ ] 004_roles_permissions.sql
- [ ] 005_audit_logs.sql

**Migration Verification:**
- [ ] All migrations execute successfully
- [ ] Rollback tested & working
- [ ] Indices created for performance
- [ ] Foreign keys properly defined

---

### Phase 1 Testing Summary

**Target Coverage:** > 85%

```
Testing Breakdown:
├── Unit Tests (60%)
│   ├── Password hashing & validation
│   ├── Email validation
│   ├── JWT token generation
│   ├── Permission checking
│   └── Password reset logic
│
├── Integration Tests (20%)
│   ├── Complete registration flow
│   ├── Login & token refresh
│   ├── Email verification flow
│   └── User management workflow
│
└── E2E Tests (5%)
    ├── New user registration
    └── Login & access protected pages
```

**Test Files to Create:**
```
tests/
├── unit/
│   ├── auth.service.test.ts
│   ├── password.service.test.ts
│   ├── rbac.service.test.ts
│   └── validators.test.ts
│
├── integration/
│   ├── auth.integration.test.ts
│   ├── user-management.integration.test.ts
│   └── email.integration.test.ts
│
└── e2e/
    ├── auth.e2e.test.ts
    └── user-management.e2e.test.ts
```

---

### Phase 1 Definition of Done Checklist

**All items must be completed before moving to Phase 2:**

- [ ] All 6 user stories completed & tested
- [ ] Unit test coverage > 85%
- [ ] Integration tests passing
- [ ] API endpoints documented (Swagger)
- [ ] Database migrations tested & reversible
- [ ] Code review approved (2 engineers minimum)
- [ ] Security audit completed:
  - [ ] Password hashing implemented correctly
  - [ ] No SQL injection vulnerabilities
  - [ ] CORS properly configured
  - [ ] Rate limiting working
  - [ ] JWT secrets not exposed
- [ ] API response time < 300ms (load test 50 concurrent users)
- [ ] Frontend & backend deployed to staging
- [ ] Manual QA testing passed
- [ ] Documentation complete:
  - [ ] API documentation (Swagger)
  - [ ] Database schema documented
  - [ ] Setup guide updated
  - [ ] Coding standards documented
- [ ] Stakeholder sign-off

---

## Phase 2: POS & Basic Sales (Weeks 4-6)

### User Stories Overview

**US2.1 - US2.9 Summary:**

| US | Title | Days | Status |
|----|-------|------|--------|
| 2.1 | Product Search & Selection | 2 | ⬜ |
| 2.2 | Barcode Scanner | 3 | ⬜ |
| 2.3 | Shopping Cart | 2 | ⬜ |
| 2.4 | Discount Management | 3 | ⬜ |
| 2.5 | Tax Calculation | 2 | ⬜ |
| 2.6 | Payment Processing | 3 | ⬜ |
| 2.7 | Transaction Hold & Resume | 2 | ⬜ |
| 2.8 | Refund & Void | 2 | ⬜ |
| 2.9 | Digital Receipt | 2 | ⬜ |

### Key Implementation Files

**Frontend:**
```
src/app/(dashboard)/pos/page.tsx
src/components/pos/
├── ProductSearch.tsx
├── ShoppingCart.tsx
├── DiscountSection.tsx
├── PaymentMethods.tsx
├── ReceiptPreview.tsx
└── CartSummary.tsx

src/features/pos/
├── posSlice.ts
├── usePOS.ts
└── posApi.ts
```

**Backend:**
```
src/routes/transactions.ts
src/controllers/transactions.controller.ts
src/services/pos.service.ts
src/repositories/transaction.repository.ts
```

---

## Phase 3: Inventory Management (Weeks 7-9)

### User Stories Overview

| US | Title | Status |
|----|-------|--------|
| 3.1 | Stock In | ⬜ |
| 3.2 | Stock Out | ⬜ |
| 3.3 | Stock Adjustment | ⬜ |
| 3.4 | Low Stock Alert | ⬜ |
| 3.5 | Stock Opname | ⬜ |
| 3.6 | Stock Transfer | ⬜ |
| 3.7 | Inventory History | ⬜ |
| 3.8 | Expired Product Alert | ⬜ |

### Critical Features

**Priority 1 (Weeks 1-2):**
- Stock In & Stock Out
- Stock Adjustment
- Real-time inventory tracking

**Priority 2 (Weeks 2-3):**
- Low stock alerts
- Stock Opname
- Inventory history & reporting

---

## Phase 4: Customer Management & CRM (Weeks 10-11)

### User Stories Overview

| US | Title | Status |
|----|-------|--------|
| 4.1 | Customer Registration | ⬜ |
| 4.2 | Customer Database | ⬜ |
| 4.3 | Purchase History | ⬜ |
| 4.4 | Customer Segmentation | ⬜ |
| 4.5 | Loyalty Program | ⬜ |
| 4.6 | Customer Notes | ⬜ |

### Loyalty Program Specifications

```
Calculation:
- 1 point = Rp 1.000 spent
- Points expire after 1 year of inactivity

Redemption:
- 100 points = Rp 100.000 discount
- Minimum 10 points for redemption

Tiers:
┌─────────────┬──────────────┬─────────────┐
│ Tier        │ Requirements │ Benefits    │
├─────────────┼──────────────┼─────────────┤
│ Silver      │ < 1M spent   │ 1% bonus    │
│ Gold        │ 1-10M spent  │ 2% bonus    │
│ Platinum    │ > 10M spent  │ 3% bonus    │
└─────────────┴──────────────┴─────────────┘
```

---

## Phase 5: Reporting & Analytics (Weeks 13-14)

### US5.1 Sales Dashboard
- [x] Revenue overview
- [x] Sales trendsales summary
- [x] Weekly comparison
- [x] Monthly P&L
- [x] Sales by category
- [x] Sales by payment method

**Product Reports:**
- [x] Best sellers (top 10)
- [x] Slow movers
- [x] Inventory value
- [x] Stock turnover
- [x] CSV export
- [x] Scheduled reports
- [x] Email delivery

### US5.4 Customer Analytics
- [x] Top customers
- [x] Acquisition metricsate
- [x] Repeat rate
- [x] Customer value
- [x] Churn analysis

### US5.3 Profit & Loss
- [x] Revenue calculation
- [x] COGS deduction checks

---

## Phase 6: Advanced Features (Weeks 15-16)

### Features to Implement

- [ ] WhatsApp receipt integration
- [ ] Customer notifications
- [ ] Performance optimization
- [ ] UI/UX polish
- [ ] Documentation finalization

---

## Development Workflow Guide

### Starting a New Feature

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# 2. Create feature directory
mkdir -p src/features/feature-name

# 3. Implement feature
# - Write tests first (TDD approach)
# - Implement feature code
# - Ensure tests pass

# 4. Verify code quality
pnpm lint
pnpm type-check
pnpm test

# 5. Commit with conventional commit message
git add .
git commit -m "feat(feature-name): description of changes"

# 6. Push & create PR
git push origin feature/feature-name
# Create Pull Request on GitHub

# 7. Code Review & Merge
# - Address review comments
# - Merge to develop after approval
```

### Code Review Feedback Loop

```
Developer creates PR
    ↓
Reviewer 1 reviews (24 hours)
    ↓
Changes requested? → Developer makes changes
    ↓
Reviewer 2 reviews (24 hours)
    ↓
Approved? → Merge to develop
    ↓
Automated tests run in CI/CD
    ↓
Deploy to staging
```

---

## Testing Checklist Template

Use this template untuk setiap feature implementation:

```markdown
## Testing for [Feature Name]

### Unit Tests
- [x] Profit margin
- [x] Trend analysis
- [x] PDF export case handling
- [x] Error scenarios
- [x] Target coverage: XX%

### Integration Tests
- [x] API integration with database
- [x] External service integration
- [x] State management

### Manual Testing
- [x] Happy path flow
- [x] Error handling
- [x] Edge cases
- [x] Browser compatibility
- [x] Responsive design
- [x] Performance (< 2s load time)

### Accessibility
- [x] Keyboard navigation
- [x] Screen reader compatibility
- [x] Color contrast
- [x] ARIA labels
- [x] Category performance
- [x] Inventory turnover

### Security
- [x] Input validation
- [x] Authorization checks
- [x] SQL injection prevention
- [x] XSS prevention
```

---

## Performance Benchmarks

Monitor setiap phase untuk ensure performance targets:

```
Frontend:
- Page load time: < 2 seconds
- Lighthouse score: > 85
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

Backend:
- API response time: < 300ms (p99)
- Database query time: < 100ms
- Throughput: > 1000 req/sec
- Error rate: < 0.1%

Database:
- Query execution: < 100ms
- Connection pool: 20-50 connections
- Storage efficiency: Proper indexing
```

---

## Security Checklist

**Must implement untuk every feature:**

- [ ] Input validation (zod/joi)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection
- [ ] Rate limiting (if public endpoint)
- [ ] Authentication check
- [ ] Authorization verification
- [ ] Error messages tidak expose sensitive info
- [ ] Logging sensitive operations
- [ ] No hardcoded secrets/credentials

**Regular audits:**
- [ ] Weekly security code review
- [ ] Monthly dependency audit
- [ ] Quarterly penetration testing

---

## Git & Deployment Workflow

### Branch Strategy

```
main (production)
  ├── hotfix/bug-name
  └── release/v1.1.0
      └── staging (pre-production)
          ├── feature/auth-login
          ├── feature/pos-barcode
          ├── feature/inventory-stock
          └── bugfix/payment-timeout
            └── develop (integration)
```

### Deployment Pipeline

```
Feature Branch
    ↓
PR → Code Review
    ↓
Merge to develop
    ↓
Run automated tests & build
    ↓
Deploy to staging
    ↓
Manual testing & approval
    ↓
Merge to main
    ↓
Deploy to production
    ↓
Monitor & rollback if needed
```

---

## Weekly Progress Tracking

### Sprint Planning Template

```markdown
## Sprint [N] Planning
**Duration:** [Start Date] - [End Date]

### Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

### User Stories
- [ ] US-1.1: User Registration (3 days)
- [ ] US-1.2: Email Verification (3 days)
- [ ] ...

### Team Capacity
- Developer 1: 50 hours
- Developer 2: 50 hours
- QA: 20 hours

### Risk Assessment
1. Risk A → Mitigation: ...
2. Risk B → Mitigation: ...
```

### Daily Standup Template

```markdown
## Daily Standup - [Date]

### Developer 1
- ✅ Completed: US-1.1 implementation
- 🔄 In Progress: Unit tests for validation
- 🚧 Blocked: Waiting for API design approval
- ⏭️ Next: Integration tests

### Developer 2
- ✅ Completed: ...
- ...
```

### Sprint Review Template

```markdown
## Sprint [N] Review - [Date]

### Completed
- [x] US-1.1: User Registration
- [x] US-1.2: Email Verification
- [ ] US-1.3: User Login (70% done)

### Metrics
- Velocity: XX story points
- Test coverage: XX%
- Bugs found: X (X critical)
- Deployment success: 100%

### Lessons Learned
1. What went well?
2. What could be better?
3. Action items for next sprint
```

---

## Documentation Structure

**Create documentation untuk setiap feature:**

```
docs/
├── user-guide/
│   ├── getting-started.md
│   ├── auth/
│   │   ├── login.md
│   │   ├── registration.md
│   │   └── password-reset.md
│   ├── pos/
│   │   ├── transaction.md
│   │   ├── payment.md
│   │   └── receipt.md
│   └── ...
│
├── developer-guide/
│   ├── setup.md
│   ├── architecture.md
│   ├── auth-module.md
│   ├── pos-module.md
│   ├── testing.md
│   └── deployment.md
│
└── api-docs/
    └── openapi.yaml
```

---

## Useful Commands Reference

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev --filter=web # Start only frontend

# Testing
pnpm test             # Run all tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # Generate coverage report

# Linting & Formatting
pnpm lint            # Run ESLint
pnpm format          # Format with Prettier
pnpm type-check      # Check TypeScript types

# Database
docker-compose up -d              # Start services
docker-compose ps                 # Check status
pnpm migrate                      # Run migrations
psql -U arhat_user -d arhat_pos   # Connect to DB

# Git
git checkout -b feature/name      # Create feature branch
git add .                         # Stage changes
git commit -m "commit message"    # Commit changes
git push origin feature/name      # Push to remote
git pull origin develop           # Pull latest develop

# Deployment
pnpm build            # Build production
npm run deploy-staging  # Deploy to staging
npm run deploy-prod     # Deploy to production
```

---

## Contact & Support

**Questions? Issues? Contact:**

- **Tech Lead:** [Email/Slack]
- **Product Manager:** [Email/Slack]
- **DevOps:** [Email/Slack]

**Resources:**
- [GitHub Repository](https://github.com/arhat-team/arhat-pos)
- [Notion Board](https://notion.com/arhat-pos)
- [Design System](https://figma.com/arhat-design)
- [API Docs](https://api-docs.arhat.com)

---

**Last Updated:** June 2026  
**Document Version:** 1.0  
**Maintained By:** ARHAT Development Team
