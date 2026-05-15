import { api } from '@/lib/axios'
import type { Book, BookRequest, Page, PaginationParams, BookStatus } from '@/types'

export async function getBooks(params?: PaginationParams & { paginated?: boolean }): Promise<Book[] | Page<Book>> {
  const res = await api.get('/api/books', { params })
  return res.data
}

export async function getBookById(id: number): Promise<Book> {
  const res = await api.get<Book>(`/api/books/${id}`)
  return res.data
}

export async function getBookByIsbn(isbn: string): Promise<Book> {
  const res = await api.get<Book>(`/api/books/isbn/${isbn}`)
  return res.data
}

export async function searchBooksByTitle(title: string, params?: PaginationParams): Promise<Book[] | Page<Book>> {
  const res = await api.get('/api/books/search/title', { params: { title, ...params } })
  return res.data
}

export async function searchBooksByAuthor(authorName: string): Promise<Book[]> {
  const res = await api.get<Book[]>('/api/books/search/author', { params: { authorName } })
  return res.data
}

export async function getBooksByStatus(status: BookStatus): Promise<Book[]> {
  const res = await api.get<Book[]>(`/api/books/status/${status}`)
  return res.data
}

export async function getBooksByPublisher(publisherId: number): Promise<Book[]> {
  const res = await api.get<Book[]>(`/api/books/publisher/${publisherId}`)
  return res.data
}

export async function createBook(data: BookRequest): Promise<Book> {
  const res = await api.post<Book>('/api/books', data)
  return res.data
}

export async function updateBook(id: number, data: BookRequest): Promise<Book> {
  const res = await api.put<Book>(`/api/books/${id}`, data)
  return res.data
}

export async function deleteBook(id: number): Promise<void> {
  await api.delete(`/api/books/${id}`)
}
