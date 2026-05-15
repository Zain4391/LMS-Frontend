import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useGenres, useCreateGenre, useUpdateGenre, useDeleteGenre } from '@/hooks/useGenres'
import { genreSchema, type GenreFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormField, Input, Textarea } from '@/components/shared/FormField'
import type { Genre } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

type Mode = { type: 'create' } | { type: 'edit'; genre: Genre }

export default function StaffGenres() {
  const { data: genres = [], isLoading } = useGenres()
  const create = useCreateGenre()
  const del = useDeleteGenre()
  const [mode, setMode] = useState<Mode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null)

  const columns: ColumnDef<Genre, unknown>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Description', accessorKey: 'description', cell: ({ getValue }) => (getValue() as string) || '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setMode({ type: 'edit', genre: row.original })} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(row.original)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Genres"
      description={`${(genres as Genre[]).length} genres`}
      action={
        <button onClick={() => setMode({ type: 'create' })} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Genre
        </button>
      }
    >
      <DataTable columns={columns} data={genres as Genre[]} isLoading={isLoading} />

      {mode && (
        <GenreDialog mode={mode} onClose={() => setMode(null)} onCreate={(d) => create.mutate(d, { onSuccess: () => setMode(null) })} isPending={create.isPending} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete genre"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function GenreDialog({ mode, onClose, onCreate, isPending }: {
  mode: Mode; onClose: () => void; onCreate: (d: GenreFormValues) => void; isPending: boolean
}) {
  const update = useUpdateGenre(mode.type === 'edit' ? mode.genre.id : 0)
  const { register, handleSubmit, formState: { errors } } = useForm<GenreFormValues>({
    resolver: zodResolver(genreSchema),
    defaultValues: mode.type === 'edit' ? mode.genre : {},
  })

  function onSubmit(d: GenreFormValues) {
    if (mode.type === 'create') { onCreate(d); return }
    update.mutate(d, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{mode.type === 'create' ? 'Add Genre' : 'Edit Genre'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} error={!!errors.name} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Textarea rows={2} {...register('description')} error={!!errors.description} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isPending || update.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {isPending || update.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
