import { useState } from 'react'
import type { PaginationParams } from '@/types'

interface UsePaginationOptions {
  initialPage?: number
  initialSize?: number
  initialSortBy?: string
  initialSortDirection?: 'asc' | 'desc'
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 0,
    initialSize = 10,
    initialSortBy,
    initialSortDirection = 'asc',
  } = options

  const [page, setPage] = useState(initialPage)
  const [size] = useState(initialSize)
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)

  const params: PaginationParams & { paginated: boolean } = {
    page,
    size,
    sortBy,
    sortDirection,
    paginated: true,
  }

  function goToPage(p: number) {
    setPage(p)
  }

  function toggleSort(column: string) {
    if (sortBy === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
    setPage(0)
  }

  return { page, size, sortBy, sortDirection, params, goToPage, toggleSort }
}
