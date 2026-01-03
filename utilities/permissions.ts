import { Role, ROLE_LEVELS } from './roles'

type UserContext = {
  role: Role
}

export function getPermissions(user: UserContext) {
  const userLevel = ROLE_LEVELS[user.role]

  return {
    hasRole: (role: Role) => user.role === role,
    hasMinRole: (min: Role) => userLevel >= ROLE_LEVELS[min],
    isAdmin: user.role === 'admin',
  }
}
