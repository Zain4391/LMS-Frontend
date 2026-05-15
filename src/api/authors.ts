import { api } from '@/lib/axios'
import type { Author, AuthorRequest } from '@/types'

export async function getAuthors(): Promise<Author[]> {
  const res = await api.get<Author[]>('/api/authors')
  return res.data
}

export async function getAuthorById(id: number): Promise<Author> {
  const res = await api.get<Author>(`/api/authors/${id}`)
  return res.data
}

export async function createAuthor(data: AuthorRequest): Promise<Author> {
  const res = await api.post<Author>('/api/authors', data)
  return res.data
}

export async function updateAuthor(id: number, data: AuthorRequest): Promise<Author> {
  const res = await api.put<Author>(`/api/authors/${id}`, data)
  return res.data
}

export async function deleteAuthor(id: number): Promise<void> {
  await api.delete(`/api/authors/${id}`)
}
