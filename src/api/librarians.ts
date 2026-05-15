import { api } from '@/lib/axios'
import type { Librarian, LibrarianRequest, ChangePasswordRequest, Page, PaginationParams, LibrarianRole, LibrarianStatus } from '@/types'

export async function getLibrarians(params?: PaginationParams & { paginated?: boolean }): Promise<Librarian[] | Page<Librarian>> {
  const res = await api.get('/api/librarians', { params })
  return res.data
}

export async function getMyLibrarian(): Promise<Librarian> {
  const res = await api.get<Librarian>('/api/librarians/me')
  return res.data
}

export async function changeMyLibrarianPassword(data: ChangePasswordRequest): Promise<void> {
  await api.post('/api/librarians/me/change-password', data)
}

export async function getLibrarianById(id: number): Promise<Librarian> {
  const res = await api.get<Librarian>(`/api/librarians/${id}`)
  return res.data
}

export async function getLibrarianByEmail(email: string): Promise<Librarian> {
  const res = await api.get<Librarian>(`/api/librarians/email/${email}`)
  return res.data
}

export async function getLibrariansByRole(role: LibrarianRole): Promise<Librarian[]> {
  const res = await api.get<Librarian[]>(`/api/librarians/role/${role}`)
  return res.data
}

export async function getLibrariansByStatus(status: LibrarianStatus): Promise<Librarian[]> {
  const res = await api.get<Librarian[]>(`/api/librarians/status/${status}`)
  return res.data
}

export async function createLibrarian(data: LibrarianRequest): Promise<Librarian> {
  const res = await api.post<Librarian>('/api/librarians', data)
  return res.data
}

export async function updateLibrarian(id: number, data: LibrarianRequest): Promise<Librarian> {
  const res = await api.put<Librarian>(`/api/librarians/${id}`, data)
  return res.data
}

export async function deleteLibrarian(id: number): Promise<void> {
  await api.delete(`/api/librarians/${id}`)
}

export async function changeLibrarianPassword(id: number, data: ChangePasswordRequest): Promise<void> {
  await api.post(`/api/librarians/${id}/change-password`, data)
}
