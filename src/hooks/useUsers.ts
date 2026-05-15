import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as usersApi from '@/api/users'
import type { UserRequest, PaginationParams, UserStatus } from '@/types'

const KEYS = {
  all: ['users'] as const,
  list: (params?: object) => ['users', 'list', params] as const,
  detail: (id: number) => ['users', id] as const,
  byStatus: (s: UserStatus) => ['users', 'status', s] as const,
  search: (name: string) => ['users', 'search', name] as const,
}

export function useUsers(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => usersApi.getUsers(params) })
}

export function useMyUser() {
  return useQuery({ queryKey: ['users', 'me'], queryFn: () => usersApi.getMyUser() })
}

export function useChangeMyUserPassword() {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) => usersApi.changeMyUserPassword(data),
    onSuccess: () => toast.success('Password changed'),
    onError: () => toast.error('Failed to change password'),
  })
}

export function useUser(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => usersApi.getUserById(id), enabled: !!id })
}

export function useUsersByStatus(status: UserStatus) {
  return useQuery({ queryKey: KEYS.byStatus(status), queryFn: () => usersApi.getUsersByStatus(status) })
}

export function useSearchUsers(name: string) {
  return useQuery({
    queryKey: KEYS.search(name),
    queryFn: () => usersApi.searchUsersByName(name),
    enabled: name.length > 1,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserRequest) => usersApi.createUser(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('User created') },
    onError: () => toast.error('Failed to create user'),
  })
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserRequest) => usersApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('User updated') },
    onError: () => toast.error('Failed to update user'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('User deleted') },
    onError: () => toast.error('Failed to delete user'),
  })
}

export function useChangeUserPassword(id: number) {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      usersApi.changeUserPassword(id, data),
    onSuccess: () => toast.success('Password changed'),
    onError: () => toast.error('Failed to change password'),
  })
}
