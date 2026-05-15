import { api } from '@/lib/axios'
import type { Fine, FineRequest, Page, PaginationParams, FineStatus } from '@/types'

export async function getFines(params?: PaginationParams & { paginated?: boolean }): Promise<Fine[] | Page<Fine>> {
  const res = await api.get('/api/fines', { params })
  return res.data
}

export async function getFineById(id: number): Promise<Fine> {
  const res = await api.get<Fine>(`/api/fines/${id}`)
  return res.data
}

export async function getFineByBorrow(borrowedId: number): Promise<Fine> {
  const res = await api.get<Fine>(`/api/fines/borrowed/${borrowedId}`)
  return res.data
}

export async function getFinesByUser(userId: number, params?: PaginationParams): Promise<Fine[] | Page<Fine>> {
  const res = await api.get(`/api/fines/user/${userId}`, { params })
  return res.data
}

export async function getFinesByStatus(status: FineStatus, params?: PaginationParams): Promise<Fine[] | Page<Fine>> {
  const res = await api.get(`/api/fines/status/${status}`, { params })
  return res.data
}

export async function createFine(data: FineRequest): Promise<Fine> {
  const res = await api.post<Fine>('/api/fines', data)
  return res.data
}

export async function updateFine(id: number, data: FineRequest): Promise<Fine> {
  const res = await api.put<Fine>(`/api/fines/${id}`, data)
  return res.data
}

export async function deleteFine(id: number): Promise<void> {
  await api.delete(`/api/fines/${id}`)
}

export async function payFine(id: number): Promise<Fine> {
  const res = await api.post<Fine>(`/api/fines/${id}/pay`)
  return res.data
}

export async function assessFine(borrowedId: number): Promise<Fine> {
  const res = await api.post<Fine>(`/api/fines/assess/borrowed/${borrowedId}`)
  return res.data
}
