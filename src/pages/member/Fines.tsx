import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react'
import { useFinesByUser } from '@/hooks/useFines'
import { useCreatePayment } from '@/hooks/usePayments'
import { useAuth } from '@/context/AuthContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Fine, FineStatus, Page } from '@/types'

const TABS: { label: string; value: FineStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Waived', value: 'WAIVED' },
]

export default function MemberFines() {
  const { user } = useAuth()
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<FineStatus | 'ALL'>('ALL')
  const [payingFine, setPayingFine] = useState<Fine | null>(null)

  const { data, isLoading } = useFinesByUser(user?.id ?? 0, params)
  const createPayment = useCreatePayment()

  const pageData = data as Page<Fine> | undefined
  const allFines: Fine[] = pageData?.content ?? []
  const fines = activeTab === 'ALL' ? allFines : allFines.filter((f) => f.status === activeTab)

  const pendingTotal = allFines
    .filter((f) => f.status === 'PENDING')
    .reduce((sum, f) => sum + f.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Fines</h1>
        {pendingTotal > 0 && (
          <p className="mt-1 text-sm text-amber-600 font-medium">
            Outstanding balance: {formatCurrency(pendingTotal)}
          </p>
        )}
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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : fines.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <p className="text-muted-foreground">
            {activeTab === 'ALL' ? "You have no fines. Keep it up!" : `No ${activeTab.toLowerCase()} fines.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((fine) => (
            <FineCard
              key={fine.id}
              fine={fine}
              onPay={() => setPayingFine(fine)}
            />
          ))}
        </div>
      )}

      {pageData && fines.length > 0 && (
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

      {/* Pay dialog */}
      {payingFine && (
        <PayFineDialog
          fine={payingFine}
          onClose={() => setPayingFine(null)}
          onPay={(method) => {
            createPayment.mutate(
              {
                fineId: payingFine.id,
                amount: payingFine.amount,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: method,
              },
              { onSuccess: () => setPayingFine(null) },
            )
          }}
          isPending={createPayment.isPending}
        />
      )}
    </div>
  )
}

function FineCard({ fine, onPay }: { fine: Fine; onPay: () => void }) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 ${
        fine.status === 'PENDING' ? 'border-amber-200 bg-amber-50/30' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            fine.status === 'PENDING' ? 'bg-amber-100' : 'bg-muted'
          }`}>
            <AlertCircle className={`h-5 w-5 ${fine.status === 'PENDING' ? 'text-amber-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium">{fine.borrowed.bookCopy.book.title}</p>
            <p className="text-xs text-muted-foreground">{fine.reason || 'Overdue return'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatCurrency(fine.amount)}</p>
          <StatusBadge value={fine.status} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">Assessed: {formatDate(fine.assessedDate)}</p>
        {fine.status === 'PENDING' && (
          <button
            onClick={onPay}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <CreditCard className="h-3.5 w-3.5" /> Pay Now
          </button>
        )}
        {fine.status === 'PAID' && (
          <Link to="/app/payments" className="text-xs text-primary hover:underline">View receipt</Link>
        )}
      </div>
    </div>
  )
}

function PayFineDialog({
  fine,
  onClose,
  onPay,
  isPending,
}: {
  fine: Fine
  onClose: () => void
  onPay: (method: 'CASH' | 'CARD' | 'ONLINE') => void
  isPending: boolean
}) {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CARD')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold">Pay Fine</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Settling fine for <strong>{fine.borrowed.bookCopy.book.title}</strong>
        </p>

        <div className="mb-5 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Amount due</span>
          <span className="text-xl font-bold">{formatCurrency(fine.amount)}</span>
        </div>

        <p className="mb-3 text-sm font-medium">Payment method</p>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {(['CASH', 'CARD', 'ONLINE'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-md border border-border py-2.5 text-sm hover:bg-muted">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPay(method)}
            disabled={isPending}
            className="flex-1 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Processing…' : `Pay ${formatCurrency(fine.amount)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
