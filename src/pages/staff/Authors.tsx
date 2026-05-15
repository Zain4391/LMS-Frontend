import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuthors, useCreateAuthor, useUpdateAuthor, useDeleteAuthor } from '@/hooks/useAuthors'
import { authorSchema, type AuthorFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormField, Input, Textarea } from '@/components/shared/FormField'
import { formatDate } from '@/lib/utils'
import type { Author } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

type Mode = { type: 'create' } | { type: 'edit'; author: Author }

export default function StaffAuthors() {
  const { data: authors = [], isLoading } = useAuthors()
  const create = useCreateAuthor()
  const del = useDeleteAuthor()
  const [mode, setMode] = useState<Mode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null)

  const columns: ColumnDef<Author, unknown>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Nationality', accessorKey: 'nationality', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Birth Date', accessorKey: 'birthDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setMode({ type: 'edit', author: row.original })} className="text-muted-foreground hover:text-foreground">
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
      title="Authors"
      description={`${(authors as Author[]).length} authors`}
      action={
        <button
          onClick={() => setMode({ type: 'create' })}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Author
        </button>
      }
    >
      <DataTable columns={columns} data={authors as Author[]} isLoading={isLoading} />

      {mode && (
        <AuthorDialog
          mode={mode}
          onClose={() => setMode(null)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setMode(null) })}
          isPending={create.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete author"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function AuthorDialog({ mode, onClose, onCreate, isPending }: {
  mode: Mode; onClose: () => void; onCreate: (d: AuthorFormValues) => void; isPending: boolean
}) {
  const update = useUpdateAuthor(mode.type === 'edit' ? mode.author.id : 0)
  const { register, handleSubmit, formState: { errors } } = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: mode.type === 'edit' ? mode.author : {},
  })

  function onSubmit(d: AuthorFormValues) {
    if (mode.type === 'create') { onCreate(d); return }
    update.mutate(d, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{mode.type === 'create' ? 'Add Author' : 'Edit Author'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} error={!!errors.name} />
          </FormField>
          <FormField label="Nationality" error={errors.nationality?.message}>
            <Input {...register('nationality')} error={!!errors.nationality} />
          </FormField>
          <FormField label="Birth Date" error={errors.birthDate?.message}>
            <Input type="date" {...register('birthDate')} error={!!errors.birthDate} />
          </FormField>
          <FormField label="Biography" error={errors.biography?.message}>
            <Textarea rows={3} {...register('biography')} error={!!errors.biography} />
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
