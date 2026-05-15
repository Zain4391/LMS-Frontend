import { api } from '@/lib/axios'
import type { Payment, PaymentRequest, Page, PaginationParams, PaymentStatus, PaymentMethod } from '@/types'

export async function getPayments(params?: PaginationParams & { paginated?: boolean }): Promise<Payment[] | Page<Payment>> {
  const res = await api.get('/api/payments', { params })
  return res.data
}

export async function getPaymentById(id: number): Promise<Payment> {
  const res = await api.get<Payment>(`/api/payments/${id}`)
  return res.data
}

export async function getPaymentByTransaction(transactionId: string): Promise<Payment> {
  const res = await api.get<Payment>(`/api/payments/transaction/${transactionId}`)
  return res.data
}

export async function getPaymentsByFine(fineId: number, params?: PaginationParams): Promise<Payment[] | Page<Payment>> {
  const res = await api.get(`/api/payments/fine/${fineId}`, { params })
  return res.data
}

export async function getPaymentsByUser(userId: number, params?: PaginationParams): Promise<Payment[] | Page<Payment>> {
  const res = await api.get(`/api/payments/user/${userId}`, { params })
  return res.data
}

export async function getPaymentsByStatus(status: PaymentStatus, params?: PaginationParams): Promise<Payment[] | Page<Payment>> {
  const res = await api.get(`/api/payments/status/${status}`, { params })
  return res.data
}

export async function getPaymentsByMethod(method: PaymentMethod, params?: PaginationParams): Promise<Payment[] | Page<Payment>> {
  const res = await api.get(`/api/payments/method/${method}`, { params })
  return res.data
}

export async function createPayment(data: PaymentRequest): Promise<Payment> {
  const res = await api.post<Payment>('/api/payments', data)
  return res.data
}

export async function updatePayment(id: number, data: PaymentRequest): Promise<Payment> {
  const res = await api.put<Payment>(`/api/payments/${id}`, data)
  return res.data
}

export async function deletePayment(id: number): Promise<void> {
  await api.delete(`/api/payments/${id}`)
}

export async function processPayment(id: number): Promise<Payment> {
  const res = await api.post<Payment>(`/api/payments/${id}/process`)
  return res.data
}
