import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as finesApi from '@/api/fines'
import type { FineRequest, PaginationParams, FineStatus } from '@/types'

const KEYS = {
  all: ['fines'] as const,
  list: (params?: object) => ['fines', 'list', params] as const,
  detail: (id: number) => ['fines', id] as const,
  byUser: (uid: number, params?: object) => ['fines', 'user', uid, params] as const,
  byStatus: (s: FineStatus, params?: object) => ['fines', 'status', s, params] as const,
  byBorrow: (bid: number) => ['fines', 'borrow', bid] as const,
}

export function useFines(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => finesApi.getFines(params) })
}

export function useFine(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => finesApi.getFineById(id), enabled: !!id })
}

export function useFineByBorrow(borrowedId: number) {
  return useQuery({
    queryKey: KEYS.byBorrow(borrowedId),
    queryFn: () => finesApi.getFineByBorrow(borrowedId),
    enabled: !!borrowedId,
  })
}

export function useFinesByUser(userId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byUser(userId, params),
    queryFn: () => finesApi.getFinesByUser(userId, params),
    enabled: !!userId,
  })
}

export function useFinesByStatus(status: FineStatus, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byStatus(status, params),
    queryFn: () => finesApi.getFinesByStatus(status, params),
  })
}

export function useCreateFine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FineRequest) => finesApi.createFine(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Fine created') },
    onError: () => toast.error('Failed to create fine'),
  })
}

export function useUpdateFine(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FineRequest) => finesApi.updateFine(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Fine updated') },
    onError: () => toast.error('Failed to update fine'),
  })
}

export function useDeleteFine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => finesApi.deleteFine(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Fine deleted') },
    onError: () => toast.error('Failed to delete fine'),
  })
}

export function usePayFine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => finesApi.payFine(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Fine marked as paid') },
    onError: () => toast.error('Failed to pay fine'),
  })
}

export function useAssessFine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (borrowedId: number) => finesApi.assessFine(borrowedId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Fine assessed') },
    onError: () => toast.error('Failed to assess fine'),
  })
}
