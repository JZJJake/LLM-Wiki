'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { UserMenu } from '@/components/layout/UserMenu'

type Props = {
  kb名称: string
}

export function KBHeader({ kb名称 }: Props) {
  const router = useRouter()

  return (
    <div class名称="flex items-center gap-1.5">
      <button
        onClick={() => router.push('/wikis')}
        class名称="p-1 rounded transition-colors hover:bg-accent cursor-pointer text-foreground"
      >
        <ChevronLeft class名称="size-4" />
      </button>
      <span class名称="text-sm font-medium">{kb名称}</span>
      <div class名称="ml-auto">
        <UserMenu />
      </div>
    </div>
  )
}
