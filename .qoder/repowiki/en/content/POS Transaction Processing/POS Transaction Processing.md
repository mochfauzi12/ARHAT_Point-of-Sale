# POS Transaction Processing

<cite>
**Referenced Files in This Document**
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [CheckoutSuccessModal.tsx](file://apps/web/src/components/pos/CheckoutSuccessModal.tsx)
- [HeldTransactionsModal.tsx](file://apps/web/src/components/pos/HeldTransactionsModal.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [CheckoutSuccessModal.tsx](file://apps/web/src/components/pos/CheckoutSuccessModal.tsx)
- [HeldTransactionsModal.tsx](file://apps/web/src/components/pos/HeldTransactionsModal.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)
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
10. [Appendices](#appendices)

## Introduction
This document describes the POS Transaction Processing system with emphasis on the checkout interface, product search, shopping cart, transaction management, payment processing integrations, receipt generation, transaction states, discounts, taxes, barcode scanning, inventory deduction, transaction history/reporting/reconciliation, and security/error handling. It synthesizes frontend components and backend services/controllers/routes to present a cohesive view of how transactions are created, processed, and finalized.

## Project Structure
The POS system comprises:
- Frontend (Next.js): checkout UI, cart store, product search, receipt templates, and barcode scanner hook.
- Backend (Cloudflare Workers + Drizzle ORM): transaction controller, service, routes, and models; inventory and product services; email and WhatsApp receipt delivery.

```mermaid
graph TB
subgraph "Web Frontend"
PS["ProductSearch.tsx"]
CP["CartPanel.tsx"]
CS["CheckoutSuccessModal.tsx"]
HT["HeldTransactionsModal.tsx"]
NCPM["NonCashPaymentModal.tsx"]
RT["ReceiptTemplate.tsx"]
CBS["useBarcodeScanner.ts"]
CART["useCartStore.ts"]
end
subgraph "API Backend"
TR["transaction.routes.ts"]
TC["transaction.controller.ts"]
TS["transaction.service.ts"]
TM["transaction.model.ts"]
INV["inventory.service.ts"]
PRD["product.service.ts"]
EMAIL["email.service.ts"]
WA["whatsapp.service.ts"]
end
PS --> CART
CP --> CART
CBS --> PS
CS --> RT
HT --> TR
NCPM --> TR
CART --> TR
TR --> TC
TC --> TS
TS --> INV
TS --> PRD
TS --> EMAIL
TS --> WA
TS --> TM
```

**Diagram sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [CheckoutSuccessModal.tsx](file://apps/web/src/components/pos/CheckoutSuccessModal.tsx)
- [HeldTransactionsModal.tsx](file://apps/web/src/components/pos/HeldTransactionsModal.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)

**Section sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [CheckoutSuccessModal.tsx](file://apps/web/src/components/pos/CheckoutSuccessModal.tsx)
- [HeldTransactionsModal.tsx](file://apps/web/src/components/pos/HeldTransactionsModal.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)

## Core Components
- Frontend Store and UI
  - Cart store manages items, quantities, totals, and selected payment method.
  - Product search enables barcode scanning and manual entry.
  - Cart panel displays line items, discounts, taxes, and totals.
  - Modals handle success confirmation, held transactions, and non-cash payment steps.
  - Receipt template renders printable receipts.
- Backend Services
  - Transaction controller exposes endpoints for creating, resuming, voiding, and refunding transactions.
  - Transaction service orchestrates payment processing, inventory deduction, and receipt generation.
  - Inventory and product services manage stock updates and product lookups.
  - Email and WhatsApp services deliver receipts via supported channels.

**Section sources**
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [CheckoutSuccessModal.tsx](file://apps/web/src/components/pos/CheckoutSuccessModal.tsx)
- [HeldTransactionsModal.tsx](file://apps/web/src/components/pos/HeldTransactionsModal.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)

## Architecture Overview
The checkout flow integrates frontend UI with backend APIs. The frontend collects items and payment preferences, submits a transaction creation request, and receives a response indicating success or pending status. The backend validates inventory, applies discounts and taxes, processes payments, and emits receipts via email or WhatsApp.

```mermaid
sequenceDiagram
participant U as "User"
participant UI as "CartPanel.tsx"
participant API as "transaction.controller.ts"
participant SVC as "transaction.service.ts"
participant INV as "inventory.service.ts"
participant PRD as "product.service.ts"
participant EMAIL as "email.service.ts"
participant WA as "whatsapp.service.ts"
U->>UI : Select items and payment method
UI->>API : POST /transactions/create
API->>SVC : createTransaction(payload)
SVC->>PRD : lookupProducts(items)
SVC->>INV : reserveOrDeductStock(items)
SVC->>SVC : applyDiscountsAndTaxes()
SVC->>SVC : processPayment(method)
SVC->>EMAIL : sendReceipt(email)
SVC->>WA : sendReceipt(phone)
SVC-->>API : transaction result
API-->>UI : {status, transactionId, receipt}
UI-->>U : Show success and receipt options
```

**Diagram sources**
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)

## Detailed Component Analysis

### Checkout Interface Design
- Product Search
  - Scans barcodes via device input and resolves product details.
  - Supports manual search and selection.
- Shopping Cart
  - Maintains item list, quantities, unit prices, totals, and applied discounts.
  - Allows editing quantities and removing items.
- Payment Selection
  - Enables choosing among cash, QRIS, bank transfer, debit card, credit card, and e-wallet.
  - Non-cash flows trigger additional modal steps for provider-specific actions.
- Transaction Submission
  - Validates cart, computes totals and taxes, and posts to backend.

```mermaid
flowchart TD
Start(["Open POS"]) --> Search["Scan or Search Product"]
Search --> AddItem["Add to Cart"]
AddItem --> ViewCart["View Cart Panel"]
ViewCart --> EditQty{"Edit Quantity?"}
EditQty --> |Yes| Adjust["Adjust Quantity"]
EditQty --> |No| ChoosePay["Choose Payment Method"]
ChoosePay --> Cash["Cash"]
ChoosePay --> QRIS["QRIS"]
ChoosePay --> Bank["Bank Transfer"]
ChoosePay --> Debit["Debit Card"]
ChoosePay --> Credit["Credit Card"]
ChoosePay --> Ewallet["E-Wallet"]
Cash --> Submit["Submit Transaction"]
QRIS --> Submit
Bank --> Submit
Debit --> Submit
Credit --> Submit
Ewallet --> Submit
Submit --> End(["Transaction Created"])
```

**Diagram sources**
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)

**Section sources**
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [CartPanel.tsx](file://apps/web/src/components/pos/CartPanel.tsx)
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)

### Transaction Management
- Endpoints
  - Create transaction: validates cart, reserves inventory, computes totals/taxes, and initiates payment.
  - Resume transaction: allows continuing a previously started but incomplete transaction.
  - Void transaction: cancels a paid transaction and restores inventory.
  - Refund transaction: processes refunds per payment method and updates inventory accordingly.
- State Model
  - New, Reserved (inventory held), Paid, Voided, Refunded.
  - Held transactions are persisted and retrievable for later completion.

```mermaid
stateDiagram-v2
[*] --> New
New --> Reserved : "Inventory reserved"
Reserved --> Paid : "Payment successful"
Reserved --> Voided : "Void initiated"
Paid --> Refunded : "Refund processed"
Voided --> [*]
Refunded --> [*]
```

**Diagram sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

**Section sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

### Payment Processing Integration
- Supported Methods
  - Cash, QRIS, Bank Transfer, Debit Card, Credit Card, E-Wallet.
- Non-Cash Workflows
  - Opens dedicated modal to guide user through provider steps (e.g., scan QRIS, enter card details).
  - On completion, the backend finalizes payment and marks transaction as Paid.
- Cash Handling
  - Collects amount tendered, computes change, and finalizes transaction.

```mermaid
sequenceDiagram
participant UI as "NonCashPaymentModal.tsx"
participant API as "transaction.controller.ts"
participant SVC as "transaction.service.ts"
UI->>API : POST /transactions/process-payment
API->>SVC : processPayment(method, details)
SVC->>SVC : validateProviderResponse()
SVC-->>API : {success, transactionId}
API-->>UI : {status, receipt}
```

**Diagram sources**
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

**Section sources**
- [NonCashPaymentModal.tsx](file://apps/web/src/components/pos/NonCashPaymentModal.tsx)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

### Receipt Generation and Delivery
- Receipt Template
  - Renders transaction details, items, discounts, taxes, totals, and timestamps.
- Delivery Channels
  - Email: sends receipt to customer email address.
  - WhatsApp: sends receipt to customer phone number.
- Print Option
  - Uses receipt template to generate printable output.

```mermaid
flowchart TD
T["Transaction Paid"] --> Render["Render ReceiptTemplate.tsx"]
Render --> Email["Send Email Receipt"]
Render --> WA["Send WhatsApp Receipt"]
Render --> Print["Print Receipt"]
Email --> Done(["Done"])
WA --> Done
Print --> Done
```

**Diagram sources**
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)

**Section sources**
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)

### Discounts and Taxes
- Item-Level Discounts
  - Per-item discount adjustments applied before tax calculation.
- Transaction-Level Discounts
  - Whole-cart percentage or fixed amount discounts applied after item discounts.
- Tax Automation
  - Applies applicable tax rates to taxable items and totals.
- Totals Recalculation
  - Recomputes subtotal, discount total, tax total, and final total.

```mermaid
flowchart TD
Start(["Compute Totals"]) --> Items["Apply item discounts"]
Items --> TxnDisc["Apply transaction discount"]
TxnDisc --> Tax["Apply tax rates"]
Tax --> Sum["Summarize totals"]
Sum --> End(["Final Amount"])
```

**Diagram sources**
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

**Section sources**
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

### Barcode Scanner Integration and Product Lookup
- Scanner Hook
  - Listens to device input events and triggers product search.
- Product Lookup
  - Resolves product by barcode or manual search, loads pricing and inventory info.
- Auto-Fill Cart
  - Adds matched product to cart with default quantity or scanned quantity.

```mermaid
sequenceDiagram
participant S as "useBarcodeScanner.ts"
participant PS as "ProductSearch.tsx"
participant PRD as "product.service.ts"
S->>PS : onScan(barcode)
PS->>PRD : getProductByBarcode(barcode)
PRD-->>PS : product details
PS->>PS : addToCart(product)
```

**Diagram sources**
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [product.service.ts](file://apps/api/src/services/product.service.ts)

**Section sources**
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)
- [ProductSearch.tsx](file://apps/web/src/components/pos/ProductSearch.tsx)
- [product.service.ts](file://apps/api/src/services/product.service.ts)

### Inventory Deduction During Transactions
- Reservation vs. Immediate Deduction
  - For cash: immediate stock deduction.
  - For non-cash: reserve inventory until payment confirmed; release on void/refund.
- Validation
  - Ensures sufficient stock exists before reservation/deduction.
- Rollback
  - On failure or void/refund, inventory is restored.

```mermaid
flowchart TD
Start(["Payment Confirmed"]) --> Deduct{"Cash?"}
Deduct --> |Yes| Immediate["Immediate Stock Deduction"]
Deduct --> |No| Reserve["Reserve Stock"]
Reserve --> Confirm["Confirm Payment"]
Confirm --> Release["Release Reservation"]
Immediate --> End(["End"])
Release --> End
```

**Diagram sources**
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)

**Section sources**
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)

### Transaction History, Reporting, and Reconciliation
- Transaction History
  - Backend maintains transaction records with state, items, totals, payment method, timestamps, and audit trail.
- Reporting
  - Analytics endpoints support daily sales, product performance, and revenue summaries.
- Reconciliation
  - Daily reconciliation compares cash drawer counts with recorded transactions and outstanding holds.

```mermaid
graph TB
TH["Transaction History"] --> AR["Analytics Reports"]
TH --> RC["Reconciliation"]
AR --> Dash["Dashboard Views"]
RC --> Cash["Cash Drawer Reconciliation"]
```

**Diagram sources**
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)

**Section sources**
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)

### Security, Audit Trails, and Error Handling
- Authentication and Authorization
  - Routes protected by middleware ensuring authenticated sessions.
- Audit Trail
  - Logs all transaction lifecycle events (created, reserved, paid, voided, refunded).
- Error Handling
  - Centralized error handler returns structured error responses.
  - Payment failures return actionable messages; partial failures attempt rollback.

```mermaid
flowchart TD
Req["Incoming Request"] --> Auth["Auth Middleware"]
Auth --> Route["Route Handler"]
Route --> Try["Execute Operation"]
Try --> Ok{"Success?"}
Ok --> |Yes| Resp["Return Success"]
Ok --> |No| Err["Log Error & Rollback"]
Err --> Resp
```

**Diagram sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

**Section sources**
- [transaction.routes.ts](file://apps/api/src/routes/transaction.routes.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)

## Dependency Analysis
- Frontend depends on:
  - Cart store for state management.
  - Product search and barcode scanner for item resolution.
  - Modals for payment and success confirmation.
  - Receipt template for rendering.
- Backend depends on:
  - Transaction controller for route exposure.
  - Transaction service for orchestration.
  - Inventory and product services for stock and product data.
  - Email and WhatsApp services for receipt delivery.
  - Models for database schema and relations.

```mermaid
graph LR
UI["Frontend UI"] --> STORE["useCartStore.ts"]
UI --> MODAL["Modals"]
UI --> RECV["ReceiptTemplate.tsx"]
STORE --> CTRL["transaction.controller.ts"]
MODAL --> CTRL
RECV --> CTRL
CTRL --> SVC["transaction.service.ts"]
SVC --> INV["inventory.service.ts"]
SVC --> PRD["product.service.ts"]
SVC --> EMAIL["email.service.ts"]
SVC --> WA["whatsapp.service.ts"]
SVC --> MODEL["transaction.model.ts"]
```

**Diagram sources**
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)

**Section sources**
- [useCartStore.ts](file://apps/web/src/store/useCartStore.ts)
- [transaction.controller.ts](file://apps/api/src/controllers/transaction.controller.ts)
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [inventory.service.ts](file://apps/api/src/services/inventory.service.ts)
- [product.service.ts](file://apps/api/src/services/product.service.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [transaction.model.ts](file://apps/api/src/models/index.ts)
- [ReceiptTemplate.tsx](file://apps/web/src/components/pos/ReceiptTemplate.tsx)

## Performance Considerations
- Minimize network requests by batching product lookups and reducing modal transitions.
- Cache frequently accessed product data in the cart store to reduce repeated backend calls.
- Use optimistic UI updates for item additions while deferring server-side validation to improve responsiveness.
- Optimize barcode scanning debounce to avoid duplicate scans and excessive lookups.

## Troubleshooting Guide
- Payment Failures
  - Verify payment method configuration and provider connectivity.
  - Check transaction state; if stuck in Reserved, reconcile inventory and retry.
- Inventory Discrepancies
  - Compare reserved vs. deducted stock; ensure rollback occurs on void/refund.
- Receipt Delivery Issues
  - Confirm email/WhatsApp credentials and templates; retry delivery if blocked.
- Barcode Scanning Problems
  - Ensure scanner hook is active and product exists in the catalog.

**Section sources**
- [transaction.service.ts](file://apps/api/src/services/transaction.service.ts)
- [email.service.ts](file://apps/api/src/services/email.service.ts)
- [whatsapp.service.ts](file://apps/api/src/services/whatsapp.service.ts)
- [useBarcodeScanner.ts](file://apps/web/src/hooks/useBarcodeScanner.ts)

## Conclusion
The POS Transaction Processing system integrates a responsive checkout UI with robust backend services to support diverse payment methods, automated discounts and taxes, inventory management, and multi-channel receipt delivery. Its modular design facilitates maintainability, scalability, and secure transaction lifecycle management.

## Appendices
- API Endpoints
  - POST /transactions/create: Create new transaction.
  - POST /transactions/resume/{id}: Resume held transaction.
  - POST /transactions/void/{id}: Void paid transaction.
  - POST /transactions/refund/{id}: Initiate refund.
  - POST /transactions/process-payment: Finalize non-cash payment.
- Data Model Notes
  - Transaction entity includes items, totals, taxes, discounts, payment method, state, timestamps, and audit fields.
- UI Components
  - ProductSearch, CartPanel, NonCashPaymentModal, CheckoutSuccessModal, HeldTransactionsModal, ReceiptTemplate.