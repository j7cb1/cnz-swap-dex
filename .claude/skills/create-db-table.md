# Create Database Table Skill

Adds new tables to the Drizzle schema following project patterns.

**Reference:** See `docs/plans/drizzle-orm.md` and `docs/plans/data-model.md`

## Usage

```
/create-db-table <table-name>
```

## Schema Location

All Drizzle tables: `repositories/drizzle/schema.ts`

Database connection: `repositories/drizzle/get-drizzle.ts`

## Minimal Data Model Philosophy

Each field must answer: **"What decision or display depends on this data existing?"**

If the answer is vague ("might be useful", "good to have"), the field doesn't belong.

### When created_at earns its place

**Valid reasons:**
- User-facing display ("Order placed on", "Member since")
- Business logic queries (sorting, filtering by date)
- Support workflows ("When did this happen?")
- Compliance/audit requirements

**Invalid reasons:**
- "Best practice" - not a reason if unused
- "Might need it later" - YAGNI
- "Every table should have it" - cargo cult

### When updated_at earns its place

**Valid reasons:**
- Optimistic locking (conflict detection)
- Cache invalidation
- Sync/replication ("changes since X")
- User-facing ("Last edited 2 hours ago")

**Invalid reasons:**
- "To know if something changed" - if not checking it, don't add it
- "Standard practice" - only if you use it

### Prefer event timestamps over generic ones

Instead of `created_at` + `updated_at`, use specific event timestamps:
- `activated_at` - when license was first used
- `paid_at` - when order was paid
- `expires_at` - when license expires

These are more meaningful and self-documenting.

## Common Patterns

```typescript
// UUID primary key
id: uuid('id').primaryKey().defaultRandom()

// Foreign key (required)
userId: uuid('user_id').notNull().references(() => users.id)

// Foreign key (optional)
resellerId: uuid('reseller_id').references(() => resellers.id)

// Event timestamp (only when justified)
paidAt: timestamp('paid_at')
activatedAt: timestamp('activated_at')

// Enum (define before tables that use it)
export const statusEnum = pgEnum('status_name', ['value1', 'value2'])

// JSONB for flexible data
config: jsonb('config')
```

## After Adding Tables

- Dev: `npm run db:push`
- Prod: `npm run db:generate` then `npm run db:migrate`

## Rules

- Use snake_case for database column names
- Use camelCase for TypeScript property names
- Define enums before tables that use them
- Every field must justify its existence
