import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'
import {
  useBorrows,
  useBorrowsByStatus,
  useCreateBorrow,
  useReturnBorrow,
  useDeleteBorrow,
} from '@/hooks/useBorrows'
import { borrowSchema, type BorrowFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FormField, Input } from '@/components/shared/FormField'
import { usePagination } from '@/hooks/usePagination'
import { formatDate } from '@/lib/utils'
import type { Borrowed, BorrowStatus, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_TABS: { label: string; value: BorrowStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Borrowed', value: 'BORROWED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Returned', value: 'RETURNED' },
]

export default function StaffBorrows() {
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<BorrowStatus | 'ALL'>('ALL')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [returnTarget, setReturnTarget] = useState<Borrowed | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Borrowed | null>(null)

  const allBorrows = useBorrows(params)
  const filteredBorrows = useBorrowsByStatus(activeTab as BorrowStatus, params)
  const { data, isLoading } = activeTab === 'ALL' ? allBorrows : filteredBorrows

  const create = useCreateBorrow()
  const returnBorrow = useReturnBorrow()
  const del = useDeleteBorrow()

  const pageData = data as Page<Borrowed> | undefined
  const borrows: Borrowed[] = pageData?.content ?? []

  const columns: ColumnDef<Borrowed, unknown>[] = [
    {
      header: 'Member',
      id: 'user',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
        </div>
      ),
    },
    {
      header: 'Book',
      id: 'book',
      cell: ({ row }) => (
        <div>
          <p className="font-medium leading-snug">{row.original.bookCopy.book.title}</p>
          <p className="text-xs text-muted-foreground">Barcode: {row.original.bookCopy.barcode}</p>
        </div>
      ),
    },
    {
      header: 'Borrow Date',
      accessorKey: 'borrowDate',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: ({ row }) => {
        const due = row.original.dueDate
        const isOverdue = row.original.status === 'OVERDUE'
        return (
          <span className={isOverdue ? 'font-medium text-red-600' : ''}>
            {formatDate(due)}
          </span>
        )
      },
    },
    {
      header: 'Return Date',
      accessorKey: 'returnDate',
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
      cell: ({ row }) => {
        const b = row.original
        const canReturn = b.status === 'BORROWED' || b.status === 'OVERDUE'
        return (
          <div className="flex justify-end gap-2">
            {canReturn && (
              <button
                onClick={() => setReturnTarget(b)}
                title="Mark as returned"
                className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Return
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(b)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <PageShell
      title="Borrows"
      description={pageData ? `${pageData.totalElements} total records` : ''}
      action={
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Borrow
        </button>
      }
    >
      {/* Status tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setActiveTab(t.value); goToPage(0) }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.value
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={borrows} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      {/* Create borrow dialog */}
      {showCreateDialog && (
        <CreateBorrowDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setShowCreateDialog(false) })}
          isPending={create.isPending}
        />
      )}

      {/* Return confirm */}
      <ConfirmDialog
        open={!!returnTarget}
        title="Mark as returned"
        description={`Mark "${returnTarget?.bookCopy.book.title}" borrowed by ${returnTarget?.user.name} as returned?`}
        confirmLabel="Return"
        loading={returnBorrow.isPending}
        onConfirm={() =>
          returnTarget && returnBorrow.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) })
        }
        onCancel={() => setReturnTarget(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete borrow record"
        description="This will permanently remove this borrow record. This cannot be undone."
        loading={del.isPending}
        onConfirm={() =>
          deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function CreateBorrowDialog({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void
  onCreate: (d: BorrowFormValues) => void
  isPending: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const { register, handleSubmit, formState: { errors } } = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowSchema) as Resolver<BorrowFormValues>,
    defaultValues: { borrowDate: today },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">New Borrow</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter the member ID, book copy ID, and borrow date. The due date is set automatically to 14 days from the borrow date.
        </p>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <FormField label="Member ID" required error={errors.userId?.message}>
            <Input type="number" {...register('userId', { valueAsNumber: true })} error={!!errors.userId} placeholder="e.g. 42" />
          </FormField>
          <FormField label="Book Copy ID" required error={errors.bookCopyId?.message}>
            <Input type="number" {...register('bookCopyId', { valueAsNumber: true })} error={!!errors.bookCopyId} placeholder="e.g. 7" />
          </FormField>
          <FormField label="Borrow Date" required error={errors.borrowDate?.message}>
            <Input type="date" {...register('borrowDate')} error={!!errors.borrowDate} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Borrowing…' : 'Confirm Borrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
