'use client'

import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'
import { IconLogout } from '@tabler/icons-react'

type Props = {
  session: Session
}

export function UserMenu({ session }: Props) {
  const displayName = session.user.name ?? session.user.email ?? 'User'
  const role = session.user.role

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 px-2 py-2">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-medium truncate text-xs">{displayName}</span>
          <span className="text-muted-foreground text-[10px] capitalize">{role}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <IconLogout className="size-4" />
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
