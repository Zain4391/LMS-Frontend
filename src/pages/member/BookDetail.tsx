import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { useBook } from '@/hooks/useBooks'
import { useBookCopiesByBook } from '@/hooks/useBookCopies'
import { useCreateBorrow } from '@/hooks/useBorrows'
import { useAuth } from '@/context/AuthContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { BookCopy, Page } from '@/types'

export default function MemberBookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: book, isLoading } = useBook(Number(id))
  const { data: copiesData } = useBookCopiesByBook(Number(id))
  const borrowMutation = useCreateBorrow()

  const copies: BookCopy[] = Array.isArray(copiesData)
    ? (copiesData as BookCopy[])
    : ((copiesData as Page<BookCopy>)?.content ?? [])

  const availableCopies = copies.filter((c) => c.status === 'AVAILABLE')

  // Derive display status from actual copy availability once copies are loaded
  const displayStatus = copiesData !== undefined
    ? (availableCopies.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE')
    : book?.status ?? 'AVAILABLE'

  function handleBorrow(copyId: number) {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    borrowMutation.mutate({ userId: user.id, bookCopyId: copyId, borrowDate: today })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}
      </div>
    )
  }

  if (!book) return <p className="text-muted-foreground">Book not found.</p>

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to books
      </button>

      <div className="mb-8 flex gap-6">
        <div className="flex h-36 w-28 shrink-0 items-center justify-center rounded-xl bg-muted text-5xl">
          📖
        </div>
        <div>
          <h1 className="mb-1 text-2xl font-semibold leading-tight">{book.title}</h1>
          <p className="mb-2 text-muted-foreground">
            {book.authors.map((a) => a.name).join(', ') || 'Unknown author'}
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={displayStatus} />
            {book.genres.map((g) => (
              <span key={g.id} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{g.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetaItem label="ISBN" value={book.isbn} />
        <MetaItem label="Publisher" value={book.publisher?.name || '—'} />
        <MetaItem label="Published" value={formatDate(book.publicationDate)} />
        <MetaItem label="Pages" value={book.pageCount?.toString() || '—'} />
      </div>

      {book.description && (
        <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="mb-2 text-sm font-medium">About this book</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{book.description}</p>
        </div>
      )}

      {/* Borrow section */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold">Borrow a Copy</h3>
        {availableCopies.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            No copies available right now.
          </div>
        ) : (
          <div className="space-y-2">
            {availableCopies.map((copy) => (
              <div
                key={copy.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="text-sm">
                  <span className="font-medium">Barcode {copy.barcode}</span>
                  {copy.location && <span className="ml-3 text-muted-foreground">· {copy.location}</span>}
                  <span className="ml-3"><StatusBadge value={copy.condition} /></span>
                </div>
                <button
                  onClick={() => handleBorrow(copy.id)}
                  disabled={borrowMutation.isPending}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {borrowMutation.isPending ? 'Borrowing…' : 'Borrow'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  )
}
