import { api } from '@/lib/axios'
import type { Borrowed, BorrowedRequest, Page, PaginationParams, BorrowStatus } from '@/types'

export async function getBorrows(params?: PaginationParams & { paginated?: boolean }): Promise<Borrowed[] | Page<Borrowed>> {
  const res = await api.get('/api/borrowed', { params })
  return res.data
}

export async function getBorrowById(id: number): Promise<Borrowed> {
  const res = await api.get<Borrowed>(`/api/borrowed/${id}`)
  return res.data
}

export async function getBorrowsByUser(userId: number, params?: PaginationParams): Promise<Borrowed[] | Page<Borrowed>> {
  const res = await api.get(`/api/borrowed/user/${userId}`, { params })
  return res.data
}

export async function getBorrowsByStatus(status: BorrowStatus, params?: PaginationParams): Promise<Borrowed[] | Page<Borrowed>> {
  const res = await api.get(`/api/borrowed/status/${status}`, { params })
  return res.data
}

export async function getOverdueBorrows(params?: PaginationParams): Promise<Borrowed[] | Page<Borrowed>> {
  const res = await api.get('/api/borrowed/overdue', { params })
  return res.data
}

export async function createBorrow(data: BorrowedRequest): Promise<Borrowed> {
  const res = await api.post<Borrowed>('/api/borrowed', data)
  return res.data
}

export async function returnBorrow(id: number): Promise<Borrowed> {
  const res = await api.post<Borrowed>(`/api/borrowed/${id}/return`)
  return res.data
}

export async function updateBorrow(id: number, data: Partial<BorrowedRequest>): Promise<Borrowed> {
  const res = await api.put<Borrowed>(`/api/borrowed/${id}`, data)
  return res.data
}

export async function deleteBorrow(id: number): Promise<void> {
  await api.delete(`/api/borrowed/${id}`)
}
