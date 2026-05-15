import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as paymentsApi from '@/api/payments'
import type { PaymentRequest, PaginationParams, PaymentStatus, PaymentMethod } from '@/types'

const KEYS = {
  all: ['payments'] as const,
  list: (params?: object) => ['payments', 'list', params] as const,
  detail: (id: number) => ['payments', id] as const,
  byUser: (uid: number, params?: object) => ['payments', 'user', uid, params] as const,
  byFine: (fid: number, params?: object) => ['payments', 'fine', fid, params] as const,
  byStatus: (s: PaymentStatus, params?: object) => ['payments', 'status', s, params] as const,
  byMethod: (m: PaymentMethod, params?: object) => ['payments', 'method', m, params] as const,
}

export function usePayments(params?: PaginationParams & { paginated?: boolean }) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => paymentsApi.getPayments(params) })
}

export function usePayment(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => paymentsApi.getPaymentById(id), enabled: !!id })
}

export function usePaymentsByUser(userId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byUser(userId, params),
    queryFn: () => paymentsApi.getPaymentsByUser(userId, params),
    enabled: !!userId,
  })
}

export function usePaymentsByFine(fineId: number, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byFine(fineId, params),
    queryFn: () => paymentsApi.getPaymentsByFine(fineId, params),
    enabled: !!fineId,
  })
}

export function usePaymentsByStatus(status: PaymentStatus, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byStatus(status, params),
    queryFn: () => paymentsApi.getPaymentsByStatus(status, params),
  })
}

export function usePaymentsByMethod(method: PaymentMethod, params?: PaginationParams) {
  return useQuery({
    queryKey: KEYS.byMethod(method, params),
    queryFn: () => paymentsApi.getPaymentsByMethod(method, params),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PaymentRequest) => paymentsApi.createPayment(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Payment created') },
    onError: () => toast.error('Failed to create payment'),
  })
}

export function useUpdatePayment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PaymentRequest) => paymentsApi.updatePayment(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Payment updated') },
    onError: () => toast.error('Failed to update payment'),
  })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentsApi.deletePayment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Payment deleted') },
    onError: () => toast.error('Failed to delete payment'),
  })
}

export function useProcessPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => paymentsApi.processPayment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Payment processed') },
    onError: () => toast.error('Failed to process payment'),
  })
}
