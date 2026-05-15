import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useBookCopies, useCreateBookCopy, useUpdateBookCopy, useDeleteBookCopy } from '@/hooks/useBookCopies'
import { useBooks } from '@/hooks/useBooks'
import { bookCopySchema, type BookCopyFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FormField, Input, Select } from '@/components/shared/FormField'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils'
import type { BookCopy, Book, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

type Mode = { type: 'create' } | { type: 'edit'; copy: BookCopy }

export default function StaffBookCopies() {
  const { params, goToPage } = usePagination()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [mode, setMode] = useState<Mode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BookCopy | null>(null)

  const { data, isLoading } = useBookCopies(params)
  const create = useCreateBookCopy()
  const del = useDeleteBookCopy()

  const pageData = data as Page<BookCopy> | undefined
  const copies: BookCopy[] = pageData?.content ?? []
  const filtered = debouncedSearch
    ? copies.filter((c) =>
        c.barcode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.book.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : copies

  const columns: ColumnDef<BookCopy, unknown>[] = [
    { header: 'Barcode', accessorKey: 'barcode' },
    { header: 'Book', id: 'book', cell: ({ row }) => <span className="font-medium">{row.original.book.title}</span> },
    { header: 'Condition', accessorKey: 'condition', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { header: 'Location', accessorKey: 'location', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Acquired', accessorKey: 'acquisitionDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setMode({ type: 'edit', copy: row.original })} className="text-muted-foreground hover:text-foreground">
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
      title="Book Copies"
      description="Manage physical copies and their status"
      action={
        <button onClick={() => setMode({ type: 'create' })} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Copy
        </button>
      }
    >
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by barcode or title…" className="max-w-sm" />
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
        <BookCopyDialog
          mode={mode}
          onClose={() => setMode(null)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setMode(null) })}
          isPending={create.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete book copy"
        description={`Delete copy with barcode "${deleteTarget?.barcode}"? This cannot be undone.`}
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function BookCopyDialog({ mode, onClose, onCreate, isPending }: {
  mode: Mode; onClose: () => void; onCreate: (d: BookCopyFormValues) => void; isPending: boolean
}) {
  const update = useUpdateBookCopy(mode.type === 'edit' ? mode.copy.id : 0)
  const { data: books = [] } = useBooks()
  const bookList = Array.isArray(books) ? (books as Book[]) : (books as Page<Book>).content ?? []

  const defaultValues = mode.type === 'edit'
    ? { ...mode.copy, bookId: mode.copy.book.id }
    : {}

  const { register, handleSubmit, formState: { errors } } = useForm<BookCopyFormValues>({
    resolver: zodResolver(bookCopySchema) as Resolver<BookCopyFormValues>,
    defaultValues,
  })

  function onSubmit(d: BookCopyFormValues) {
    if (mode.type === 'create') { onCreate(d); return }
    update.mutate(d, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{mode.type === 'create' ? 'Add Book Copy' : 'Edit Book Copy'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Book" required error={errors.bookId?.message}>
            <Select {...register('bookId')} error={!!errors.bookId}>
              <option value="">Select a book…</option>
              {bookList.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </Select>
          </FormField>
          <FormField label="Barcode" required error={errors.barcode?.message}>
            <Input {...register('barcode')} error={!!errors.barcode} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Condition" error={errors.condition?.message}>
              <Select {...register('condition')} error={!!errors.condition}>
                <option value="">Select…</option>
                {['NEW', 'GOOD', 'FAIR', 'POOR'].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Status" error={errors.status?.message}>
              <Select {...register('status')} error={!!errors.status}>
                <option value="">Select…</option>
                {['AVAILABLE', 'BORROWED', 'UNAVAILABLE'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Location" error={errors.location?.message}>
            <Input {...register('location')} placeholder="e.g. Shelf A-12" error={!!errors.location} />
          </FormField>
          <FormField label="Acquisition Date" error={errors.acquisitionDate?.message}>
            <Input type="date" {...register('acquisitionDate')} error={!!errors.acquisitionDate} />
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
