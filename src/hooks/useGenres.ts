import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as genresApi from '@/api/genres'
import type { GenreRequest } from '@/types'

const KEYS = {
  all: ['genres'] as const,
  list: () => ['genres', 'list'] as const,
  detail: (id: number) => ['genres', id] as const,
}

export function useGenres() {
  return useQuery({ queryKey: KEYS.list(), queryFn: genresApi.getGenres })
}

export function useGenre(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => genresApi.getGenreById(id), enabled: !!id })
}

export function useCreateGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GenreRequest) => genresApi.createGenre(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Genre created') },
    onError: () => toast.error('Failed to create genre'),
  })
}

export function useUpdateGenre(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GenreRequest) => genresApi.updateGenre(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Genre updated') },
    onError: () => toast.error('Failed to update genre'),
  })
}

export function useDeleteGenre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => genresApi.deleteGenre(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Genre deleted') },
    onError: () => toast.error('Failed to delete genre'),
  })
}
