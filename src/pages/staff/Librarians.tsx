import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  useLibrarians,
  useCreateLibrarian,
  useUpdateLibrarian,
  useDeleteLibrarian,
} from '@/hooks/useLibrarians'
import { librarianSchema, type LibrarianFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FormField, Input } from '@/components/shared/FormField'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils'
import type { Librarian, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

type Mode = { type: 'create' } | { type: 'edit'; librarian: Librarian }

export default function StaffLibrarians() {
  const { params, goToPage } = usePagination()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [mode, setMode] = useState<Mode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Librarian | null>(null)

  const { data, isLoading } = useLibrarians(params)
  const create = useCreateLibrarian()
  const del = useDeleteLibrarian()

  const pageData = data as Page<Librarian> | undefined
  const allLibrarians: Librarian[] = pageData?.content ?? []
  const filtered = debouncedSearch
    ? allLibrarians.filter(
        (l) =>
          l.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          l.email.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allLibrarians

  const columns: ColumnDef<Librarian, unknown>[] = [
    {
      header: 'Name',
      id: 'name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { header: 'Phone', accessorKey: 'phoneNumber' },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
    },
    {
      header: 'Hired',
      accessorKey: 'hireDate',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setMode({ type: 'edit', librarian: row.original })}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Librarians"
      description={pageData ? `${pageData.totalElements} staff accounts` : ''}
      action={
        <button
          onClick={() => setMode({ type: 'create' })}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Librarian
        </button>
      }
    >
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="max-w-sm"
        />
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      {mode && (
        <LibrarianDialog
          mode={mode}
          onClose={() => setMode(null)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setMode(null) })}
          isPending={create.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete librarian"
        description={`Permanently delete account for "${deleteTarget?.name}"? This cannot be undone.`}
        loading={del.isPending}
        onConfirm={() =>
          deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function LibrarianDialog({
  mode,
  onClose,
  onCreate,
  isPending,
}: {
  mode: Mode
  onClose: () => void
  onCreate: (d: LibrarianFormValues) => void
  isPending: boolean
}) {
  const update = useUpdateLibrarian(mode.type === 'edit' ? mode.librarian.id : 0)
  const isEdit = mode.type === 'edit'

  const { register, handleSubmit, formState: { errors } } = useForm<LibrarianFormValues>({
    resolver: zodResolver(librarianSchema) as Resolver<LibrarianFormValues>,
    defaultValues: isEdit ? mode.librarian : { role: 'STAFF', status: 'ACTIVE' },
  })

  function onSubmit(d: LibrarianFormValues) {
    const payload = { ...d, password: d.password || undefined }
    if (isEdit) { update.mutate(payload, { onSuccess: onClose }); return }
    onCreate(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{isEdit ? 'Edit Librarian' : 'Add Librarian'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name?.message}>
              <Input {...register('name')} error={!!errors.name} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input type="email" {...register('email')} error={!!errors.email} />
            </FormField>
          </div>
          <FormField label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} required={!isEdit} error={errors.password?.message}>
            <Input type="password" {...register('password')} error={!!errors.password} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone" required error={errors.phoneNumber?.message}>
              <Input {...register('phoneNumber')} error={!!errors.phoneNumber} />
            </FormField>
            <FormField label="Hire Date" required error={errors.hireDate?.message}>
              <Input type="date" {...register('hireDate')} error={!!errors.hireDate} />
            </FormField>
          </div>
          <FormField label="Address" required error={errors.address?.message}>
            <Input {...register('address')} error={!!errors.address} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role" error={errors.role?.message}>
              <select {...register('role')} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <select {...register('status')} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </FormField>
          </div>
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
