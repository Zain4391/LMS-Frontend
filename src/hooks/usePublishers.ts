import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as publishersApi from '@/api/publishers'
import type { PublisherRequest } from '@/types'

const KEYS = {
  all: ['publishers'] as const,
  list: () => ['publishers', 'list'] as const,
  detail: (id: number) => ['publishers', id] as const,
}

export function usePublishers() {
  return useQuery({ queryKey: KEYS.list(), queryFn: publishersApi.getPublishers })
}

export function usePublisher(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => publishersApi.getPublisherById(id), enabled: !!id })
}

export function useCreatePublisher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PublisherRequest) => publishersApi.createPublisher(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Publisher created') },
    onError: () => toast.error('Failed to create publisher'),
  })
}

export function useUpdatePublisher(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PublisherRequest) => publishersApi.updatePublisher(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Publisher updated') },
    onError: () => toast.error('Failed to update publisher'),
  })
}

export function useDeletePublisher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => publishersApi.deletePublisher(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Publisher deleted') },
    onError: () => toast.error('Failed to delete publisher'),
  })
}
