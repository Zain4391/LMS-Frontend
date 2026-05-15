import { api } from '@/lib/axios'
import type { Genre, GenreRequest } from '@/types'

export async function getGenres(): Promise<Genre[]> {
  const res = await api.get<Genre[]>('/api/genres')
  return res.data
}

export async function getGenreById(id: number): Promise<Genre> {
  const res = await api.get<Genre>(`/api/genres/${id}`)
  return res.data
}

export async function createGenre(data: GenreRequest): Promise<Genre> {
  const res = await api.post<Genre>('/api/genres', data)
  return res.data
}

export async function updateGenre(id: number, data: GenreRequest): Promise<Genre> {
  const res = await api.put<Genre>(`/api/genres/${id}`, data)
  return res.data
}

export async function deleteGenre(id: number): Promise<void> {
  await api.delete(`/api/genres/${id}`)
}
