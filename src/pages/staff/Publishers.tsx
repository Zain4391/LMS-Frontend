import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usePublishers, useCreatePublisher, useUpdatePublisher, useDeletePublisher } from '@/hooks/usePublishers'
import { publisherSchema, type PublisherFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormField, Input } from '@/components/shared/FormField'
import type { Publisher } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

type Mode = { type: 'create' } | { type: 'edit'; publisher: Publisher }

export default function StaffPublishers() {
  const { data: publishers = [], isLoading } = usePublishers()
  const create = useCreatePublisher()
  const del = useDeletePublisher()
  const [mode, setMode] = useState<Mode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null)

  const columns: ColumnDef<Publisher, unknown>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Country', accessorKey: 'country', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Email', accessorKey: 'email', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Address', accessorKey: 'address', cell: ({ getValue }) => (getValue() as string) || '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setMode({ type: 'edit', publisher: row.original })} className="text-muted-foreground hover:text-foreground">
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
      title="Publishers"
      description={`${(publishers as Publisher[]).length} publishers`}
      action={
        <button onClick={() => setMode({ type: 'create' })} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Publisher
        </button>
      }
    >
      <DataTable columns={columns} data={publishers as Publisher[]} isLoading={isLoading} />

      {mode && (
        <PublisherDialog mode={mode} onClose={() => setMode(null)} onCreate={(d) => create.mutate(d, { onSuccess: () => setMode(null) })} isPending={create.isPending} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete publisher"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function PublisherDialog({ mode, onClose, onCreate, isPending }: {
  mode: Mode; onClose: () => void; onCreate: (d: PublisherFormValues) => void; isPending: boolean
}) {
  const update = useUpdatePublisher(mode.type === 'edit' ? mode.publisher.id : 0)
  const { register, handleSubmit, formState: { errors } } = useForm<PublisherFormValues>({
    resolver: zodResolver(publisherSchema),
    defaultValues: mode.type === 'edit' ? mode.publisher : {},
  })

  function onSubmit(d: PublisherFormValues) {
    if (mode.type === 'create') { onCreate(d); return }
    update.mutate(d, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{mode.type === 'create' ? 'Add Publisher' : 'Edit Publisher'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} error={!!errors.name} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Country" error={errors.country?.message}>
              <Input {...register('country')} error={!!errors.country} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} error={!!errors.email} />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            <Input {...register('address')} error={!!errors.address} />
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
