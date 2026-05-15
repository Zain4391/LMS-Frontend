import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as authorsApi from '@/api/authors'
import type { AuthorRequest } from '@/types'

const KEYS = {
  all: ['authors'] as const,
  list: () => ['authors', 'list'] as const,
  detail: (id: number) => ['authors', id] as const,
}

export function useAuthors() {
  return useQuery({ queryKey: KEYS.list(), queryFn: authorsApi.getAuthors })
}

export function useAuthor(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => authorsApi.getAuthorById(id), enabled: !!id })
}

export function useCreateAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuthorRequest) => authorsApi.createAuthor(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Author created') },
    onError: () => toast.error('Failed to create author'),
  })
}

export function useUpdateAuthor(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuthorRequest) => authorsApi.updateAuthor(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Author updated') },
    onError: () => toast.error('Failed to update author'),
  })
}

export function useDeleteAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => authorsApi.deleteAuthor(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Author deleted') },
    onError: () => toast.error('Failed to delete author'),
  })
}
