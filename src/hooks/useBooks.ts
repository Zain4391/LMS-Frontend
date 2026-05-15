import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as booksApi from '@/api/books'
import type { BookRequest, PaginationParams, BookStatus } from '@/types'

const KEYS = {
  all: ['books'] as const,
  list: (params?: object) => ['books', 'list', params] as const,
  detail: (id: number) => ['books', id] as const,
  byStatus: (s: BookStatus) => ['books', 'status', s] as const,
  searchTitle: (t: string, params?: object) => ['books', 'search', 'title', t, params] as const,
  searchAuthor: (a: string) => ['books', 'search', 'author', a] as const,
  byPublisher: (pid: number) => ['books', 'publisher', pid] as const,
}

export function useBooks(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => booksApi.getBooks(params) })
}

export function useBook(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => booksApi.getBookById(id), enabled: !!id })
}

export function useBooksByStatus(status: BookStatus) {
  return useQuery({ queryKey: KEYS.byStatus(status), queryFn: () => booksApi.getBooksByStatus(status) })
}

export function useSearchBooksByTitle(title: string, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.searchTitle(title, params),
    queryFn: () => booksApi.searchBooksByTitle(title, params),
    enabled: title.length > 1,
  })
}

export function useSearchBooksByAuthor(authorName: string) {
  return useQuery({
    queryKey: KEYS.searchAuthor(authorName),
    queryFn: () => booksApi.searchBooksByAuthor(authorName),
    enabled: authorName.length > 1,
  })
}

export function useBooksByPublisher(publisherId: number) {
  return useQuery({
    queryKey: KEYS.byPublisher(publisherId),
    queryFn: () => booksApi.getBooksByPublisher(publisherId),
    enabled: !!publisherId,
  })
}

export function useCreateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookRequest) => booksApi.createBook(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book created') },
    onError: () => toast.error('Failed to create book'),
  })
}

export function useUpdateBook(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookRequest) => booksApi.updateBook(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book updated') },
    onError: () => toast.error('Failed to update book'),
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => booksApi.deleteBook(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book deleted') },
    onError: () => toast.error('Failed to delete book'),
  })
}
