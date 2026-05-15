import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { useBooks, useDeleteBook } from '@/hooks/useBooks'
import { PageShell } from '@/components/shared/PageShell'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils'
import type { Book, Page } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function StaffBooks() {
  const { params, goToPage } = usePagination()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)

  const { data, isLoading } = useBooks(params)
  const del = useDeleteBook()

  const pageData = data as Page<Book> | undefined
  const books: Book[] = pageData?.content ?? []
  const filtered = debouncedSearch
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          b.isbn.includes(debouncedSearch) ||
          b.authors.some((a) => a.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : books

  const columns: ColumnDef<Book, unknown>[] = [
    {
      header: 'Title',
      id: 'title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium leading-snug">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.isbn}</p>
        </div>
      ),
    },
    {
      header: 'Authors',
      id: 'authors',
      cell: ({ row }) => row.original.authors.map((a) => a.name).join(', ') || '—',
    },
    {
      header: 'Publisher',
      id: 'publisher',
      cell: ({ row }) => row.original.publisher?.name || '—',
    },
    {
      header: 'Genres',
      id: 'genres',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genres.map((g) => (
            <span key={g.id} className="rounded bg-muted px-1.5 py-0.5 text-xs">{g.name}</span>
          ))}
        </div>
      ),
    },
    { header: 'Published', accessorKey: 'publicationDate', cell: ({ getValue }) => formatDate(getValue() as string) },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge value={getValue() as string} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Link to={`/staff/books/${row.original.id}`} className="text-muted-foreground hover:text-foreground">
            <Eye className="h-4 w-4" />
          </Link>
          <Link to={`/staff/books/${row.original.id}/edit`} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </Link>
          <button onClick={() => setDeleteTarget(row.original)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Books"
      description={pageData ? `${pageData.totalElements} books total` : ''}
      action={
        <Link
          to="/staff/books/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Book
        </Link>
      }
    >
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, ISBN, or author…" className="max-w-sm" />
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      {pageData && (
        <Pagination
          page={pageData.number}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          size={pageData.size}
          onPageChange={goToPage}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete book"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={del.isPending}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
        onCancel={() => setDeleteTarget(null)}
      />
    </PageShell>
  )
}
