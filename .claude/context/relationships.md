# Component Relationships

> Last updated: 2025-12-22

## Database Entity Relationships

```
┌─────────────┐
│  products   │
└──────┬──────┘
       │ 1:N
       ▼
┌──────────────────┐       ┌─────────────┐
│  productPrices   │       │  resellers  │
└────────┬─────────┘       └──────┬──────┘
         │                        │
         │ N:1              1:N   │   1:N
         ▼                        ▼
┌─────────────────────────────────────────┐
│              licenseKeys                │
│  (productPriceId, resellerId, orderId)  │
└─────────────────────────────────────────┘
         ▲                        ▲
         │ N:1              N:1   │
         │                        │
┌────────┴─────────┐       ┌──────┴──────┐
│   orderItems     │       │    users    │
└────────┬─────────┘       └─────────────┘
         │ N:1                    │
         ▼                   N:1  │
┌─────────────┐                   │
│   orders    │◄──────────────────┘
└─────────────┘
```

## Foreign Key Map

| Table | Foreign Keys |
|-------|-------------|
| `productPrices` | `productId` → `products.id` |
| `users` | `resellerId` → `resellers.id` (nullable) |
| `orders` | `resellerId` → `resellers.id` |
| `orderItems` | `orderId` → `orders.id`, `productPriceId` → `productPrices.id` |
| `licenseKeys` | `productPriceId` → `productPrices.id`, `resellerId` → `resellers.id`, `orderId` → `orders.id` |
| `auditLogs` | `entityId` (polymorphic, no FK constraint) |

## Layer Dependencies

```
┌────────────────────────────────────────────────────────────────┐
│                         PRESENTATION                            │
│                                                                  │
│  app/(dashboard)/*         components/*         app/(auth)/*    │
│        │                        │                     │          │
│        └────────────┬───────────┴─────────────────────┘          │
│                     │                                            │
│                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SERVER ACTIONS                         │   │
│  │              use-cases/*-action.ts                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC                            │
│                                                                  │
│  use-cases/*-use-case.ts ──────► utilities/function-result.ts  │
│           │                                                      │
│           ├──────────────────────► lib/query-client.ts          │
│           │                                                      │
│           └──────────────────────► services/logger/logger.ts    │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS                              │
│                                                                  │
│  repositories/*-repo.ts ───────► repositories/drizzle/schema.ts│
│           │                                                      │
│           └────────────────────► repositories/drizzle/get-drizzle.ts
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                       PostgreSQL                                 │
└────────────────────────────────────────────────────────────────┘
```

## Module Import Graph

```
auth.ts
├── use-cases/auth/validate-credentials-use-case
├── services/logger/logger
└── utilities/roles

components/licenses/*
├── use-cases/license-keys/*-action
├── use-cases/products/*-action
├── use-cases/resellers/*-action
└── components/ui/*

use-cases/license-keys/*-use-case
├── repositories/license-keys/*-repo
├── utilities/function-result
├── lib/query-client
└── utilities/error

repositories/license-keys/*-repo
├── repositories/drizzle/get-drizzle
├── repositories/drizzle/schema
└── drizzle-orm
```

## Data Flow

### License Validation (External API)

```
External Client
     │
     ▼ POST /api/v1/license/validate { key, hwid }
┌────────────────────────────────┐
│ app/api/v1/license/validate/   │
│        route.ts                │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ validateLicenseUseCase()       │
│ - Check key exists             │
│ - Verify not expired           │
│ - Bind/verify HWID             │
│ - Generate JWT token           │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ getLicenseKeyByKeyRepo()       │
│ updateLicenseKeyRepo()         │
└────────────────────────────────┘
     │
     ▼
{ valid: true, token: "jwt...", expiresAt: "..." }
```

### Dashboard CRUD Flow

```
React Component (client)
     │
     ▼ useQuery / useMutation
┌────────────────────────────────┐
│ Server Action (*-action.ts)    │
│ - Sets up logger               │
│ - Calls use case               │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Use Case (*-use-case.ts)       │
│ - Business logic               │
│ - Caching via queryClient      │
│ - Returns { data, error }      │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Repository (*-repo.ts)         │
│ - Drizzle query                │
│ - Zod validation               │
└────────────────────────────────┘
     │
     ▼
PostgreSQL
```

## Shared State

| State | Location | Scope |
|-------|----------|-------|
| Auth session | JWT cookie | Per-user |
| React Query cache | `QueryClient` | Per-request (server) / Per-session (client) |
| DB connection | `getDrizzle()` singleton | Per-process |
| Logger | Created per-action | Per-request |

## External Integrations

| Integration | Purpose | Location |
|-------------|---------|----------|
| PostgreSQL | Primary database | `repositories/drizzle/get-drizzle.ts` |
| BTCPay Server | Payment processing | `orders` table (planned, btcpayInvoiceId) |
