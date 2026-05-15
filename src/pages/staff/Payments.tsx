import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Zap } from 'lucide-react'
import {
  usePayments,
  usePaymentsByStatus,
  usePaymentsByMethod,
  useCreatePayment,
  useDeletePayment,
  useProcessPayment,
} from '@/hooks/usePayments'
import { paymentSchema, type PaymentFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FormField } from '@/components/shared/FormField'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Payment, PaymentStatus, PaymentMethod, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_TABS: { label: string; value: PaymentStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
]

const METHOD_OPTIONS: { label: string; value: PaymentMethod | '' }[] = [
  { label: 'All methods', value: '' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Card', value: 'CARD' },
  { label: 'Online', value: 'ONLINE' },
]

export default function StaffPayments() {
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<PaymentStatus | 'ALL'>('ALL')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [processTarget, setProcessTarget] = useState<Payment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null)

  const allPayments = usePayments(params)
  const byStatus = usePaymentsByStatus(activeTab as PaymentStatus, params)
  const byMethod = usePaymentsByMethod(methodFilter as PaymentMethod, params)

  let queryResult = allPayments
  if (methodFilter) queryResult = byMethod
  else if (activeTab !== 'ALL') queryResult = byStatus

  const { data, isLoading } = queryResult
  const create = useCreatePayment()
  const del = useDeletePayment()
  const process = useProcessPayment()

  const pageData = data as Page<Payment> | undefined
  const payments: Payment[] = pageData?.content ?? []

  const columns: ColumnDef<Payment, unknown>[] = [
    {
      header: 'Transaction ID',
      accessorKey: 'transactionId',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{(getValue() as string) || '—'}</span>
      ),
    },
    {
      header: 'Fine / Member',
      id: 'fine',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.fine.borrowed.user.name}</p>
          <p className="text-xs text-muted-foreground">Fine #{row.original.fine.id}</p>
        </div>
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
      header: 'Method',
      accessorKey: 'paymentMethod',
      cell: ({ getValue }) => <StatusBadge value={getValue() as string} />,
    },
    {
      header: 'Date',
      accessorKey: 'paymentDate',
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
        const p = row.original
        return (
          <div className="flex justify-end gap-2">
            {(p.status === 'PENDING' || p.status === 'PROCESSING') && (
              <button
                onClick={() => setProcessTarget(p)}
                className="flex items-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <Zap className="h-3.5 w-3.5" /> Process
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(p)}
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
      title="Payments"
      description={pageData ? `${pageData.totalElements} total records` : ''}
      action={
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Record Payment
        </button>
      }
    >
      {/* Filters row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setActiveTab(t.value); setMethodFilter(''); goToPage(0) }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === t.value && !methodFilter
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value as PaymentMethod | ''); setActiveTab('ALL'); goToPage(0) }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={payments} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      {showCreateDialog && (
        <CreatePaymentDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(d) => create.mutate(d, { onSuccess: () => setShowCreateDialog(false) })}
          isPending={create.isPending}
        />
      )}

      <ConfirmDialog
        open={!!processTarget}
        title="Process payment"
        description={`Initiate processing for payment of ${formatCurrency(processTarget?.amount ?? 0)}?`}
        confirmLabel="Process"
        loading={process.isPending}
        onConfirm={() => processTarget && process.mutate(processTarget.id, { onSuccess: () => setProcessTarget(null) })}
        onCancel={() => setProcessTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete payment"
        description="This will permanently remove this payment record. This cannot be undone."
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}

function CreatePaymentDialog({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void
  onCreate: (d: PaymentFormValues) => void
  isPending: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: { paymentDate: new Date().toISOString().split('T')[0] },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Record Payment</h2>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <FormField label="Fine ID" required error={errors.fineId?.message}>
            <input
              type="number"
              {...register('fineId', { valueAsNumber: true })}
              className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.fineId ? 'border-destructive' : 'border-input'} bg-background`}
              placeholder="e.g. 3"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount ($)" required error={errors.amount?.message}>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.amount ? 'border-destructive' : 'border-input'} bg-background`}
              />
            </FormField>
            <FormField label="Payment Date" required error={errors.paymentDate?.message}>
              <input
                type="date"
                {...register('paymentDate')}
                className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.paymentDate ? 'border-destructive' : 'border-input'} bg-background`}
              />
            </FormField>
          </div>
          <FormField label="Payment Method" required error={errors.paymentMethod?.message}>
            <select
              {...register('paymentMethod')}
              className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.paymentMethod ? 'border-destructive' : 'border-input'} bg-background`}
            >
              <option value="">Select method…</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </select>
          </FormField>
          <FormField label="Transaction ID" error={errors.transactionId?.message}>
            <input
              {...register('transactionId')}
              className={`h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${errors.transactionId ? 'border-destructive' : 'border-input'} bg-background`}
              placeholder="Optional — external reference"
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {isPending ? 'Recording…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
