# Use Cases Module

> Last updated: 2025-12-22
> Path: `use-cases/`

## Purpose

Business logic layer implementing Clean Architecture. Each use case encapsulates a single business operation with caching, logging, and consistent error handling. Decouples presentation from data access.

## Key Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `utilities/function-result.ts` | Result type pattern | `FunctionResult`, `success()`, `err()`, `createResultSchema()` |
| `lib/query-client.ts` | Server-side cache | `getQueryClient()` |
| `docs/project-pattern/use-cases.md` | Pattern documentation | - |

## Structure Per Domain

Each use case consists of 3-4 files:

```
use-cases/{domain}/
├── get-{entity}-query-key.ts    # TanStack Query cache key
├── get-{entity}-use-case.ts     # Business logic
├── get-{entity}-action.ts       # Server action wrapper
└── (optional) use-{entity}.ts   # Client-side React Query hook
```

## Pattern Implementation

### 1. Query Key (`*-query-key.ts`)

```typescript
// Simple, deterministic keys for cache management
export const getLicenseQueryKey = (licenseId: string) => ['license', licenseId]
export const getLicensesQueryKey = () => ['licenses']
```

### 2. Use Case (`*-use-case.ts`)

```typescript
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'

// Define schemas
export const GetEntityUseCaseArgsSchema = z.object({
  entityId: z.string().uuid(),
  log: z.custom<Logger | undefined>(),
})

export const GetEntityUseCaseResultSchema = createResultSchema(
  selectEntitySchema,
  z.object({ message: z.string() }).passthrough()
)

// Export types
export type GetEntityUseCaseArgs = z.infer<typeof GetEntityUseCaseArgsSchema>
export type GetEntityUseCaseResult = ZodFunctionResult<typeof GetEntityUseCaseResultSchema>

// Implementation
export async function getEntityUseCase({
  entityId,
  log,
}: GetEntityUseCaseArgs): Promise<GetEntityUseCaseResult> {
  const { success, error } = GetEntityUseCaseResultSchema

  try {
    log?.info({ entityId }, 'Getting entity')

    const queryClient = getQueryClient()
    const entity = await queryClient.fetchQuery({
      queryKey: getEntityQueryKey(entityId),
      queryFn: () => getEntityRepo(entityId),
    })

    return success(entity)
  } catch (err) {
    log?.error({ err, entityId }, 'Error getting entity')
    captureError(err)
    return error({ message: 'Failed to get entity' })
  }
}
```

### 3. Server Action (`*-action.ts`)

```typescript
'use server'

import { getLogger, LoggerModule } from '@/services/logger/logger'

export async function getEntityAction(entityId: string) {
  const log = getLogger({ module: LoggerModule.Entity })
  return getEntityUseCase({ entityId, log })
}
```

## Domains

| Domain | Files | Purpose |
|--------|-------|---------|
| `audit-logs/` | 6 files | Audit log queries and creation |
| `auth/` | 1 file | Credential validation |
| `license-keys/` | 15 files | License CRUD, validation, HWID |
| `product-prices/` | 1 file | Price tier queries |
| `products/` | 11 files | Product CRUD |
| `resellers/` | 12 files | Reseller CRUD |
| `users/` | 10 files | User management, signup |

## Dependencies

- **Imports from**: `repositories/*`, `utilities/function-result`, `lib/query-client`
- **Imported by**: `components/*`, `app/api/*`

## Patterns Used

- **FunctionResult**: Discriminated union for success/error - see `utilities/function-result.ts`
- **Server-side caching**: TanStack Query on server via `getQueryClient()`
- **Request deduplication**: Multiple calls with same query key = 1 DB query
- **Structured logging**: Pino logger passed through all layers
- **Zod validation**: Runtime type checking on inputs and outputs

## Key Rules

1. **Each use case fetches its own dependencies** - never pass fetched data as parameters
2. **Use `Promise.all`** for parallel data fetching
3. **Always return `{ data, error }`** - never throw from use cases
4. **Log at start and completion** of operations
5. **Include `captureError(err)`** in catch blocks

## Edge Cases / Gotchas

1. **Logger is optional**: Use `log?.info()` pattern since log may be undefined
2. **Actions set up logging**: Use cases receive logger, actions create it
3. **Query keys must be stable**: Same inputs = same cache key
4. **Server-only**: Use cases run on server, not in browser
