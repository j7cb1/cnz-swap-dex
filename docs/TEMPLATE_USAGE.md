# Template Usage Guide

This is a Next.js base template with authentication, clean architecture patterns, and AI-friendly documentation.

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker compose -f docker/docker-compose.yml up -d

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

## Adding a New Domain

Follow these steps to add a new domain (e.g., "posts", "products", "orders"):

### 1. Database Schema

Add your table to `repositories/drizzle/schema.ts`:

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: varchar('content', { length: 10000 }),
  authorId: uuid('author_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'), // Soft delete
})
```

Push changes: `npm run db:push`

### 2. Repository Layer

Create `repositories/posts/`:

**post-schema.ts**
```typescript
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { posts } from '@/repositories/drizzle/schema'
import { z } from 'zod'

export const selectPostSchema = createSelectSchema(posts)
export const insertPostSchema = createInsertSchema(posts)
export const updatePostSchema = insertPostSchema.omit({ id: true }).partial()

export type Post = z.infer<typeof selectPostSchema>
export type PostInsert = z.infer<typeof insertPostSchema>
export type PostUpdate = z.infer<typeof updatePostSchema>
```

**get-post-by-id-repo.ts**
```typescript
import { db } from '@/repositories/drizzle/get-drizzle'
import { posts } from '@/repositories/drizzle/schema'
import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { selectPostSchema } from './post-schema'

const argsSchema = z.object({ id: z.string().uuid() })

export async function getPostByIdRepo(args: { id: string }) {
  const { id } = argsSchema.parse(args)

  const [result] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .where(isNull(posts.deletedAt))

  return result ? selectPostSchema.parse(result) : null
}
```

### 3. Use Case Layer

Create `use-cases/posts/`:

**get-post-query-key.ts**
```typescript
export const getPostQueryKey = (id: string) => ['post', id]
```

**get-post-use-case.ts**
```typescript
import { z } from 'zod'
import { Logger } from 'pino'
import { createResultSchema, ZodFunctionResult } from '@/utilities/function-result'
import { getQueryClient } from '@/lib/query-client'
import { getPostByIdRepo } from '@/repositories/posts/get-post-by-id-repo'
import { selectPostSchema } from '@/repositories/posts/post-schema'
import { getPostQueryKey } from './get-post-query-key'
import { captureError } from '@/utilities/error'

export const GetPostUseCaseArgsSchema = z.object({
  id: z.string().uuid(),
  log: z.custom<Logger | undefined>(),
})

export const GetPostUseCaseResultSchema = createResultSchema(
  selectPostSchema.nullable(),
  z.object({ message: z.string() }).passthrough()
)

export type GetPostUseCaseArgs = z.infer<typeof GetPostUseCaseArgsSchema>
export type GetPostUseCaseResult = ZodFunctionResult<typeof GetPostUseCaseResultSchema>

export async function getPostUseCase({
  id,
  log,
}: GetPostUseCaseArgs): Promise<GetPostUseCaseResult> {
  const { success, error } = GetPostUseCaseResultSchema

  try {
    log?.info({ id }, 'Get post')

    const queryClient = getQueryClient()
    const post = await queryClient.fetchQuery({
      queryKey: getPostQueryKey(id),
      queryFn: () => getPostByIdRepo({ id }),
    })

    return success(post)
  } catch (err) {
    log?.error({ err, id }, 'Error getting post')
    captureError(err)
    return error({ message: 'Failed to get post' })
  }
}
```

**get-post-action.ts**
```typescript
'use server'

import { auth } from '@/auth'
import { getPostUseCase } from './get-post-use-case'
import { getLogger, LoggerModule } from '@/services/logger/logger'

export async function getPostAction(id: string) {
  const session = await auth()
  if (!session) {
    return { data: null, error: { message: 'Unauthorized' } }
  }

  const log = getLogger({ module: LoggerModule.App })
  return getPostUseCase({ id, log })
}
```

### 4. UI Components

Create `components/posts/`:

**posts-list.tsx** (Client component)
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { getPostsAction } from '@/use-cases/posts/get-posts-action'

export function PostsList() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const result = await getPostsAction()
      if (result.error) throw result.error
      return result.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading posts</div>

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <div key={post.id} className="p-4 border rounded">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-muted-foreground">{post.content}</p>
        </div>
      ))}
    </div>
  )
}
```

### 5. Page Route

Create `app/(dashboard)/posts/page.tsx`:

```typescript
import { PageHeader } from '@/components/dashboard/page-header'
import { PostsList } from '@/components/posts/posts-list'

export default async function PostsPage() {
  return (
    <div>
      <PageHeader title="Posts" description="Manage your posts" />
      <div className="mt-6">
        <PostsList />
      </div>
    </div>
  )
}
```

### 6. Navigation

Add to `config/navigation.ts`:

```typescript
import { IconArticle } from '@tabler/icons-react'

export const navigationItems: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: IconDashboard },
  { title: 'Posts', url: '/posts', icon: IconArticle },
  // ...
]
```

## Architecture Overview

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, signup routes
│   └── (dashboard)/       # Protected routes
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   └── dashboard/        # Dashboard shell
├── repositories/          # Data access layer
│   ├── drizzle/          # Schema, connection
│   └── {domain}/         # Domain-specific repos
├── use-cases/            # Business logic
│   ├── auth/             # Auth use cases
│   └── {domain}/         # Domain-specific logic
├── utilities/            # Shared utilities
├── services/             # External services (logger)
├── lib/                  # Core libraries
├── config/               # App configuration
├── auth.ts               # NextAuth configuration
└── proxy.ts              # Middleware
```

## Key Patterns

1. **FunctionResult** - All use cases return `{ data, error }` for consistent error handling
2. **Server Actions** - Use `'use server'` for secure client-server communication
3. **TanStack Query** - Server-side caching with automatic request deduplication
4. **Zod Validation** - Runtime type validation at all boundaries
5. **Soft Deletes** - Use `deletedAt` timestamp instead of hard deletes
6. **Role-Based Access** - `admin`, `support`, `member` roles with permission checks

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run lint         # Run ESLint
```
