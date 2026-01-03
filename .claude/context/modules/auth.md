# Auth Module

> Last updated: 2025-12-22
> Path: `auth.ts`, `app/(auth)/`, `use-cases/auth/`, `utilities/roles.ts`

## Purpose

Authentication and authorization using NextAuth v5 with credentials provider. JWT-based sessions with role-based access control. Supports admin, support, and member roles with reseller scoping.

## Key Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `auth.ts:1-60` | NextAuth configuration | `auth`, `signIn`, `signOut`, `handlers` |
| `use-cases/auth/validate-credentials-use-case.ts` | Credential validation | `validateCredentialsUseCase()` |
| `utilities/roles.ts:1-9` | Role definitions | `ROLES`, `Role`, `ROLE_LEVELS` |
| `utilities/permissions.ts` | Permission checks | Permission utilities |
| `lib/types/next-auth.d.ts` | Type extensions | Session/User type augmentation |
| `app/(auth)/login/page.tsx` | Login page | Login form |
| `app/(auth)/signup/page.tsx` | Signup page | Signup form |

## Role System

```typescript
// utilities/roles.ts
export const ROLES = ['admin', 'support', 'member'] as const
export type Role = 'admin' | 'support' | 'member'

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 3,    // Full access
  support: 2,  // Internal staff
  member: 1,   // Reseller users
}
```

## Session Data

```typescript
// Extended session includes:
session.user = {
  id: string,           // User UUID
  email: string,
  name: string | null,
  role: Role,           // 'admin' | 'support' | 'member'
  resellerId: string | null,  // Null for internal users
}
```

## Auth Flow

```
1. User submits credentials → /login page
2. NextAuth calls authorize() → auth.ts:17-35
3. authorize() calls validateCredentialsUseCase()
4. Use case verifies password with bcrypt
5. Returns user object or null
6. JWT callback stores role + resellerId in token
7. Session callback exposes data to client
```

## Configuration Details

```typescript
// auth.ts key settings
{
  providers: [Credentials({ ... })],
  callbacks: {
    jwt: // Adds id, role, resellerId to token
    session: // Copies token data to session
  },
  pages: {
    signIn: '/login',  // Custom login page
  },
  session: {
    strategy: 'jwt',   // Stateless JWT sessions
  },
}
```

## Navigation Access Control

```typescript
// config/navigation.ts
const navigationItems = [
  { title: 'Dashboard', url: '/' },  // Everyone

  // Internal only (admins/support, not resellers)
  { title: 'Users', url: '/users', internalOnly: true, minRole: 'admin' },
  { title: 'Resellers', url: '/resellers', internalOnly: true },
  { title: 'Products', url: '/products', internalOnly: true, minRole: 'admin' },
  { title: 'Audit Logs', url: '/audit-logs', internalOnly: true },

  // Everyone (scoped by reseller for non-internal)
  { title: 'Licenses', url: '/licenses' },
  { title: 'Orders', url: '/orders' },
]
```

## Dependencies

- **Imports from**: `next-auth`, `bcrypt`, `use-cases/auth/*`
- **Imported by**: All protected routes via `auth()` or middleware

## Patterns Used

- **JWT sessions**: Stateless, no session DB storage
- **Credentials provider**: Email/password, no OAuth
- **Role levels**: Numeric comparison for permission checks
- **Reseller scoping**: `resellerId` in session for data filtering

## Public API

### Server-side

```typescript
import { auth } from '@/auth'

// In server components or API routes
const session = await auth()
if (!session) redirect('/login')
const { role, resellerId } = session.user
```

### Client-side

```typescript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
```

### Sign In/Out

```typescript
import { signIn, signOut } from '@/auth'

// Server action
await signIn('credentials', { email, password })
await signOut()
```

## Edge Cases / Gotchas

1. **Beta version**: Using `next-auth@5.0.0-beta.30` - API may change
2. **No OAuth**: Only credentials provider configured
3. **Password hashing**: Uses bcrypt, hash stored in `users.passwordHash`
4. **Internal vs Reseller**: `internalOnly` in nav = `resellerId` is null
5. **Custom error suppression**: Logger error handler is empty (see `auth.ts:8-9`)
