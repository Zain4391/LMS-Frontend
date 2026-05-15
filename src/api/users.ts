import { api } from '@/lib/axios'
import type { User, UserRequest, UserPatch, ChangePasswordRequest, Page, PaginationParams, UserStatus } from '@/types'

export async function getUsers(params?: PaginationParams & { paginated?: boolean }): Promise<User[] | Page<User>> {
  const res = await api.get('/api/users', { params })
  return res.data
}

export async function getMyUser(): Promise<User> {
  const res = await api.get<User>('/api/users/me')
  return res.data
}

export async function changeMyUserPassword(data: ChangePasswordRequest): Promise<void> {
  await api.post('/api/users/me/change-password', data)
}

export async function getUserById(id: number): Promise<User> {
  const res = await api.get<User>(`/api/users/${id}`)
  return res.data
}

export async function getUserByEmail(email: string): Promise<User> {
  const res = await api.get<User>(`/api/users/email/${email}`)
  return res.data
}

export async function getUsersByStatus(status: UserStatus): Promise<User[]> {
  const res = await api.get<User[]>(`/api/users/status/${status}`)
  return res.data
}

export async function searchUsersByName(name: string): Promise<User[]> {
  const res = await api.get<User[]>('/api/users/search/name', { params: { name } })
  return res.data
}

export async function createUser(data: UserRequest): Promise<User> {
  const res = await api.post<User>('/api/users', data)
  return res.data
}

export async function updateUser(id: number, data: UserRequest): Promise<User> {
  const res = await api.put<User>(`/api/users/${id}`, data)
  return res.data
}

export async function patchUserEmail(id: number, data: UserPatch): Promise<User> {
  const res = await api.patch<User>(`/api/users/${id}`, data)
  return res.data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`)
}

export async function changeUserPassword(id: number, data: ChangePasswordRequest): Promise<void> {
  await api.post(`/api/users/${id}/change-password`, data)
}
