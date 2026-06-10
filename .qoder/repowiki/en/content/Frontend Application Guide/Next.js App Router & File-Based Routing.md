# Next.js App Router & File-Based Routing

<cite>
**Referenced Files in This Document**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/app/page.tsx](file://apps/web/src/app/page.tsx)
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/app/dashboard/page.tsx](file://apps/web/src/app/dashboard/page.tsx)
- [apps/web/src/app/pos/page.tsx](file://apps/web/src/app/pos/page.tsx)
- [apps/web/src/app/products/page.tsx](file://apps/web/src/app/products/page.tsx)
- [apps/web/src/app/customers/page.tsx](file://apps/web/src/app/customers/page.tsx)
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)
- [apps/web/src/app/inventory/page.tsx](file://apps/web/src/app/inventory/page.tsx)
- [apps/web/src/app/settings/page.tsx](file://apps/web/src/app/settings/page.tsx)
- [apps/web/src/app/transactions/page.tsx](file://apps/web/src/app/transactions/page.tsx)
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)
- [apps/web/src/lib/api.ts](file://apps/web/src/lib/api.ts)
- [apps/web/next.config.ts](file://apps/web/next.config.ts)
- [apps/web/package.json](file://apps/web/package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the Next.js App Router implementation in ARHAT POS, focusing on file-based routing, page structure, and route organization patterns. It covers the differences between pages and layouts, nested routing with grouping folders, the main application pages (dashboard, POS interface, product management, customer management, reports, settings, transactions), route parameters and dynamic routes, catch-all patterns, root layout configuration, metadata handling, global styles, route protection via middleware, redirects, custom error handling, and performance optimization strategies such as automatic code splitting and route-level caching.

## Project Structure
ARHAT POS uses Next.js App Router under apps/web/src/app. Routes are derived from the filesystem hierarchy. The root layout defines global metadata, fonts, viewport, and providers. Authentication middleware protects protected routes. Each main functional area resides under dedicated folders with a page.tsx entry.

```mermaid
graph TB
Root["apps/web/src/app"] --> Layout["layout.tsx<br/>Root Layout"]
Root --> Home["page.tsx<br/>Redirects to /login"]
Root --> Auth["auth/*<br/>Login/Register"]
Root --> Dashboard["dashboard/page.tsx"]
Root --> POS["pos/page.tsx"]
Root --> Products["products/page.tsx"]
Root --> Customers["customers/page.tsx"]
Root --> Reports["reports/page.tsx"]
Root --> Inventory["inventory/page.tsx"]
Root --> Settings["settings/page.tsx"]
Root --> Transactions["transactions/page.tsx"]
Layout --> Providers["AuthProvider<br/>PwaRegister"]
Layout --> Fonts["Geist Sans/Mono<br/>Google Fonts"]
```

**Diagram sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/app/page.tsx](file://apps/web/src/app/page.tsx)
- [apps/web/src/app/dashboard/page.tsx](file://apps/web/src/app/dashboard/page.tsx)
- [apps/web/src/app/pos/page.tsx](file://apps/web/src/app/pos/page.tsx)
- [apps/web/src/app/products/page.tsx](file://apps/web/src/app/products/page.tsx)
- [apps/web/src/app/customers/page.tsx](file://apps/web/src/app/customers/page.tsx)
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)
- [apps/web/src/app/inventory/page.tsx](file://apps/web/src/app/inventory/page.tsx)
- [apps/web/src/app/settings/page.tsx](file://apps/web/src/app/settings/page.tsx)
- [apps/web/src/app/transactions/page.tsx](file://apps/web/src/app/transactions/page.tsx)

**Section sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/app/page.tsx](file://apps/web/src/app/page.tsx)

## Core Components
- Root Layout: Defines metadata, viewport, fonts, global CSS, and providers.
- Middleware: Enforces authentication and redirects for protected areas.
- Page Components: Each route folder’s page.tsx renders the UI and orchestrates data fetching.
- Shared Layout: DashboardLayout wraps most pages to maintain consistent navigation and shell.
- Error Boundary: Centralized error handling for rendering fallbacks.

Key responsibilities:
- Root layout: global providers, metadata, fonts, viewport.
- Middleware: enforce auth, redirect unauthenticated users to login; redirect authenticated users away from login.
- Pages: render UI, manage loading/error states, integrate with API service layer.
- Shared layout: consistent header, sidebar, and container for admin-facing pages.

**Section sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)

## Architecture Overview
The routing follows Next.js conventions:
- Filesystem determines routes.
- Groups like (admin) and (dashboard) are supported by Next.js and used to organize routes without affecting URLs.
- Protected routes enforced by middleware.
- Shared layout composes page content.

```mermaid
graph TB
subgraph "Routing"
FS["Filesystem Routes"]
Groups["Groups (admin)/(dashboard)"]
Pages["page.tsx per Route"]
end
subgraph "Middleware"
MW["middleware.ts<br/>Auth Redirects"]
end
subgraph "UI"
RL["Root Layout<br/>layout.tsx"]
DL["DashboardLayout.tsx"]
EB["ErrorBoundary.tsx"]
end
FS --> Groups --> Pages
MW --> RL
RL --> DL
DL --> EB
```

**Diagram sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)

## Detailed Component Analysis

### Root Layout and Metadata
- Defines metadata (title, description, manifest, icons, Apple WebApp settings).
- Sets viewport configuration.
- Loads Google Fonts (Geist Sans and Geist Mono) and global CSS.
- Wraps children with AuthProvider and PWA registration component.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Next as "Next.js Runtime"
participant Layout as "Root Layout"
participant Provider as "AuthProvider"
participant PWA as "PwaRegister"
Browser->>Next : Request /
Next->>Layout : Render root layout
Layout->>Provider : Wrap children
Provider->>PWA : Register service worker
Layout-->>Browser : HTML with metadata/fonts/providers
```

**Diagram sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)

**Section sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)

### Home Redirect
- Redirects anonymous users visiting the root to the login page.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Next as "Next.js Runtime"
participant Home as "Home Page"
participant Redirect as "redirect('/login')"
Browser->>Next : GET /
Next->>Home : Load page.tsx
Home->>Redirect : Issue redirect
Redirect-->>Browser : 307 -> /login
```

**Diagram sources**
- [apps/web/src/app/page.tsx](file://apps/web/src/app/page.tsx)

**Section sources**
- [apps/web/src/app/page.tsx](file://apps/web/src/app/page.tsx)

### Authentication Middleware
- Protects routes under /pos, /dashboard, /inventory, and login.
- Redirects unauthenticated users to login.
- Redirects authenticated users away from login.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant MW as "middleware.ts"
participant Res as "NextResponse"
Browser->>MW : Request /pos/some-path
MW->>MW : Read cookie token
alt No token and not login
MW->>Res : Redirect to /login
else Token exists and requesting /login
MW->>Res : Redirect to /dashboard
else Authorized
MW->>Res : next()
end
```

**Diagram sources**
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)

**Section sources**
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)

### Dashboard
- Client component with data fetching for analytics.
- Uses DashboardLayout and ErrorBoundary.
- Renders charts and summary cards.

```mermaid
flowchart TD
Start(["Load Dashboard"]) --> Fetch["Fetch Analytics Data"]
Fetch --> Loaded{"Data Loaded?"}
Loaded --> |No| ShowFallback["Show Fallback/Error"]
Loaded --> |Yes| Render["Render Charts & Cards"]
Render --> End(["Done"])
ShowFallback --> End
```

**Diagram sources**
- [apps/web/src/app/dashboard/page.tsx](file://apps/web/src/app/dashboard/page.tsx)

**Section sources**
- [apps/web/src/app/dashboard/page.tsx](file://apps/web/src/app/dashboard/page.tsx)

### Point of Sale (POS)
- Manages shift lifecycle (open/close).
- Integrates product search/grid and cart panel.
- Conditional modals for shift actions.

```mermaid
sequenceDiagram
participant User as "User"
participant POS as "POS Page"
participant API as "API"
participant Shift as "ShiftModal"
User->>POS : Open POS
POS->>API : Get Current Shift
alt No active shift
POS->>Shift : Show Open Shift Modal
User->>Shift : Submit opening amount
Shift->>API : Open Shift
else Has active shift
POS->>POS : Render POS UI
end
```

**Diagram sources**
- [apps/web/src/app/pos/page.tsx](file://apps/web/src/app/pos/page.tsx)

**Section sources**
- [apps/web/src/app/pos/page.tsx](file://apps/web/src/app/pos/page.tsx)

### Products Management
- CRUD operations for products.
- Uses modal forms and BOM management.
- Integrates with API service layer.

```mermaid
flowchart TD
Init["Load Products"] --> List{"Has Products?"}
List --> |No| Empty["Show Empty State"]
List --> |Yes| Table["Render Product Table"]
Table --> Actions{"Action?"}
Actions --> |Add/Edit| Modal["Open Form Modal"]
Actions --> |Manage BOM| BomModal["Open BOM Modal"]
Actions --> |Delete| Confirm["Confirm Delete"]
Confirm --> Reload["Reload List"]
```

**Diagram sources**
- [apps/web/src/app/products/page.tsx](file://apps/web/src/app/products/page.tsx)

**Section sources**
- [apps/web/src/app/products/page.tsx](file://apps/web/src/app/products/page.tsx)

### Customers Management
- Full CRUD for customers.
- Search, tiering, notifications, and transaction history.
- Rich UI with modals for add/edit/history/notification.

```mermaid
sequenceDiagram
participant User as "User"
participant Cust as "Customers Page"
participant API as "API"
participant Hist as "History Modal"
participant Notify as "Notification Modal"
User->>Cust : Search customers
Cust->>API : Fetch customers with query
User->>Cust : Click History
Cust->>Hist : Open History Modal
Hist->>API : Fetch transactions
User->>Cust : Send Notification
Cust->>Notify : Open Notify Modal
Notify->>API : Send notification
```

**Diagram sources**
- [apps/web/src/app/customers/page.tsx](file://apps/web/src/app/customers/page.tsx)

**Section sources**
- [apps/web/src/app/customers/page.tsx](file://apps/web/src/app/customers/page.tsx)

### Reports
- Multi-tab analytics dashboard with charts and export.
- Parallel data fetching for sales, product, profit/loss, and customer analytics.

```mermaid
flowchart TD
Enter(["Open Reports"]) --> Tabs["Select Tab"]
Tabs --> Fetch["Parallel Fetch Analytics"]
Fetch --> Render["Render Charts/Table"]
Render --> Export{"Export?"}
Export --> |PDF| Done["Trigger Download"]
Export --> |Cancel| Render
```

**Diagram sources**
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)

**Section sources**
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)

### Inventory Management
- Multi-outlet stock monitoring, stock movements, adjustments, opname (audit), and transfers.
- Tabbed interface with separate components for each operation.

```mermaid
flowchart TD
Start(["Open Inventory"]) --> SelectOutlet["Select Outlet"]
SelectOutlet --> Tabs["Choose Tab"]
Tabs --> Monitoring["Monitoring"]
Tabs --> StockInOut["Stock In/Out"]
Tabs --> Adjustments["Adjustments"]
Tabs --> Opname["Opname"]
Tabs --> Transfers["Transfers"]
Monitoring --> End(["Done"])
StockInOut --> End
Adjustments --> End
Opname --> End
Transfers --> End
```

**Diagram sources**
- [apps/web/src/app/inventory/page.tsx](file://apps/web/src/app/inventory/page.tsx)

**Section sources**
- [apps/web/src/app/inventory/page.tsx](file://apps/web/src/app/inventory/page.tsx)

### Settings
- Store profile settings and user management.
- Role-based access control restricts user management to admin/owner.

```mermaid
flowchart TD
Enter(["Open Settings"]) --> Tabs["Select Tab"]
Tabs --> Profile["Profile Settings"]
Tabs --> Users["User Management"]
Users --> Access{"User Role?"}
Access --> |Admin/Owner| Manage["Allow Edit/Delete/Add"]
Access --> |Other| Deny["Show Access Denied"]
```

**Diagram sources**
- [apps/web/src/app/settings/page.tsx](file://apps/web/src/app/settings/page.tsx)

**Section sources**
- [apps/web/src/app/settings/page.tsx](file://apps/web/src/app/settings/page.tsx)

### Transactions
- View recent transactions, refund, void, and print receipts.

```mermaid
sequenceDiagram
participant User as "User"
participant Tx as "Transactions Page"
participant API as "API"
User->>Tx : Load page
Tx->>API : Fetch transactions
User->>Tx : Search by receipt
User->>Tx : Refund/Void/Print
Tx->>API : Perform action
API-->>Tx : Success/Failure
Tx-->>User : Updated list
```

**Diagram sources**
- [apps/web/src/app/transactions/page.tsx](file://apps/web/src/app/transactions/page.tsx)

**Section sources**
- [apps/web/src/app/transactions/page.tsx](file://apps/web/src/app/transactions/page.tsx)

### Shared Layout and Error Handling
- DashboardLayout provides consistent shell for admin pages.
- ErrorBoundary wraps page content to gracefully handle rendering errors.

```mermaid
classDiagram
class DashboardLayout {
+render(children)
}
class ErrorBoundary {
+render(fallback)
+componentDidCatch(error, errorInfo)
}
class DashboardPage
class POSPage
class ProductsPage
class CustomersPage
class ReportsPage
class InventoryPage
class SettingsPage
class TransactionsPage
DashboardPage --> DashboardLayout
POSPage --> DashboardLayout
ProductsPage --> DashboardLayout
CustomersPage --> DashboardLayout
ReportsPage --> DashboardLayout
InventoryPage --> DashboardLayout
SettingsPage --> DashboardLayout
TransactionsPage --> DashboardLayout
DashboardPage --> ErrorBoundary
POSPage --> ErrorBoundary
ProductsPage --> ErrorBoundary
CustomersPage --> ErrorBoundary
ReportsPage --> ErrorBoundary
InventoryPage --> ErrorBoundary
SettingsPage --> ErrorBoundary
TransactionsPage --> ErrorBoundary
```

**Diagram sources**
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)
- [apps/web/src/app/dashboard/page.tsx](file://apps/web/src/app/dashboard/page.tsx)
- [apps/web/src/app/pos/page.tsx](file://apps/web/src/app/pos/page.tsx)
- [apps/web/src/app/products/page.tsx](file://apps/web/src/app/products/page.tsx)
- [apps/web/src/app/customers/page.tsx](file://apps/web/src/app/customers/page.tsx)
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)
- [apps/web/src/app/inventory/page.tsx](file://apps/web/src/app/inventory/page.tsx)
- [apps/web/src/app/settings/page.tsx](file://apps/web/src/app/settings/page.tsx)
- [apps/web/src/app/transactions/page.tsx](file://apps/web/src/app/transactions/page.tsx)

**Section sources**
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)

## Dependency Analysis
- Root layout depends on:
  - Google Fonts for typography.
  - Global CSS for base styles.
  - Auth provider for session state.
  - PWA registration component.
- Middleware depends on cookies and NextResponse for redirects.
- Pages depend on shared layout and API service layer.
- API service layer abstracts HTTP calls to backend.

```mermaid
graph LR
Layout["layout.tsx"] --> Fonts["Geist Sans/Mono"]
Layout --> CSS["globals.css"]
Layout --> Auth["AuthProvider"]
Layout --> PWA["PwaRegister"]
MW["middleware.ts"] --> Cookies["Cookies"]
MW --> Redirects["NextResponse.redirect"]
Pages["Pages (dashboard/pos/products/...)"] --> DL["DashboardLayout"]
Pages --> EB["ErrorBoundary"]
Pages --> API["lib/api.ts"]
```

**Diagram sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/components/layout/DashboardLayout.tsx](file://apps/web/src/components/layout/DashboardLayout.tsx)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)
- [apps/web/src/lib/api.ts](file://apps/web/src/lib/api.ts)

**Section sources**
- [apps/web/src/app/layout.tsx](file://apps/web/src/app/layout.tsx)
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/lib/api.ts](file://apps/web/src/lib/api.ts)

## Performance Considerations
- Automatic code splitting: Next.js splits route bundles automatically; each page component is bundled independently, reducing initial payload.
- Route-level caching: Pages can leverage server-side or client-side caching strategies. For example, analytics dashboards can cache chart data for a short TTL to reduce repeated network requests.
- Image optimization: Remote image patterns are configured to allow specific hosts, enabling optimized image delivery.
- Client components: Pages marked as use client benefit from React 18 concurrent features and selective re-rendering.
- Parallel data fetching: Reports page demonstrates Promise.all for concurrent API calls, minimizing total loading time.

Recommendations:
- Implement route-level caching for read-heavy pages (e.g., reports, inventory monitoring).
- Use Suspense boundaries and React.lazy for heavy components if needed.
- Consider SWR or React Query for client-side caching and background refetching.

**Section sources**
- [apps/web/next.config.ts](file://apps/web/next.config.ts)
- [apps/web/src/app/reports/page.tsx](file://apps/web/src/app/reports/page.tsx)

## Troubleshooting Guide
Common issues and resolutions:
- Unauthorized access to protected routes:
  - Ensure middleware reads the token cookie and redirects accordingly.
  - Verify matcher configuration targets intended paths.
- Login loop:
  - If authenticated but redirected to login, confirm token presence and validity.
  - If unauthenticated but on login, ensure redirect to dashboard is triggered.
- Page crashes:
  - Wrap page content with ErrorBoundary to prevent full-route failures.
  - Check API responses and surface user-friendly messages.
- Redirect loops:
  - Validate middleware logic and ensure login/logout paths are handled distinctly.

**Section sources**
- [apps/web/src/middleware.ts](file://apps/web/src/middleware.ts)
- [apps/web/src/components/ErrorBoundary.tsx](file://apps/web/src/components/ErrorBoundary.tsx)

## Conclusion
ARHAT POS leverages Next.js App Router to deliver a structured, scalable frontend. File-based routing simplifies navigation and deployment. The root layout centralizes metadata and providers, while middleware enforces authentication. Shared layout and error boundary components promote consistency and resilience. Pages implement robust data fetching and UI patterns, and performance is enhanced through automatic code splitting and route-level caching strategies.