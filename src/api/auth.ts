import { api, setToken, clearToken } from '@/lib/axios'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types'

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/user/login', data)
  return res.data
}

export async function loginLibrarian(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/librarian/login', data)
  return res.data
}

export async function register(data: RegisterRequest): Promise<void> {
  await api.post('/api/auth/register', data)
}

export async function verifyToken(): Promise<boolean> {
  try {
    await api.get('/api/auth/verify')
    return true
  } catch {
    return false
  }
}

export { setToken, clearToken }
