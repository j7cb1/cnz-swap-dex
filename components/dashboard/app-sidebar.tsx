'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Session } from 'next-auth'
import { getPermissions } from '@/utilities/permissions'
import { isNavActive } from '@/utilities/isNavActive'
import { navigationItems } from '@/config/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'

type Props = {
  session: Session
}

export function AppSidebar({ session }: Props) {
  const pathname = usePathname()
  const perms = getPermissions(session.user)

  const filteredNav = navigationItems.filter((item) => {
    if (item.minRole && !perms.hasMinRole(item.minRole)) return false
    return true
  })

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="h-14" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isNavActive(pathname, item.url)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu session={session} />
      </SidebarFooter>
    </Sidebar>
  )
}
