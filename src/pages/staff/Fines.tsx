import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, CheckCircle, Trash2 } from 'lucide-react'
import {
  useFines,
  useFinesByStatus,
  useCreateFine,
  useDeleteFine,
  usePayFine,
  useAssessFine,
} from '@/hooks/useFines'
import { fineSchema, type FineFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FormField, Textarea } from '@/components/shared/FormField'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Fine, FineStatus, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_TABS: { label: string; value: FineStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Waived', value: 'WAIVED' },
]

export default function StaffFines() {
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<FineStatus | 'ALL'>('ALL')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [payTarget, setPayTarget] = useState<Fine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Fine | null>(null)
  const [assessBorrowId, setAssessBorrowId] = useState('')

  const allFines = useFines(params)
  const filteredFines = useFinesByStatus(activeTab as FineStatus, params)
  const { data, isLoading } = activeTab === 'ALL' ? allFines : filteredFines

  const create = useCreateFine()
  const del = useDeleteFine()
  const pay = usePayFine()
  const assess = useAssessFine()

  const pageData = data as Page<Fine> | undefined
  const fines: Fine[] = pageData?.content ?? []

  const columns: ColumnDef<Fine, unknown>[] = [
    {
      header: 'Member',
      id: 'user',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.borrowed.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.borrowed.user.email}</p>
        </div>
      ),
    },
    {
      header: 'Book',
      id: 'book',
      cell: ({ row }) => (
        <p className="font-medium leading-snug">{row.original.borrowed.bookCopy.book.title}</p>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => (
        <span className="font-semibold">{formatCurrency(getValue() as number)}</span>
      ),
    },
    {
      header: 'Assessed',
      accessorKey: 'assessedDate',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{(getValue() as string) || '—'}</span>
      ),
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
        const f = row.original
        return (
          <div className="flex justify-end gap-2">
            {f.status === 'PENDING' && (
              <button
                onClick={() => setPayTarget(f)}
                className="flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Mark Paid
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(f)}
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
      title="Fines"
      description={pageData ? `${pageData.totalElements} total records` : ''}
      action={
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Fine
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

      <DataTable columns={columns} data={fines} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      {/* Create fine dialog */}
      {showCreateDialog && (
        <CreateFineDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setShowCreateDialog(false) })}
          onAssess={() => {
            const id = Number(assessBorrowId)
            if (id) assess.mutate(id, { onSuccess: () => setShowCreateDialog(false) })
          }}
          assessBorrowId={assessBorrowId}
          setAssessBorrowId={setAssessBorrowId}
          isPending={create.isPending}
          isAssessing={assess.isPending}
        />
      )}

      {/* Mark paid confirm */}
      <ConfirmDialog
        open={!!payTarget}
        title="Mark fine as paid"
        description={`Mark the ${formatCurrency(payTarget?.amount ?? 0)} fine for "${payTarget?.borrowed.user.name}" as paid?`}
        confirmLabel="Mark Paid"
        loading={pay.isPending}
        onConfirm={() => payTarget && pay.mutate(payTarget.id, { onSuccess: () => setPayTarget(null) })}
        onCancel={() => setPayTarget(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete fine"
        description="This will permanently remove this fine record. This cannot be undone."
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function CreateFineDialog({
  onClose,
  onCreate,
  onAssess,
  assessBorrowId,
  setAssessBorrowId,
  isPending,
  isAssessing,
}: {
  onClose: () => void
  onCreate: (d: FineFormValues) => void
  onAssess: () => void
  assessBorrowId: string
  setAssessBorrowId: (v: string) => void
  isPending: boolean
  isAssessing: boolean
}) {
  const [mode, setMode] = useState<'manual' | 'auto'>('auto')

  const { register, handleSubmit, formState: { errors } } = useForm<FineFormValues>({
    resolver: zodResolver(fineSchema) as Resolver<FineFormValues>,
    defaultValues: { assessedDate: new Date().toISOString().split('T')[0] },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Create Fine</h2>

        {/* Mode toggle */}
        <div className="mb-5 flex rounded-lg border border-border p-1">
          {(['auto', 'manual'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'auto' ? 'Auto-assess (overdue)' : 'Manual entry'}
            </button>
          ))}
        </div>

        {mode === 'auto' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a borrow record ID. The system will auto-calculate the fine based on days overdue.
            </p>
            <FormField label="Borrow Record ID" required>
              <input
                type="number"
                value={assessBorrowId}
                onChange={(e) => setAssessBorrowId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 15"
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button
                type="button"
                onClick={onAssess}
                disabled={isAssessing || !assessBorrowId}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {isAssessing ? 'Assessing…' : 'Assess Fine'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount ($)" required error={errors.amount?.message}>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.amount ? 'border-destructive' : 'border-input'} bg-background`}
                />
              </FormField>
              <FormField label="Assessed Date" required error={errors.assessedDate?.message}>
                <input
                  type="date"
                  {...register('assessedDate')}
                  className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.assessedDate ? 'border-destructive' : 'border-input'} bg-background`}
                />
              </FormField>
            </div>
            <FormField label="Borrow Record ID" required error={errors.borrowedId?.message}>
              <input
                type="number"
                {...register('borrowedId', { valueAsNumber: true })}
                className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.borrowedId ? 'border-destructive' : 'border-input'} bg-background`}
                placeholder="e.g. 15"
              />
            </FormField>
            <FormField label="Reason" error={errors.reason?.message}>
              <Textarea rows={2} {...register('reason')} error={!!errors.reason} placeholder="e.g. Overdue return" />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {isPending ? 'Creating…' : 'Create Fine'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
