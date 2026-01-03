# Create Use Case Skill

Creates use case files following the project's use case pattern.

**IMPORTANT:** Read `docs/implementation.md` before creating any use case. It contains critical rules and common mistakes to avoid.

## Usage

```
/create-use-case <action>-<entity>
```

Example: `/create-use-case get-license-key`

## What it creates

For a given use case (e.g., `get-license-key`), creates files in a **flat domain structure**:

```
use-cases/{domain}/
├── {action}-{entity}-query-key.ts   # Query cache key (for reads)
└── {action}-{entity}-use-case.ts    # Business logic with caching
```

**WRONG:** `use-cases/{domain}/{action}-{entity}/{action}-{entity}-use-case.ts`
**CORRECT:** `use-cases/{domain}/{action}-{entity}-use-case.ts`

## Instructions

1. **Ask for the use case name** if not provided (format: `action-entity`, e.g., `get-license-key`)
2. **Ask for the domain** (e.g., `license-keys`, `users`, `audit-logs`)
3. **Determine if read or write operation** - reads need query key files
4. **Check for existing use cases** in the domain that this use case should call

## Critical Rules

### Use Cases Call Use Cases, Not Repos

```typescript
// WRONG - calling repo directly
const license = await getLicenseKeyByKeyRepo({ key })

// CORRECT - call the use case
const result = await getLicenseKeyUseCase({ key, log })
```

The ONLY time a use case calls a repo is when it's the "owning" use case for that operation (e.g., `getLicenseKeyUseCase` calls `getLicenseKeyByKeyRepo`).

### Naming Must Include "UseCase" Suffix

```typescript
// WRONG
export const GetLicenseKeyArgsSchema = z.object({...})

// CORRECT
export const GetLicenseKeyUseCaseArgsSchema = z.object({...})
```

### Never Redefine Schemas - Import from Repo

```typescript
// WRONG - redefining schema in use case
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  // ... duplicating schema
})

// CORRECT - import from repo
import { selectUserSchema } from '@/repositories/users/user-schema'

// For joined results, import from the repo that creates them:
import { licenseKeyWithProductSchema } from '@/repositories/license-keys/get-license-key-by-key-repo'
```

## File Templates

### Query Key (`{action}-{entity}-query-key.ts`)

```typescript
export const {action}{Entity}QueryKey = ({param}: string) => ['{entity}', {param}]
```

### Read Use Case (`{action}-{entity}-use-case.ts`)

```typescript
import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { getQueryClient } from '@/lib/query-client'
import { {action}{Entity}Repo } from '@/repositories/{domain}/{action}-{entity}-repo'
import { {action}{Entity}QueryKey } from './{action}-{entity}-query-key'
import { captureError } from '@/utilities/error'

export const {Action}{Entity}UseCaseArgsSchema = z.object({
  {param}: z.string(),
  log: z.custom<Logger | undefined>(),
})

export const {Action}{Entity}UseCaseResultSchema = createResultSchema(
  {ResultSchema},
  z.object({ message: z.string() }).passthrough()
)

export type {Action}{Entity}UseCaseArgs = z.infer<typeof {Action}{Entity}UseCaseArgsSchema>
export type {Action}{Entity}UseCaseResult = ZodFunctionResult<typeof {Action}{Entity}UseCaseResultSchema>

export async function {action}{Entity}UseCase({
  {param},
  log,
}: {Action}{Entity}UseCaseArgs): Promise<{Action}{Entity}UseCaseResult> {
  const { success, error } = {Action}{Entity}UseCaseResultSchema

  try {
    log?.info({ {param} }, '{Action} {entity}')

    const queryClient = getQueryClient()
    const queryKey = {action}{Entity}QueryKey({param})

    const result = await queryClient.fetchQuery({
      queryKey,
      queryFn: () => {action}{Entity}Repo({ {param} }),
    })

    log?.info({ {param} }, 'Retrieved {entity}')
    return success(result)
  } catch (err) {
    log?.error({ err, {param} }, 'Error {action} {entity}')
    captureError(err)
    return error({ message: 'Failed to {action} {entity}' })
  }
}
```

### Write Use Case (`update-{entity}-use-case.ts`)

```typescript
import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { getQueryClient } from '@/lib/query-client'
import { update{Entity}Repo } from '@/repositories/{domain}/update-{entity}-repo'
import { select{Entity}Schema, {Entity}Update } from '@/repositories/{domain}/{entity}-schema'
import { get{Entity}QueryKey } from './get-{entity}-query-key'
import { captureError } from '@/utilities/error'

export const Update{Entity}UseCaseArgsSchema = z.object({
  {entityId}: z.string().uuid(),
  data: z.object({...}),
  log: z.custom<Logger | undefined>(),
})

export const Update{Entity}UseCaseResultSchema = createResultSchema(
  select{Entity}Schema,
  z.object({ message: z.string() }).passthrough()
)

export type Update{Entity}UseCaseArgs = z.infer<typeof Update{Entity}UseCaseArgsSchema>
export type Update{Entity}UseCaseResult = ZodFunctionResult<typeof Update{Entity}UseCaseResultSchema>

export async function update{Entity}UseCase({
  {entityId},
  data,
  log,
}: Update{Entity}UseCaseArgs): Promise<Update{Entity}UseCaseResult> {
  const { success, error } = Update{Entity}UseCaseResultSchema

  try {
    log?.info({ {entityId} }, 'Update {entity}')

    const result = await update{Entity}Repo({
      {entityId},
      data: data as {Entity}Update,
    })

    // Invalidate cache
    const queryClient = getQueryClient()
    queryClient.invalidateQueries({
      queryKey: get{Entity}QueryKey(result.{lookupKey}),
    })

    log?.info({ {entityId} }, 'Updated {entity}')
    return success(result)
  } catch (err) {
    log?.error({ err, {entityId} }, 'Error updating {entity}')
    captureError(err)
    return error({ message: 'Failed to update {entity}' })
  }
}
```

## Checklist Before Creating

- [ ] Is folder structure flat? (`use-cases/{domain}/` not `use-cases/{domain}/{action}/`)
- [ ] Does this use case need to call other use cases for data?
- [ ] For reads: created query key file?
- [ ] For writes: invalidating cache after mutation?
- [ ] Result schema imported from repo, not redefined locally?
- [ ] Schema names end with `UseCaseArgsSchema` and `UseCaseResultSchema`?
- [ ] Both `Args` and `Result` types exported?
- [ ] Function has explicit `Promise<...UseCaseResult>` return type?
- [ ] `captureError(err)` in catch block?

## Rules

- Use kebab-case for file names
- Flat folder structure by domain
- Use cases call use cases for all data access (not repos directly)
- Read use cases use `queryClient.fetchQuery()` for caching
- Write use cases call `queryClient.invalidateQueries()` after mutation
- Always include `captureError(err)` in catch blocks
- Pass `log` as a parameter to use cases
- No default exports
- Use-cases have NO auth logic - pure business logic only

See `docs/implementation.md` for complete patterns and common mistakes.
