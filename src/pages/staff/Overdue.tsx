import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, AlertTriangle } from 'lucide-react'
import { useOverdueBorrows, useReturnBorrow } from '@/hooks/useBorrows'
import { useAssessFine } from '@/hooks/useFines'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, getDaysOverdue } from '@/lib/utils'
import type { Borrowed, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function StaffOverdue() {
  const { params, goToPage } = usePagination()
  const { data, isLoading } = useOverdueBorrows(params)
  const returnBorrow = useReturnBorrow()
  const assessFine = useAssessFine()

  const [returnTarget, setReturnTarget] = useState<Borrowed | null>(null)
  const [assessTarget, setAssessTarget] = useState<Borrowed | null>(null)

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
      cell: ({ getValue }) => (
        <span className="font-medium text-red-600">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      header: 'Days Overdue',
      id: 'daysOverdue',
      cell: ({ row }) => {
        const days = getDaysOverdue(row.original.dueDate)
        return (
          <span className="flex items-center gap-1.5 font-semibold text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        )
      },
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
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAssessTarget(b)}
              className="flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              Assess Fine
            </button>
            <button
              onClick={() => setReturnTarget(b)}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Return
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <PageShell
      title="Overdue Borrows"
      description={pageData ? `${pageData.totalElements} overdue record${pageData.totalElements !== 1 ? 's' : ''}` : ''}
      action={
        <Link
          to="/staff/borrowed"
          className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          All Borrows
        </Link>
      }
    >
      {/* Summary banner */}
      {!isLoading && borrows.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>{pageData?.totalElements ?? 0}</strong> overdue borrow{(pageData?.totalElements ?? 0) !== 1 ? 's' : ''} require attention.
            Use <strong>Assess Fine</strong> to auto-calculate the fine, then <strong>Return</strong> to close the borrow.
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={borrows}
        isLoading={isLoading}
        emptyMessage="No overdue borrows. Everything is on time!"
      />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      {/* Assess fine confirm */}
      <ConfirmDialog
        open={!!assessTarget}
        title="Assess fine"
        description={`Auto-calculate and create a fine for "${assessTarget?.bookCopy.book.title}" borrowed by ${assessTarget?.user.name}? The fine is based on days overdue.`}
        confirmLabel="Assess Fine"
        loading={assessFine.isPending}
        onConfirm={() =>
          assessTarget && assessFine.mutate(assessTarget.id, { onSuccess: () => setAssessTarget(null) })
        }
        onCancel={() => setAssessTarget(null)}
      />

      {/* Return confirm */}
      <ConfirmDialog
        open={!!returnTarget}
        title="Mark as returned"
        description={`Mark "${returnTarget?.bookCopy.book.title}" as returned? Make sure a fine has been assessed first if needed.`}
        confirmLabel="Return"
        loading={returnBorrow.isPending}
        onConfirm={() =>
          returnTarget && returnBorrow.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) })
        }
        onCancel={() => setReturnTarget(null)}
      />
    </PageShell>
  )
}
