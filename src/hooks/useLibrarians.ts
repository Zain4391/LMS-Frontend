import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as libApi from '@/api/librarians'
import type { LibrarianRequest, PaginationParams, LibrarianRole, LibrarianStatus } from '@/types'

const KEYS = {
  all: ['librarians'] as const,
  list: (params?: object) => ['librarians', 'list', params] as const,
  detail: (id: number) => ['librarians', id] as const,
  byRole: (r: LibrarianRole) => ['librarians', 'role', r] as const,
  byStatus: (s: LibrarianStatus) => ['librarians', 'status', s] as const,
}

export function useLibrarians(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => libApi.getLibrarians(params) })
}

export function useMyLibrarian() {
  return useQuery({ queryKey: ['librarians', 'me'], queryFn: () => libApi.getMyLibrarian() })
}

export function useChangeMyLibrarianPassword() {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) => libApi.changeMyLibrarianPassword(data),
    onSuccess: () => toast.success('Password changed'),
    onError: () => toast.error('Failed to change password'),
  })
}

export function useLibrarian(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => libApi.getLibrarianById(id), enabled: !!id })
}

export function useLibrariansByRole(role: LibrarianRole) {
  return useQuery({ queryKey: KEYS.byRole(role), queryFn: () => libApi.getLibrariansByRole(role) })
}

export function useLibrariansByStatus(status: LibrarianStatus) {
  return useQuery({ queryKey: KEYS.byStatus(status), queryFn: () => libApi.getLibrariansByStatus(status) })
}

export function useCreateLibrarian() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LibrarianRequest) => libApi.createLibrarian(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Librarian created') },
    onError: () => toast.error('Failed to create librarian'),
  })
}

export function useUpdateLibrarian(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LibrarianRequest) => libApi.updateLibrarian(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Librarian updated') },
    onError: () => toast.error('Failed to update librarian'),
  })
}

export function useDeleteLibrarian() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => libApi.deleteLibrarian(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Librarian deleted') },
    onError: () => toast.error('Failed to delete librarian'),
  })
}

export function useChangeLibrarianPassword(id: number) {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      libApi.changeLibrarianPassword(id, data),
    onSuccess: () => toast.success('Password changed'),
    onError: () => toast.error('Failed to change password'),
  })
}
