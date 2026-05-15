import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, BookOpen, Clock, CheckCircle } from 'lucide-react'
import { useBorrowsByUser, useReturnBorrow } from '@/hooks/useBorrows'
import { useAuth } from '@/context/AuthContext'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, getDaysOverdue } from '@/lib/utils'
import type { Borrowed, BorrowStatus, Page } from '@/types'

const TABS: { label: string; value: BorrowStatus | 'ALL'; icon: React.ElementType }[] = [
  { label: 'All', value: 'ALL', icon: BookOpen },
  { label: 'Active', value: 'BORROWED', icon: Clock },
  { label: 'Overdue', value: 'OVERDUE', icon: Clock },
  { label: 'Returned', value: 'RETURNED', icon: CheckCircle },
]

export default function MemberBorrows() {
  const { user } = useAuth()
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<BorrowStatus | 'ALL'>('ALL')
  const [returnTarget, setReturnTarget] = useState<Borrowed | null>(null)

  const { data, isLoading } = useBorrowsByUser(user?.id ?? 0, params)
  const returnBorrow = useReturnBorrow()

  const pageData = data as Page<Borrowed> | undefined
  const allBorrows: Borrowed[] = pageData?.content ?? []

  const filtered =
    activeTab === 'ALL' ? allBorrows : allBorrows.filter((b) => b.status === activeTab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Borrows</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pageData ? `${pageData.totalElements} total borrow records` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === value
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No borrow records found.</p>
          {activeTab === 'ALL' && (
            <Link to="/app/books" className="mt-3 inline-block text-sm text-primary hover:underline">
              Browse books to borrow one
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((borrow) => (
            <BorrowCard
              key={borrow.id}
              borrow={borrow}
              onReturn={() => setReturnTarget(borrow)}
            />
          ))}
        </div>
      )}

      {pageData && filtered.length > 0 && (
        <div className="mt-6">
          <Pagination
            page={pageData.number}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            size={pageData.size}
            onPageChange={goToPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!returnTarget}
        title="Return book"
        description={`Return "${returnTarget?.bookCopy.book.title}"? Please make sure you have the physical book ready to hand back.`}
        confirmLabel="Confirm Return"
        loading={returnBorrow.isPending}
        onConfirm={() =>
          returnTarget && returnBorrow.mutate(returnTarget.id, { onSuccess: () => setReturnTarget(null) })
        }
        onCancel={() => setReturnTarget(null)}
      />
    </div>
  )
}

function BorrowCard({ borrow, onReturn }: { borrow: Borrowed; onReturn: () => void }) {
  const isActive = borrow.status === 'BORROWED' || borrow.status === 'OVERDUE'
  const daysOverdue = borrow.status === 'OVERDUE' ? getDaysOverdue(borrow.dueDate) : 0

  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        borrow.status === 'OVERDUE' ? 'border-red-200 bg-red-50/30' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Book info */}
        <div className="flex gap-3">
          <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
            📖
          </div>
          <div>
            <h3 className="font-medium leading-snug">{borrow.bookCopy.book.title}</h3>
            <p className="text-xs text-muted-foreground">
              {borrow.bookCopy.book.authors?.map((a) => a.name).join(', ') || 'Unknown author'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Barcode: {borrow.bookCopy.barcode}
            </p>
          </div>
        </div>

        {/* Status */}
        <StatusBadge value={borrow.status} />
      </div>

      {/* Date row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Borrowed: <strong className="text-foreground">{formatDate(borrow.borrowDate)}</strong></span>
        <span>Due: <strong className={borrow.status === 'OVERDUE' ? 'text-red-600' : 'text-foreground'}>{formatDate(borrow.dueDate)}</strong></span>
        {borrow.returnDate && (
          <span>Returned: <strong className="text-foreground">{formatDate(borrow.returnDate)}</strong></span>
        )}
        {daysOverdue > 0 && (
          <span className="font-semibold text-red-600">{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</span>
        )}
      </div>

      {/* Return action */}
      {isActive && (
        <div className="mt-3">
          <button
            onClick={onReturn}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Return this book
          </button>
        </div>
      )}
    </div>
  )
}
