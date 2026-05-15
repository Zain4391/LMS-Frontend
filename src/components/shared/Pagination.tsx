import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (p: number) => void
}

export function Pagination({ page, totalPages, totalElements, size, onPageChange }: Props) {
  if (totalPages <= 1) return null
  const start = page * size + 1
  const end = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex items-center justify-between border-t border-border px-1 pt-4">
      <span className="text-sm text-muted-foreground">
        {start}–{end} of {totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((i) => Math.abs(i - page) <= 2)
          .map((i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${
                i === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
