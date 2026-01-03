export const ROLES = ['admin', 'support', 'member'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 3,
  support: 2,
  member: 1,
}
