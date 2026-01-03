import type { Role } from '@/utilities/roles'
import { IconDashboard, IconUsers, IconSettings } from '@tabler/icons-react'

export type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  minRole?: Role
}

export const navigationItems: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: IconDashboard },
  { title: 'Users', url: '/users', icon: IconUsers, minRole: 'admin' },
  { title: 'Settings', url: '/settings', icon: IconSettings },
]
