import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as copiesApi from '@/api/bookCopies'
import type { BookCopyRequest, PaginationParams, BookCopyStatus } from '@/types'

const KEYS = {
  all: ['book-copies'] as const,
  list: (params?: object) => ['book-copies', 'list', params] as const,
  detail: (id: number) => ['book-copies', id] as const,
  byBook: (bookId: number, params?: object) => ['book-copies', 'book', bookId, params] as const,
  byStatus: (s: BookCopyStatus) => ['book-copies', 'status', s] as const,
  byBarcode: (b: string) => ['book-copies', 'barcode', b] as const,
}

export function useBookCopies(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => copiesApi.getBookCopies(params) })
}

export function useBookCopy(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => copiesApi.getBookCopyById(id), enabled: !!id })
}

export function useBookCopyByBarcode(barcode: string) {
  return useQuery({
    queryKey: KEYS.byBarcode(barcode),
    queryFn: () => copiesApi.getBookCopyByBarcode(barcode),
    enabled: barcode.length > 2,
  })
}

export function useBookCopiesByBook(bookId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byBook(bookId, params),
    queryFn: () => copiesApi.getBookCopiesByBook(bookId, params),
    enabled: !!bookId,
  })
}

export function useBookCopiesByStatus(status: BookCopyStatus) {
  return useQuery({ queryKey: KEYS.byStatus(status), queryFn: () => copiesApi.getBookCopiesByStatus(status) })
}

export function useCreateBookCopy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookCopyRequest) => copiesApi.createBookCopy(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book copy created') },
    onError: () => toast.error('Failed to create book copy'),
  })
}

export function useUpdateBookCopy(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookCopyRequest) => copiesApi.updateBookCopy(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book copy updated') },
    onError: () => toast.error('Failed to update book copy'),
  })
}

export function useDeleteBookCopy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => copiesApi.deleteBookCopy(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book copy deleted') },
    onError: () => toast.error('Failed to delete book copy'),
  })
}
