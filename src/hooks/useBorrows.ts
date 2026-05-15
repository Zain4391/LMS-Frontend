import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as borrowApi from '@/api/borrowed'
import type { BorrowedRequest, PaginationParams, BorrowStatus } from '@/types'

const KEYS = {
  all: ['borrows'] as const,
  list: (params?: object) => ['borrows', 'list', params] as const,
  detail: (id: number) => ['borrows', id] as const,
  byUser: (uid: number, params?: object) => ['borrows', 'user', uid, params] as const,
  byStatus: (s: BorrowStatus, params?: object) => ['borrows', 'status', s, params] as const,
  overdue: (params?: object) => ['borrows', 'overdue', params] as const,
}

export function useBorrows(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => borrowApi.getBorrows(params) })
}

export function useBorrow(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => borrowApi.getBorrowById(id), enabled: !!id })
}

export function useBorrowsByUser(userId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byUser(userId, params),
    queryFn: () => borrowApi.getBorrowsByUser(userId, params),
    enabled: !!userId,
  })
}

export function useBorrowsByStatus(status: BorrowStatus, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byStatus(status, params),
    queryFn: () => borrowApi.getBorrowsByStatus(status, params),
  })
}

export function useOverdueBorrows(params?: PaginationParams) {
  return useQuery({ queryKey: KEYS.overdue(params), queryFn: () => borrowApi.getOverdueBorrows(params) })
}

export function useCreateBorrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BorrowedRequest) => borrowApi.createBorrow(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book borrowed successfully') },
    onError: () => toast.error('Failed to borrow book'),
  })
}

export function useReturnBorrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => borrowApi.returnBorrow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Book returned successfully') },
    onError: () => toast.error('Failed to return book'),
  })
}

export function useDeleteBorrow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => borrowApi.deleteBorrow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Borrow record deleted') },
    onError: () => toast.error('Failed to delete borrow record'),
  })
}
