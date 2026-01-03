# Create Frontend Component Skill

Creates frontend component files following the project's server/client component pattern.

**Reference:** See `docs/project-pattern/front-end.md` for complete documentation.

## UI Libraries

- **Component Library:** Base UI (`@base-ui/react`) - NOT Radix UI
- **Icons:** Tabler Icons (`@tabler/icons-react`) - NOT Lucide
- **Styling utility:** `cn` from `@/utilities/shadcn`

**Important differences from Radix:**
- No `asChild` prop - put content directly in trigger components
- Select `onValueChange` signature: `(value: string | null) => void`
- SelectValue has no `placeholder` prop

## Usage

```
/create-frontend-component <component-name>
```

Example: `/create-frontend-component user-profile-card`

## What it creates

For a given component (e.g., `user-profile-card`), creates:

```
components/{domain}/
├── {component-name}-server.tsx    # Server component (entry point)
├── {component-name}-client.tsx    # Client component (interactivity)
├── {component-name}-skeleton.tsx  # Loading state
└── {component-name}-error.tsx     # Error state
```

## Instructions

1. **Ask for the component name** if not provided
2. **Ask for the domain/folder** (e.g., `users`, `licenses`)
3. **Ask what data hooks are needed** (e.g., `useUserProfile`, `useLicense`)
4. **Ask if mutations are needed** (for forms/interactive components)

## File Templates

### 1. Server Component (`{component-name}-server.tsx`)

```typescript
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { usePrefetched{Entity} } from '@/use-cases/{domain}/{entity}/use-prefetched-{entity}'
import { {ComponentName}Client } from './{component-name}-client'
import { {ComponentName}Skeleton } from './{component-name}-skeleton'
import { {ComponentName}Error } from './{component-name}-error'

type {ComponentName}ServerProps = {
  {entityId}: string
}

export async function {ComponentName}Server({ {entityId} }: {ComponentName}ServerProps) {
  const queryClient = getQueryClient()

  await usePrefetched{Entity}(queryClient, {entityId})

  return (
    <ErrorBoundary fallback={<{ComponentName}Error />}>
      <Suspense fallback={<{ComponentName}Skeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <{ComponentName}Client {entityId}={{entityId}} />
        </HydrationBoundary>
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 2. Client Component (`{component-name}-client.tsx`)

```typescript
'use client'

import { use{Entity} } from '@/use-cases/{domain}/{entity}/use-{entity}'
import { {ComponentName}Skeleton } from './{component-name}-skeleton'
import { {ComponentName}Error } from './{component-name}-error'

type {ComponentName}ClientProps = {
  {entityId}: string
}

export function {ComponentName}Client({ {entityId} }: {ComponentName}ClientProps) {
  const { data, isLoading, error } = use{Entity}({entityId})

  if (isLoading) {
    return <{ComponentName}Skeleton />
  }

  if (error || !data) {
    return <{ComponentName}Error />
  }

  return (
    <div>
      {/* Component UI here */}
    </div>
  )
}
```

### 3. Skeleton Component (`{component-name}-skeleton.tsx`)

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function {ComponentName}Skeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
```

### 4. Error Component (`{component-name}-error.tsx`)

```typescript
import { IconAlertCircle } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function {ComponentName}Error() {
  return (
    <Alert variant="destructive">
      <IconAlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load {component name}. Please try again later.
      </AlertDescription>
    </Alert>
  )
}
```

## Data Flow

1. **Request:** Page requests `<{ComponentName}Server />`
2. **Server:** Server component fetches data via `usePrefetched*`
3. **Suspense:** Shows skeleton while loading
4. **Hydration:** Data passed to client via `HydrationBoundary`
5. **Client:** Client component hydrates and becomes interactive

## Rules

- Server components are the entry point for features
- Use `'use client'` directive only on client components
- Always wrap client components in Suspense, ErrorBoundary, and HydrationBoundary
- Skeleton and Error components are stateless
- Use React Query hooks for data access in client components
- Keep UI components separate from data logic

## Auth in Components

Server components can access session directly:

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPermissions } from '@/utilities/permissions'

export async function {ComponentName}Server({ {entityId} }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const perms = getPermissions(session.user)

  // Pass user info to client if needed
  return (
    <{ComponentName}Client
      {entityId}={{entityId}}
      isAdmin={perms.isGlobalAdmin}
    />
  )
}
```

Client components use the hook:

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function {ComponentName}Client() {
  const { data: session } = useSession()
  // ...
}
```

See `auth-patterns.md` for detailed patterns.
