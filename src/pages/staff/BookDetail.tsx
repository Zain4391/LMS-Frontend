import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { useBook } from '@/hooks/useBooks'
import { useBookCopiesByBook } from '@/hooks/useBookCopies'
import { PageShell } from '@/components/shared/PageShell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable } from '@/components/shared/DataTable'
import { formatDate } from '@/lib/utils'
import type { BookCopy } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function StaffBookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: book, isLoading } = useBook(Number(id))
  const { data: copiesData } = useBookCopiesByBook(Number(id))
  const copies: BookCopy[] = Array.isArray(copiesData)
    ? (copiesData as BookCopy[])
    : ((copiesData as { content?: BookCopy[] })?.content ?? [])

  const copyColumns: ColumnDef<BookCopy, unknown>[] = [
    { header: 'Barcode', accessorKey: 'barcode' },
    { header: 'Condition', accessorKey: 'condition', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    { header: 'Location', accessorKey: 'location', cell: ({ getValue }) => (getValue() as string) || '—' },
    { header: 'Acquired', accessorKey: 'acquisitionDate', cell: ({ getValue }) => formatDate(getValue() as string) },
  ]

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  if (!book) return <p className="text-muted-foreground">Book not found.</p>

  return (
    <PageShell
      title={book.title}
      action={
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Link to={`/staff/books/${id}/edit`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </div>
      }
    >
      {/* Meta grid */}
      <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Meta label="ISBN" value={book.isbn} />
        <Meta label="Status" value={<StatusBadge value={book.status} />} />
        <Meta label="Language" value={book.language || '—'} />
        <Meta label="Pages" value={book.pageCount?.toString() || '—'} />
        <Meta label="Published" value={formatDate(book.publicationDate)} />
        <Meta label="Publisher" value={book.publisher?.name || '—'} />
        <Meta
          label="Authors"
          value={book.authors.length ? book.authors.map((a) => a.name).join(', ') : '—'}
        />
        <Meta
          label="Genres"
          value={
            book.genres.length ? (
              <div className="flex flex-wrap gap-1">
                {book.genres.map((g) => (
                  <span key={g.id} className="rounded bg-muted px-1.5 py-0.5 text-xs">{g.name}</span>
                ))}
              </div>
            ) : '—'
          }
        />
      </div>

      {book.description && (
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">Description</h3>
          <p className="text-sm leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Copies */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Copies <span className="ml-1 text-muted-foreground text-sm">({copies.length})</span></h3>
        <Link
          to="/staff/book-copies"
          className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" /> Add Copy
        </Link>
      </div>
      <DataTable columns={copyColumns} data={copies} emptyMessage="No copies found for this book." />
    </PageShell>
  )
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  )
}
