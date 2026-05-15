import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBooks } from '@/hooks/useBooks'
import { useGenres } from '@/hooks/useGenres'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import type { Book, Page, Genre } from '@/types'

export default function MemberBooks() {
  const { params, goToPage } = usePagination({ initialSize: 12 })
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<number | ''>('')
  const debouncedSearch = useDebounce(search)

  const { data, isLoading } = useBooks(params)
  const { data: genres = [] } = useGenres()

  const pageData = data as Page<Book> | undefined
  let books: Book[] = pageData?.content ?? []

  if (debouncedSearch) {
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.authors.some((a) => a.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        b.isbn.includes(debouncedSearch),
    )
  }
  if (genreFilter) {
    books = books.filter((b) => b.genres.some((g) => g.id === genreFilter))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Browse Books</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pageData ? `${pageData.totalElements} books in the library` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, author, or ISBN…"
          className="max-w-xs flex-1"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value ? Number(e.target.value) : '')}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All genres</option>
          {(genres as Genre[]).map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No books match your search.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/app/books/${book.id}`}
              className="group flex flex-col rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted text-4xl">
                📖
              </div>
              <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                {book.title}
              </h3>
              <p className="mb-2 text-xs text-muted-foreground line-clamp-1">
                {book.authors.map((a) => a.name).join(', ') || 'Unknown author'}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <StatusBadge value={book.status} />
                {book.language && (
                  <span className="text-xs text-muted-foreground">{book.language}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {pageData && (
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
