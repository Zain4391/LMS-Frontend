import { BookOpen, Users, BookMarked, Clock, AlertCircle, Copy } from 'lucide-react'
import { useBooks } from '@/hooks/useBooks'
import { useUsers } from '@/hooks/useUsers'
import { useBorrowsByStatus, useOverdueBorrows } from '@/hooks/useBorrows'
import { useFinesByStatus } from '@/hooks/useFines'
import { useBookCopiesByStatus } from '@/hooks/useBookCopies'

export default function StaffDashboard() {
  const { data: books } = useBooks()
  const { data: users } = useUsers()
  const { data: activeBorrows } = useBorrowsByStatus('BORROWED')
  const { data: overdue } = useOverdueBorrows()
  const { data: pendingFines } = useFinesByStatus('PENDING')
  const { data: availableCopies } = useBookCopiesByStatus('AVAILABLE')

  function count(d: unknown) {
    if (!d) return 0
    if (Array.isArray(d)) return d.length
    return (d as { totalElements?: number })?.totalElements ?? 0
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Staff Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Library overview at a glance.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Books" value={count(books)} icon={BookOpen} color="text-blue-500" />
        <StatCard label="Available Copies" value={count(availableCopies)} icon={Copy} color="text-emerald-500" />
        <StatCard label="Active Borrows" value={count(activeBorrows)} icon={BookMarked} color="text-indigo-500" />
        <StatCard label="Overdue" value={count(overdue)} icon={Clock} color="text-amber-500" />
        <StatCard label="Pending Fines" value={count(pendingFines)} icon={AlertCircle} color="text-red-500" />
        <StatCard label="Total Members" value={count(users)} icon={Users} color="text-violet-500" />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}
