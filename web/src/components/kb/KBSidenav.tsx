'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, FileText, NotepadText, Library,
  上传, BookOpen, ArrowUpRight, Search as SearchIcon,
  Lightbulb, Box, ScrollText, Network, Folder,
} from 'lucide-react'
import {
  CommandDialog, CommandInput, CommandList, CommandItem,
  CommandEmpty, CommandGroup, CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { 维基Selector } from '@/components/kb/维基Selector'
import { SidenavUserMenu } from '@/components/kb/SidenavUserMenu'
import { apiFetch } from '@/lib/api'
import { useUserStore } from '@/stores'
import type { DocumentListItem, 维基Node } from '@/lib/types'

interface 用量 {
  total_页: number
  total_存储_bytes: number
  document_count: number
  max_页: number
  max_存储_bytes: number
}


interface KBSidenavProps {
  kbId: string
  kb名称: string
  wikiTree: 维基Node[]
  wikiActivePath: string | null
  on维基Navigate: (path: string, docNumber?: number | null) => void
  sourceDocs: DocumentListItem[]
  has维基: boolean
  loading: boolean
  on上传: () => void
  filesViewActive: boolean
  on文件Toggle: () => void
  graphViewActive: boolean
  onGraphToggle: () => void
  onOpenSourceDoc: (docId: string) => void
}

export function KBSidenav({
  kbId,
  kb名称,
  wikiTree,
  wikiActivePath,
  on维基Navigate,
  sourceDocs,
  has维基,
  loading,
  on上传,
  filesViewActive,
  on文件Toggle,
  graphViewActive,
  onGraphToggle,
  onOpenSourceDoc,
}: KBSidenavProps) {
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isMac = React.useMemo(() =>
    typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent),
  [])

  const allSearchableItems = React.useMemo(() => {
    const items: { type: 'wiki' | 'source'; title: string; keywords: string; tags: string[]; path?: string; docNumber?: number | null; doc?: DocumentListItem }[] = []
    const add维基Nodes = (nodes: 维基Node[], parentPath = '') => {
      for (const node of nodes) {
        if (node.path) {
          const matchingDoc = sourceDocs.find((d) => d.path === '/wiki/' && d.filename === node.path?.split('/').pop())
          const tags = matchingDoc?.tags ?? []
          items.push({
            type: 'wiki',
            title: node.title,
            keywords: [node.title, node.path, parentPath, ...tags].filter(Boolean).join(' '),
            tags,
            path: node.path,
            docNumber: node.docNumber,
          })
        }
        if (node.children) add维基Nodes(node.children, node.title)
      }
    }
    add维基Nodes(wikiTree)
    for (const doc of sourceDocs) {
      const tags = doc.tags ?? []
      items.push({
        type: 'source',
        title: doc.title || doc.filename,
        keywords: [doc.title, doc.filename, doc.path, doc.file_type, ...tags].filter(Boolean).join(' '),
        tags,
        doc,
      })
    }
    return items
  }, [wikiTree, sourceDocs])

  const sourceCount = sourceDocs.length

  return (
    <div class名称="h-full flex flex-col border-r border-border">
      {/* 维基 selector */}
      <div class名称="shrink-0 px-2 pt-2 pb-1">
        <维基Selector kbId={kbId} kb名称={kb名称} />
      </div>

      {/* Search + 上传 + Graph */}
      <div class名称="shrink-0 px-2 pb-1 flex items-center gap-1.5">
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search 页 and sources"
          class名称="flex items-center gap-2 flex-1 px-2.5 py-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground border border-border hover:bg-accent rounded-md transition-colors cursor-pointer"
        >
          <SearchIcon class名称="size-3" />
          <span class名称="flex-1 text-left">Search</span>
          <kbd class名称="text-[10px] text-muted-foreground/30 bg-muted px-1 rounded">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
        </button>
        <button
          onClick={onGraphToggle}
          class名称={cn(
            'flex items-center justify-center px-2.5 py-1.5 border rounded-md transition-colors cursor-pointer',
            graphViewActive
              ? 'bg-accent text-foreground border-border'
              : 'text-muted-foreground/50 hover:text-muted-foreground border-border hover:bg-accent',
          )}
          title="Knowledge graph"
        >
          <Network class名称="size-3" />
        </button>
        <button
          onClick={on上传}
          class名称="flex items-center justify-center px-2.5 py-1.5 text-muted-foreground/50 hover:text-muted-foreground border border-border hover:bg-accent rounded-md transition-colors cursor-pointer"
          title="上传 files"
        >
          <上传 class名称="size-3" />
        </button>
      </div>

      {/* Search palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Jump to page, source, or action..." aria-label="Search 页 and sources" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {allSearchableItems.some((i) => i.type === 'wiki') && (
            <CommandGroup heading="维基">
              {allSearchableItems.filter((i) => i.type === 'wiki').map((item) => (
                <CommandItem
                  key={`wiki-${item.path}`}
                  value={item.keywords}
                  onSelect={() => {
                    setSearchOpen(false)
                    if (item.path) on维基Navigate(item.path, item.docNumber)
                  }}
                  class名称="flex items-center"
                >
                  <FileText class名称="size-3.5 mr-2 opacity-50 shrink-0" />
                  <span class名称="truncate">{item.title}</span>
                  {item.tags.length > 0 && (
                    <span class名称="ml-auto flex items-center gap-1 shrink-0 pl-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} class名称="text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {allSearchableItems.some((i) => i.type === 'source') && (
            <CommandGroup heading="资料库">
              {allSearchableItems.filter((i) => i.type === 'source').map((item) => (
                <CommandItem
                  key={`source-${item.doc?.id}`}
                  value={item.keywords}
                  onSelect={() => {
                    setSearchOpen(false)
                    if (item.doc) onOpenSourceDoc(item.doc.id)
                  }}
                  class名称="flex items-center"
                >
                  <NotepadText class名称="size-3.5 mr-2 opacity-50 shrink-0" />
                  <span class名称="truncate">{item.title}</span>
                  {item.tags.length > 0 && (
                    <span class名称="ml-auto flex items-center gap-1 shrink-0 pl-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} class名称="text-[10px] text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { setSearchOpen(false); on文件Toggle() }}>
              <Folder class名称="size-3.5 mr-2 opacity-50" />
              Browse 文件
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); on上传() }}>
              <上传 class名称="size-3.5 mr-2 opacity-50" />
              上传 文件
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* 维基 tree */}
      <div class名称="flex-1 min-h-0 flex flex-col px-2 pt-1">
        <div class名称="flex items-center px-2 mb-1 shrink-0">
          <span class名称="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            维基
          </span>
        </div>
        {loading ? (
          <SidenavSkeleton lines={3} />
        ) : has维基 ? (
          <div class名称="flex-1 overflow-y-auto no-scrollbar">
            {wikiTree.map((node, i) => (
              <维基TreeNode
                key={node.path ?? node.title ?? i}
                node={node}
                depth={0}
                activePath={wikiActivePath}
                onNavigate={on维基Navigate}
              />
            ))}
          </div>
        ) : (
          <div class名称="px-2 py-4 text-center">
            <BookOpen class名称="size-6 text-muted-foreground/20 mx-auto mb-2" />
            <p class名称="text-xs text-muted-foreground mb-2">No wiki yet</p>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              class名称="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Open Claude
              <ArrowUpRight class名称="size-3" />
            </a>
          </div>
        )}
      </div>

      {/* 资料库 button — separated from passive info below */}
      <div class名称="shrink-0 px-2 pb-1">
        <button
          onClick={on文件Toggle}
          class名称={cn(
            'flex items-center gap-2 w-full px-2.5 py-2 text-[13px] rounded-md transition-colors cursor-pointer',
            filesViewActive
              ? 'bg-accent text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
          )}
        >
          <Library class名称="size-3.5" />
          <span class名称="flex-1 text-left">资料库</span>
          {sourceCount > 0 && (
            <span class名称="text-[10px] text-muted-foreground/30">{sourceCount}</span>
          )}
        </button>
      </div>

      {/* User menu */}
      <div class名称="shrink-0 border-t border-border p-2">
        <SidenavUserMenu />
      </div>
    </div>
  )
}

function SidenavSkeleton({ lines }: { lines: number }) {
  return (
    <div class名称="space-y-1 px-2 py-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          class名称="h-5 rounded-md bg-muted/50 animate-pulse"
          style={{ width: `${60 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  )
}

function wikiNodeIcon(node: 维基Node, depth: number) {
  const slug = node.path?.replace(/\.(md|txt|json)$/, '').split('/')[0] ?? ''
  const titleLower = node.title.toLowerCase()

  if (slug === 'overview' || (depth === 0 && titleLower === 'overview'))
    return <BookOpen class名称="size-3 shrink-0 opacity-60" />
  if (slug === 'log' || (depth === 0 && titleLower === 'log'))
    return <ScrollText class名称="size-3 shrink-0 opacity-60" />
  if (slug === 'concepts' || (depth === 0 && titleLower === 'concepts'))
    return <Lightbulb class名称="size-3 shrink-0 opacity-60" />
  if (slug === 'entities' || (depth === 0 && titleLower === 'entities'))
    return <Box class名称="size-3 shrink-0 opacity-60" />

  if (depth > 0)
    return <FileText class名称="size-3 shrink-0 opacity-40" />

  return <FileText class名称="size-3 shrink-0 opacity-50" />
}

function 维基TreeNode({
  node,
  depth,
  activePath,
  onNavigate,
}: {
  node: 维基Node
  depth: number
  activePath: string | null
  onNavigate: (path: string, docNumber?: number | null) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isActive = node.path != null && node.path === activePath
  const hasActiveChild = hasChildren && node.children!.some((c) => c.path === activePath)
  const [expanded, setExpanded] = React.useState(true)

  return (
    <div>
      <div
        class名称={cn(
          'flex items-center gap-1.5 w-full text-left text-[13px] rounded-md px-2 py-1.5 transition-colors cursor-pointer',
          isActive
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (node.path) {
            onNavigate(node.path, node.docNumber)
          } else if (hasChildren) {
            const first = node.children!.find((c) => c.path)
            if (first) onNavigate(first.path!, first.docNumber)
          }
        }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((prev) => !prev) }}
            class名称="p-0.5 -ml-0.5 cursor-pointer"
          >
            <ChevronRight
              class名称={cn(
                'size-2.5 transition-transform duration-150',
                expanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span class名称="w-3.5" />
        )}
        {wikiNodeIcon(node, depth)}
        <span class名称="truncate flex-1 min-w-0">{node.title}</span>
      </div>
      <AnimatePresence initial={false}>
        {hasChildren && (expanded || hasActiveChild) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
            class名称=""
          >
            {node.children!.map((child, i) => (
              <维基TreeNode
                key={child.path ?? child.title ?? i}
                node={child}
                depth={depth + 1}
                activePath={activePath}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(1)} GB`
}

function Page用量Bar() {
  const token = useUserStore((s) => s.accessToken)
  const [usage, set用量] = React.useState<用量 | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    apiFetch<用量>('/v1/usage', token)
      .then(set用量)
      .catch(() => {})
  }, [token])

  if (!usage) return null

  const pct = Math.min(100, (usage.total_存储_bytes / usage.max_存储_bytes) * 100)
  const color =
    pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-yellow-500' : 'bg-primary'

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        class名称="flex items-center gap-2 w-full px-2 py-1 rounded-md hover:bg-accent transition-colors cursor-pointer group"
      >
        <div class名称="flex-1 min-w-0">
          <div class名称="flex items-center justify-between mb-0.5">
            <span class名称="text-[10px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
              Storage
            </span>
            <span class名称="text-[10px] font-mono text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
              {formatBytes(usage.total_存储_bytes)} / {formatBytes(usage.max_存储_bytes)}
            </span>
          </div>
          <div class名称="h-1 rounded-full bg-muted overflow-hidden">
            <div
              class名称={cn('h-full rounded-full transition-all', color)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Storage 用量</DialogTitle>
          </DialogHeader>
          <div class名称="space-y-3 text-sm text-muted-foreground">
            <p>
              You've used <span class名称="font-medium text-foreground">{formatBytes(usage.total_存储_bytes)}</span> of
              your <span class名称="font-medium text-foreground">{formatBytes(usage.max_存储_bytes)}</span> 存储 limit.
            </p>
            <div class名称="h-2 rounded-full bg-muted overflow-hidden">
              <div
                class名称={cn('h-full rounded-full transition-all', color)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p>
              Storage is consumed by uploaded files (PDFs, images, office 文档). Notes and wiki 页 are free and unlimited.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
