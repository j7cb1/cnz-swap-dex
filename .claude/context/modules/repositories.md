# Repositories Module

> Last updated: 2025-12-22
> Path: `repositories/`

## Purpose

Data access layer using the Repository pattern with Drizzle ORM. Handles all database interactions, query construction, and data validation. Repositories are the only layer that imports the database connection.

## Key Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `repositories/drizzle/get-drizzle.ts` | DB singleton | `getDrizzle()` |
| `repositories/drizzle/schema.ts` | All table definitions | `products`, `resellers`, `users`, `licenseKeys`, etc. |
| `docs/project-pattern/repositories.md` | Pattern documentation | - |

## Database Schema

```typescript
// repositories/drizzle/schema.ts

// Enums
productStatusEnum: 'development' | 'undetected' | 'updating' | 'detected'
userRoleEnum: 'admin' | 'support' | 'member'
orderStatusEnum: 'pending' | 'paid' | 'expired'

// Tables
products        → id, name, status, config, deletedAt
productPrices   → id, productId, durationDays, price
resellers       → id, name, discountPercent, inviteCode, deletedAt
users           → id, email, name, passwordHash, resellerId, role
orders          → id, resellerId, btcpayInvoiceId, status, discountPercent, totalAmount, ...
orderItems      → id, orderId, productPriceId, quantity, unitPrice
licenseKeys     → id, key, productPriceId, resellerId, orderId, hwid, expiresAt, ...
auditLogs       → id, entityType, entityId, action, context, createdAt
```

## Structure Per Domain

```
repositories/{domain}/
├── {domain}-schema.ts           # Zod schemas from drizzle-zod
├── create-{entity}-repo.ts      # INSERT operations
├── get-{entity}-by-id-repo.ts   # Single record queries
├── get-all-{entities}-repo.ts   # List queries
├── update-{entity}-repo.ts      # UPDATE operations
└── soft-delete-{entity}-repo.ts # Soft delete (set deletedAt)
```

## Pattern Implementation

### Schema File (`*-schema.ts`)

```typescript
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { products } from '@/repositories/drizzle/schema'

export const selectProductSchema = createSelectSchema(products)
export const insertProductSchema = createInsertSchema(products)
export const updateProductSchema = insertProductSchema.omit({ id: true }).partial()

export type Product = z.infer<typeof selectProductSchema>
export type ProductInsert = z.infer<typeof insertProductSchema>
```

### Repository Function (`*-repo.ts`)

```typescript
import { getDrizzle } from '@/repositories/drizzle/get-drizzle'
import { products } from '@/repositories/drizzle/schema'
import { eq, isNull } from 'drizzle-orm'

export async function getAllProductsRepo() {
  const db = getDrizzle()

  return db
    .select()
    .from(products)
    .where(isNull(products.deletedAt))  // Exclude soft-deleted
}

export async function getProductByIdRepo(productId: string) {
  const db = getDrizzle()

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  return product ?? null
}
```

## Domains

| Domain | Files | Tables |
|--------|-------|--------|
| `drizzle/` | 2 | Connection + schema |
| `audit-logs/` | 4 | `auditLogs` |
| `license-keys/` | 8 | `licenseKeys` |
| `product-prices/` | 1 | `productPrices` |
| `products/` | 6 | `products` |
| `resellers/` | 7 | `resellers` |
| `users/` | 5 | `users` |

## Dependencies

- **Imports from**: `drizzle-orm`, `drizzle-zod`, `postgres`
- **Imported by**: `use-cases/*`
- **External**: PostgreSQL database

## Patterns Used

- **drizzle-zod**: Auto-generate Zod schemas from Drizzle tables
- **Soft delete**: All entities use `deletedAt` timestamp, never hard delete
- **Singleton connection**: `getDrizzle()` returns cached connection
- **Query builder**: Drizzle's type-safe SQL builder

## Key Rules

1. **Only repositories import `getDrizzle()`** - use cases call repositories
2. **Validate with Zod** - parse inputs and outputs
3. **No business logic** - pure data access only
4. **Filter soft-deleted** - always add `isNull(entity.deletedAt)` to queries
5. **No caching** - caching is handled at use-case layer

## Edge Cases / Gotchas

1. **Connection singleton**: `getDrizzle()` must be called inside function, not at module level
2. **Soft delete everywhere**: Check for `deletedAt` in all list queries
3. **UUID primary keys**: All IDs are UUIDs, not integers
4. **JSONB columns**: `config`, `hwid`, `context` are JSONB - handle carefully
5. **Drizzle vs Prisma**: This project uses Drizzle, not Prisma
