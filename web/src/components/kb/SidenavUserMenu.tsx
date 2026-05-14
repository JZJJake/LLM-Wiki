'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { 设置, LogOut, Moon, Sun } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/stores'
import { useTheme } from 'next-themes'
const isLocal = process.env.NEXT_PUBLIC_MODE === 'local'

export function SidenavUserMenu() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const user = useUserStore((s) => s.user)
  const signOutLocal = useUserStore((s) => s.signOut)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  const handleSignOut = async () => {
    if (!isLocal) {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    signOutLocal()
    if (isLocal) return  // No login page in local mode
    router.push('/login')
  }

  if (!user) return null

  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button class名称="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer">
          <div class名称="h-5 w-5 bg-muted border border-border rounded flex items-center justify-center shrink-0">
            <span class名称="text-[8px] font-medium">{initials}</span>
          </div>
          <span class名称="truncate">{user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" class名称="w-48">
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <设置 class名称="mr-2 h-4 w-4" />
          设置
        </DropdownMenuItem>
        {mounted && (
          <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? (
              <><Sun class名称="mr-2 h-4 w-4" />Light Mode</>
            ) : (
              <><Moon class名称="mr-2 h-4 w-4" />Dark Mode</>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut class名称="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
