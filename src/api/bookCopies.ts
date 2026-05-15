import { api } from '@/lib/axios'
import type { BookCopy, BookCopyRequest, Page, PaginationParams, BookCopyStatus } from '@/types'

export async function getBookCopies(params?: PaginationParams & { paginated?: boolean }): Promise<BookCopy[] | Page<BookCopy>> {
  const res = await api.get('/api/book-copies', { params })
  return res.data
}

export async function getBookCopyById(id: number): Promise<BookCopy> {
  const res = await api.get<BookCopy>(`/api/book-copies/${id}`)
  return res.data
}

export async function getBookCopyByBarcode(barcode: string): Promise<BookCopy> {
  const res = await api.get<BookCopy>(`/api/book-copies/barcode/${barcode}`)
  return res.data
}

export async function getBookCopiesByBook(bookId: number, params?: PaginationParams): Promise<BookCopy[] | Page<BookCopy>> {
  const res = await api.get(`/api/book-copies/book/${bookId}`, { params })
  return res.data
}

export async function getBookCopiesByStatus(status: BookCopyStatus): Promise<BookCopy[]> {
  const res = await api.get<BookCopy[]>(`/api/book-copies/status/${status}`)
  return res.data
}

export async function createBookCopy(data: BookCopyRequest): Promise<BookCopy> {
  const res = await api.post<BookCopy>('/api/book-copies', data)
  return res.data
}

export async function updateBookCopy(id: number, data: BookCopyRequest): Promise<BookCopy> {
  const res = await api.put<BookCopy>(`/api/book-copies/${id}`, data)
  return res.data
}

export async function deleteBookCopy(id: number): Promise<void> {
  await api.delete(`/api/book-copies/${id}`)
}
