# Create Repository Skill

Creates repository files following the project's repository pattern.

**IMPORTANT:** Read `docs/implementation.md` before creating any repository. It contains critical rules and common mistakes to avoid.

## Usage

```
/create-repository <entity-name>
```

## What it creates

For a given entity (e.g., `license-key`), creates:

```
repositories/{entity}/
├── {entity}-schema.ts           # Zod schemas from Drizzle (REQUIRED)
└── {action}-{entity}-repo.ts    # Repository function(s)
```

## Instructions

1. **Ask for entity name** if not provided
2. **Ask for the Drizzle table import path** (e.g., `@/repositories/drizzle/schema`)
3. **Ask what repository operations are needed** (get, create, update, delete)

## Critical Rules

### Every Entity MUST Have a Schema File

```typescript
// repositories/license-keys/license-key-schema.ts
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { licenseKeys } from '@/repositories/drizzle/schema'
import { z } from 'zod'

export const selectLicenseKeySchema = createSelectSchema(licenseKeys)
export const insertLicenseKeySchema = createInsertSchema(licenseKeys)

export const updateLicenseKeySchema = insertLicenseKeySchema
  .omit({ id: true })
  .partial()

export type LicenseKey = z.infer<typeof selectLicenseKeySchema>
export type LicenseKeyInsert = z.infer<typeof insertLicenseKeySchema>
export type LicenseKeyUpdate = z.infer<typeof updateLicenseKeySchema>
```

### Repos Use Object Args Pattern

```typescript
// WRONG - positional arguments
export async function updateLicenseKeyRepo(licenseKeyId: string, data: LicenseKeyUpdate)

// CORRECT - object argument
export async function updateLicenseKeyRepo(args: {
  licenseKeyId: string
  data: LicenseKeyUpdate
})
```

### Repos Validate Input AND Output

```typescript
// CORRECT - validates both
const argsSchema = z.object({
  email: z.string().email(),
})

export async function getUserByEmailRepo(args: { email: string }) {
  const { email } = argsSchema.parse(args)  // Validate input

  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))

  if (!result) return null

  return selectUserSchema.parse(result)  // Validate output
}
```

## File Templates

### Schema File (`{entity}-schema.ts`) - REQUIRED

```typescript
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { {tableName} } from '@/repositories/drizzle/schema'
import { z } from 'zod'

export const select{Entity}Schema = createSelectSchema({tableName})
export const insert{Entity}Schema = createInsertSchema({tableName})

export const update{Entity}Schema = insert{Entity}Schema
  .omit({ id: true, createdAt: true })
  .partial()

export type {Entity} = z.infer<typeof select{Entity}Schema>
export type {Entity}Insert = z.infer<typeof insert{Entity}Schema>
export type {Entity}Update = z.infer<typeof update{Entity}Schema>
```

### Get Repository (`get-{entity}-repo.ts`)

```typescript
import { db } from '@/repositories/drizzle/get-drizzle'
import { {tableName} } from '@/repositories/drizzle/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { select{Entity}Schema } from './{entity}-schema'

const argsSchema = z.object({
  {entityId}: z.string().uuid(),
})

export async function get{Entity}Repo(args: { {entityId}: string }) {
  const { {entityId} } = argsSchema.parse(args)

  const [result] = await db
    .select()
    .from({tableName})
    .where(eq({tableName}.id, {entityId}))

  if (!result) return null

  return select{Entity}Schema.parse(result)
}
```

### Update Repository (`update-{entity}-repo.ts`)

```typescript
import { db } from '@/repositories/drizzle/get-drizzle'
import { {tableName} } from '@/repositories/drizzle/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { {Entity}Update, update{Entity}Schema, select{Entity}Schema } from './{entity}-schema'

const argsSchema = z.object({
  {entityId}: z.string().uuid(),
  data: update{Entity}Schema,
})

export async function update{Entity}Repo(args: {
  {entityId}: string
  data: {Entity}Update
}) {
  const { {entityId}, data } = argsSchema.parse(args)

  const [result] = await db
    .update({tableName})
    .set(data)
    .where(eq({tableName}.id, {entityId}))
    .returning()

  return select{Entity}Schema.parse(result)
}
```

### Create Repository (`create-{entity}-repo.ts`)

```typescript
import { db } from '@/repositories/drizzle/get-drizzle'
import { {tableName} } from '@/repositories/drizzle/schema'
import { z } from 'zod'
import { {Entity}Insert, insert{Entity}Schema, select{Entity}Schema } from './{entity}-schema'

const argsSchema = z.object({
  data: insert{Entity}Schema,
})

export async function create{Entity}Repo(args: { data: {Entity}Insert }) {
  const { data } = argsSchema.parse(args)

  const [result] = await db
    .insert({tableName})
    .values(data)
    .returning()

  return select{Entity}Schema.parse(result)
}
```

## Checklist Before Creating

- [ ] Schema file exists with `select`, `insert`, `update` schemas?
- [ ] Using object args pattern `(args: { ... })`?
- [ ] Validating input with Zod?
- [ ] Validating output with schema `.parse()`?
- [ ] Using `.returning()` for mutations?
- [ ] File names use kebab-case?
- [ ] No default exports?

## Rules

- Use kebab-case for file names
- Suffix repository files with `-repo.ts`
- Prefix functions with action (e.g., `get-`, `update-`, `create-`)
- No default exports
- Repositories are the ONLY layer that imports `db`
- Validate inputs AND outputs with Zod
- Keep business logic in use-cases, not repositories
- Always use object args pattern
- Always use `.returning()` for mutations

See `docs/implementation.md` for complete patterns and common mistakes.
