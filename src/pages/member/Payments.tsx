import { useState } from 'react'
import { CreditCard, CheckCircle } from 'lucide-react'
import { usePaymentsByUser } from '@/hooks/usePayments'
import { useAuth } from '@/context/AuthContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Payment, PaymentStatus, Page } from '@/types'

const TABS: { label: string; value: PaymentStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
]

export default function MemberPayments() {
  const { user } = useAuth()
  const { params, goToPage } = usePagination()
  const [activeTab, setActiveTab] = useState<PaymentStatus | 'ALL'>('ALL')

  const { data, isLoading } = usePaymentsByUser(user?.id ?? 0, params)

  const pageData = data as Page<Payment> | undefined
  const allPayments: Payment[] = pageData?.content ?? []
  const payments = activeTab === 'ALL' ? allPayments : allPayments.filter((p) => p.status === activeTab)

  const totalPaid = allPayments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Payment History</h1>
        {totalPaid > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            Total paid: <span className="font-medium text-foreground">{formatCurrency(totalPaid)}</span>
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
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="py-16 text-center">
          <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {activeTab === 'ALL' ? 'No payment history yet.' : `No ${activeTab.toLowerCase()} payments.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          {payments.map((payment, idx) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              isLast={idx === payments.length - 1}
            />
          ))}
        </div>
      )}

      {pageData && payments.length > 0 && (
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
    </div>
  )
}

function PaymentRow({ payment, isLast }: { payment: Payment; isLast: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-border' : ''}`}>
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        payment.status === 'COMPLETED' ? 'bg-emerald-100' : 'bg-muted'
      }`}>
        {payment.status === 'COMPLETED'
          ? <CheckCircle className="h-4 w-4 text-emerald-600" />
          : <CreditCard className="h-4 w-4 text-muted-foreground" />
        }
      </div>

      {/* Book title */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-sm">{payment.fine.borrowed.bookCopy.book.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(payment.paymentDate)}
          {payment.transactionId && <span className="ml-2 font-mono">· {payment.transactionId}</span>}
        </p>
      </div>

      {/* Method + status */}
      <div className="flex items-center gap-2">
        <StatusBadge value={payment.paymentMethod} />
        <StatusBadge value={payment.status} />
      </div>

      {/* Amount */}
      <p className={`shrink-0 font-semibold ${payment.status === 'COMPLETED' ? 'text-foreground' : 'text-muted-foreground'}`}>
        {formatCurrency(payment.amount)}
      </p>
    </div>
  )
}
