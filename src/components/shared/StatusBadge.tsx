const map: Record<string, string> = {
  // User / Librarian
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  // Book
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  UNAVAILABLE: 'bg-red-100 text-red-600',
  // Book Copy
  BORROWED: 'bg-amber-100 text-amber-700',
  // Borrow
  RETURNED: 'bg-sky-100 text-sky-700',
  OVERDUE: 'bg-red-100 text-red-700',
  // Fine
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  WAIVED: 'bg-gray-100 text-gray-500',
  // Payment
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-purple-100 text-purple-700',
  // Copy condition
  NEW: 'bg-emerald-100 text-emerald-700',
  GOOD: 'bg-sky-100 text-sky-700',
  FAIR: 'bg-amber-100 text-amber-700',
  POOR: 'bg-red-100 text-red-600',
  // Librarian role
  ADMIN: 'bg-violet-100 text-violet-700',
  STAFF: 'bg-blue-100 text-blue-700',
}

export function StatusBadge({ value }: { value: string }) {
  const cls = map[value] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  )
}
