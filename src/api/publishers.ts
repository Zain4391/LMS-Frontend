import { api } from '@/lib/axios'
import type { Publisher, PublisherRequest } from '@/types'

export async function getPublishers(): Promise<Publisher[]> {
  const res = await api.get<Publisher[]>('/api/publishers')
  return res.data
}

export async function getPublisherById(id: number): Promise<Publisher> {
  const res = await api.get<Publisher>(`/api/publishers/${id}`)
  return res.data
}

export async function createPublisher(data: PublisherRequest): Promise<Publisher> {
  const res = await api.post<Publisher>('/api/publishers', data)
  return res.data
}

export async function updatePublisher(id: number, data: PublisherRequest): Promise<Publisher> {
  const res = await api.put<Publisher>(`/api/publishers/${id}`, data)
  return res.data
}

export async function deletePublisher(id: number): Promise<void> {
  await api.delete(`/api/publishers/${id}`)
}
