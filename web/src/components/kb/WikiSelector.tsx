'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus, Pencil, Trash2 } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup, CommandSeparator } from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useKBStore } from '@/stores'

export function 维基Selector({ kb名称, kbId }: { kb名称: string; kbId: string }) {
  const router = useRouter()
  const knowledgeBases = useKBStore((s) => s.knowledgeBases)
  const createKB = useKBStore((s) => s.createKB)
  const renameKB = useKBStore((s) => s.renameKB)
  const deleteKB = useKBStore((s) => s.deleteKB)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [renameDialogOpen, set重命名DialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [new名称, setNew名称] = React.useState('')
  const [rename名称, set重命名名称] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [renaming, setRenaming] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const handleCreate = async () => {
    if (!new名称.trim()) return
    setCreating(true)
    try {
      const kb = await createKB(new名称.trim())
      setCreateDialogOpen(false)
      setNew名称('')
      router.push(`/wikis/${kb.slug}`)
    } catch {
      // error handled by store
    } finally {
      setCreating(false)
    }
  }

  const handle重命名 = async () => {
    if (!rename名称.trim() || rename名称.trim() === kb名称) return
    setRenaming(true)
    try {
      await renameKB(kbId, rename名称.trim())
      set重命名DialogOpen(false)
      const updated = useKBStore.getState().knowledgeBases.find((kb) => kb.id === kbId)
      if (updated) router.replace(`/wikis/${updated.slug}`)
    } catch {
      // error handled by store
    } finally {
      setRenaming(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteKB(kbId)
      setDeleteDialogOpen(false)
      router.push('/wikis')
    } catch {
      // error handled by store
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch('') }}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            aria-label="Switch wiki"
            class名称="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <span class名称="truncate flex-1 text-left">{kb名称}</span>
            <ChevronsUpDown class名称="size-3 text-muted-foreground/50 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent class名称="w-52 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search wikis..." aria-label="Search wikis" value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No wikis found.</CommandEmpty>
              <CommandGroup heading="维基s">
                {knowledgeBases.map((kb) => (
                  <CommandItem
                    key={kb.id}
                    value={kb.name}
                    onSelect={() => {
                      setOpen(false)
                      router.push(`/wikis/${kb.slug}`)
                    }}
                  >
                    {kb.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {!search.trim() && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Actions">
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        set重命名名称(kb名称)
                        set重命名DialogOpen(true)
                      }}
                    >
                      <Pencil class名称="size-3.5 mr-2" />
                      重命名
                    </CommandItem>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        setDeleteDialogOpen(true)
                      }}
                      class名称="text-destructive"
                    >
                      <Trash2 class名称="size-3.5 mr-2" />
                      Delete
                    </CommandItem>
                    <CommandSeparator />
                    <CommandItem
                      onSelect={() => {
                        setOpen(false)
                        setCreateDialogOpen(true)
                      }}
                    >
                      <Plus class名称="size-3.5 mr-2" />
                      Create 维基
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create wiki</DialogTitle>
          </DialogHeader>
          <input
            value={new名称}
            onChange={(e) => setNew名称(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="My Research"
            class名称="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            autoFocus
          />
          <DialogFooter>
            <button
              onClick={handleCreate}
              disabled={creating || !new名称.trim()}
              class名称="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={set重命名DialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名 wiki</DialogTitle>
          </DialogHeader>
          <input
            value={rename名称}
            onChange={(e) => set重命名名称(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handle重命名()}
            class名称="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            autoFocus
          />
          <DialogFooter>
            <button
              onClick={handle重命名}
              disabled={renaming || !rename名称.trim() || rename名称.trim() === kb名称}
              class名称="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {renaming ? 'Renaming...' : '重命名'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete wiki</DialogTitle>
          </DialogHeader>
          <p class名称="text-sm text-muted-foreground">
            This will permanently delete <strong>{kb名称}</strong> and all its 文档. This cannot be undone.
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              class名称="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              class名称="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
