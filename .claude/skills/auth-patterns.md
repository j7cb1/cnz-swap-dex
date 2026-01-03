# Auth Patterns Skill

Consistent patterns for authentication and authorization across the app.

**Reference:** See `docs/plans/auth/auth-plan.md` for full details.

## Two Auth Systems

| System | Who | Where |
|--------|-----|-------|
| Portal Auth (NextAuth) | Resellers, internal team | Web app |
| License Auth (JWT) | Software end users | API routes |

---

## Portal Auth Patterns

### Server Components

```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPermissions } from '@/utilities/permissions'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const perms = getPermissions(session.user)

  return (
    <Dashboard
      user={session.user}
      isGlobalAdmin={perms.isGlobalAdmin}
    />
  )
}
```

### Client Components

```typescript
// components/user-menu-client.tsx
'use client'

import { useSession } from 'next-auth/react'

export function UserMenuClient() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <Skeleton />
  if (!session) return null

  return <UserMenu user={session.user} />
}
```

### Server Actions - Read Pattern

```typescript
// use-cases/orders/get-order/get-order-action.ts
'use server'

import { auth } from '@/auth'
import { getLogger, LoggerModule } from '@/services/logger/logger'
import { getPermissions } from '@/utilities/permissions'
import { getOrderUseCase } from './get-order-use-case'

export async function getOrderAction(orderId: string) {
  const session = await auth()
  if (!session) return error({ message: 'Unauthorized' })

  const log = getLogger({ module: LoggerModule.App })
  const perms = getPermissions(session.user)

  // Fetch first
  const result = await getOrderUseCase({ orderId, log })
  if (result.error) return error({ message: 'Order not found' })

  // Check access - same error prevents enumeration
  if (!perms.canAccessReseller(result.data.resellerId)) {
    return error({ message: 'Order not found' })
  }

  return result
}
```

### Server Actions - Write Pattern

```typescript
// use-cases/orders/update-order/update-order-action.ts
'use server'

import { auth } from '@/auth'
import { getLogger, LoggerModule } from '@/services/logger/logger'
import { getPermissions } from '@/utilities/permissions'
import { getOrderUseCase } from '../get-order/get-order-use-case'
import { updateOrderUseCase } from './update-order-use-case'

export async function updateOrderAction(orderId: string, data: OrderUpdate) {
  const session = await auth()
  if (!session) return error({ message: 'Unauthorized' })

  const log = getLogger({ module: LoggerModule.App })
  const perms = getPermissions(session.user)

  // Check access BEFORE mutation
  const existing = await getOrderUseCase({ orderId, log })
  if (existing.error || !perms.canAccessReseller(existing.data.resellerId)) {
    return error({ message: 'Order not found' })
  }

  // Sanitize - strip fields user can't control
  const { resellerId, ...safeData } = data

  return updateOrderUseCase({ orderId, data: safeData, log })
}
```

### Middleware (Route Protection)

```typescript
// middleware.ts
import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## License Auth Patterns

### Validation Endpoint

```typescript
// app/api/v1/license/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateLicenseUseCase } from '@/use-cases/license/validate-license-use-case'
import { signLicenseToken } from '@/utilities/license-token'
import { getLogger, LoggerModule } from '@/services/logger/logger'

export async function POST(req: NextRequest) {
  const log = getLogger({ module: LoggerModule.App })
  const { key, hwid } = await req.json()

  const result = await validateLicenseUseCase({ key, hwid, log })

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 401 })
  }

  const token = await signLicenseToken({
    licenseKeyId: result.data.id,
    productId: result.data.productId,
  })

  return NextResponse.json({
    token,
    config: result.data.config,
    expiresAt: result.data.expiresAt,
  })
}
```

### Protected License API Routes

```typescript
// app/api/v1/license/some-action/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyLicenseToken } from '@/utilities/license-token'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const payload = await verifyLicenseToken(token)

  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // payload contains: licenseKeyId, productId
  // proceed with action...
}
```

---

## Permissions Helper

```typescript
// utilities/permissions.ts
type UserContext = {
  role: 'admin' | 'support' | 'member'
  resellerId: string | null
}

export function getPermissions(user: UserContext) {
  const isInternal = user.resellerId === null
  const levels = { admin: 3, support: 2, member: 1 }
  const userLevel = levels[user.role]

  return {
    isInternal,
    resellerId: user.resellerId,

    canAccessReseller: (id: string) => isInternal || user.resellerId === id,

    hasRole: (role: 'admin' | 'support' | 'member') => user.role === role,
    hasMinRole: (min: 'admin' | 'support' | 'member') => userLevel >= levels[min],

    isGlobalAdmin: isInternal && user.role === 'admin',
  }
}
```

---

## Security Rules

1. **Same error message** - "Not found" for both missing and unauthorized
2. **Fetch before check** - Need resource to know its resellerId
3. **Check before mutate** - Verify access before any write
4. **Sanitize mutations** - Strip fields users can't control

---

## Layer Responsibilities

| Layer | Auth Responsibility |
|-------|---------------------|
| Middleware | Redirect unauthenticated users |
| Server Component | Get session, pass to children |
| Action | Auth + permissions (gatekeeper) |
| Use-case | None - pure business logic |
| Repo | None - data access only |
