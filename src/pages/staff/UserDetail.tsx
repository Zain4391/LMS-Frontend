import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useUser } from '@/hooks/useUsers'
import { useBorrowsByUser } from '@/hooks/useBorrows'
import { useFinesByUser } from '@/hooks/useFines'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { PageShell } from '@/components/shared/PageShell'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Borrowed, Fine, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function StaffUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = Number(id)

  const { data: user, isLoading } = useUser(userId)
  const { data: borrowsData } = useBorrowsByUser(userId)
  const { data: finesData } = useFinesByUser(userId)

  const borrows: Borrowed[] = Array.isArray(borrowsData)
    ? (borrowsData as Borrowed[])
    : ((borrowsData as Page<Borrowed>)?.content ?? [])

  const fines: Fine[] = Array.isArray(finesData)
    ? (finesData as Fine[])
    : ((finesData as Page<Fine>)?.content ?? [])

  const activeBorrows = borrows.filter((b) => b.status === 'BORROWED' || b.status === 'OVERDUE')
  const pendingFines = fines.filter((f) => f.status === 'PENDING')
  const totalOwed = pendingFines.reduce((s, f) => s + f.amount, 0)

  const borrowColumns: ColumnDef<Borrowed, unknown>[] = [
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
    { header: 'Borrowed', accessorKey: 'borrowDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    {
      header: 'Due',
      accessorKey: 'dueDate',
      cell: ({ row }) => (
        <span className={row.original.status === 'OVERDUE' ? 'font-medium text-red-600' : ''}>
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    { header: 'Returned', accessorKey: 'returnDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
  ]

  const fineColumns: ColumnDef<Fine, unknown>[] = [
    {
      header: 'Book',
      id: 'book',
      cell: ({ row }) => row.original.borrowed.bookCopy.book.title,
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue() as number)}</span>,
    },
    { header: 'Assessed', accessorKey: 'assessedDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    { header: 'Reason', accessorKey: 'reason', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  if (!user) return <p className="text-muted-foreground">Member not found.</p>

  return (
    <PageShell
      title={user.name}
      action={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      }
    >
      {/* Profile card */}
      <div className="mb-8 grid grid-cols-2 gap-6 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
        <MetaItem label="Email" value={user.email} />
        <MetaItem label="Phone" value={user.phoneNumber} />
        <MetaItem label="Member Since" value={formatDate(user.membershipDate)} />
        <MetaItem label="Address" value={user.address} />
        <MetaItem label="Status" value={<StatusBadge value={user.status} />} />
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Active Borrows" value={activeBorrows.length} color="text-blue-500" />
        <StatCard label="Pending Fines" value={pendingFines.length} color="text-amber-500" />
        <StatCard label="Amount Owed" value={formatCurrency(totalOwed)} color="text-red-500" isText />
      </div>

      {/* Borrow history */}
      <section className="mb-8">
        <h3 className="mb-3 font-semibold">
          Borrow History <span className="ml-1 text-sm font-normal text-muted-foreground">({borrows.length})</span>
        </h3>
        <DataTable
          columns={borrowColumns}
          data={borrows}
          emptyMessage="No borrow history for this member."
        />
      </section>

      {/* Fine history */}
      <section>
        <h3 className="mb-3 font-semibold">
          Fines <span className="ml-1 text-sm font-normal text-muted-foreground">({fines.length})</span>
        </h3>
        <DataTable
          columns={fineColumns}
          data={fines}
          emptyMessage="No fines for this member."
        />
      </section>
    </PageShell>
  )
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  )
}

function StatCard({ label, value, color, isText }: { label: string; value: string | number; color: string; isText?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 ${isText ? 'text-xl' : 'text-3xl'} font-bold ${color}`}>{value}</p>
    </div>
  )
}
