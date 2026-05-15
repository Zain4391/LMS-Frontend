import { useAuth } from '@/context/AuthContext'
import { useBorrowsByUser } from '@/hooks/useBorrows'
import { useFinesByUser } from '@/hooks/useFines'
import { BookMarked, AlertCircle, Clock } from 'lucide-react'

export default function MemberDashboard() {
  const { user } = useAuth()
  const { data: borrows } = useBorrowsByUser(user?.id ?? 0, { paginated: false } as never)
  const { data: fines } = useFinesByUser(user?.id ?? 0, { paginated: false } as never)

  const borrowList: { status?: string }[] = Array.isArray(borrows)
    ? (borrows as { status?: string }[])
    : ((borrows as { content?: { status?: string }[] })?.content ?? [])
  const fineList: { status?: string }[] = Array.isArray(fines)
    ? (fines as { status?: string }[])
    : ((fines as { content?: { status?: string }[] })?.content ?? [])

  const activeBorrows = borrowList.filter((b) => b.status === 'BORROWED').length
  const overdueBorrows = borrowList.filter((b) => b.status === 'OVERDUE').length
  const pendingFines = fineList.filter((f) => f.status === 'PENDING').length

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mb-6 text-muted-foreground text-sm">Here's your library summary.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Borrows" value={activeBorrows} icon={BookMarked} color="text-blue-500" />
        <StatCard label="Overdue" value={overdueBorrows} icon={Clock} color="text-amber-500" />
        <StatCard label="Pending Fines" value={pendingFines} icon={AlertCircle} color="text-red-500" />
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
