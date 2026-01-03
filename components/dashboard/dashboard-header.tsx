'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-2 border-b px-6">
      <SidebarTrigger />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
