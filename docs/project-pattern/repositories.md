# Repository Pattern

## Structure

Each repository should be organized as follows:

```
{repository-name}/
├── *-schema.ts              # Zod schemas (generated via drizzle-zod)
└── *-repo.ts                # Repository functions
```

## Naming Conventions

- Use kebab-case for file names
- Suffix repository files with `-repo.ts`
- Prefix functions with action (e.g., `get-`, `update-`, `create-`)
- Use full descriptive names (e.g., `get-user-profile-repo.ts`)

## File Responsibilities

### `*-schema.ts`

- Generate Zod schemas from Drizzle tables using `drizzle-zod`
- Export TypeScript types derived from schemas
- Add any custom validation or refinements

```typescript
// user-schema.ts
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { users } from '@/db/schema'
import { z } from 'zod'

export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)

// Custom refinements if needed
export const updateUserSchema = insertUserSchema
  .omit({ id: true, createdAt: true })
  .partial()

export type User = z.infer<typeof selectUserSchema>
export type UserInsert = z.infer<typeof insertUserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>
```

### `*-repo.ts`

- Export repository functions
- Handle database interactions via Drizzle
- Use types from schema.ts
- Implement error handling

```typescript
// update-user-repo.ts
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { UserUpdate, updateUserSchema, selectUserSchema } from './user-schema'

export async function updateUserRepo(args: {
  userId: string
  data: UserUpdate
}) {
  const { userId, data } = args

  const validated = updateUserSchema.parse(data)

  const [updated] = await db
    .update(users)
    .set(validated)
    .where(eq(users.id, userId))
    .returning()

  return selectUserSchema.parse(updated)
}
```

## Caching

Repositories do not handle caching. Caching is handled at the use-case layer.

## Best Practices

1. Repositories are the only layer that imports `db`
2. Use `drizzle-zod` to generate schemas from Drizzle tables
3. Validate inputs and outputs with Zod
4. Keep business logic in use-cases, not repositories
5. Follow TypeScript best practices:
   - No default exports
   - Use types over interfaces

## Notes

- Some existing code may not follow these conventions — ask before refactoring
- Migration to consistent patterns should happen incrementally