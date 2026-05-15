import { useMutation } from '@tanstack/react-query'
import { loginUser, loginLibrarian, register } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { LoginRequest, RegisterRequest } from '@/types'

export function useLoginUser() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (response) => {
      login(response)
      navigate('/app')
    },
    onError: () => {
      toast.error('Invalid email or password')
    },
  })
}

export function useLoginLibrarian() {
  const { login } = useAuth()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => loginLibrarian(data),
    onSuccess: (response) => {
      login(response)
      navigate('/staff')
    },
    onError: () => {
      toast.error('Invalid email or password')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      toast.success('Account created! Please log in.')
      navigate('/login')
    },
    onError: () => {
      toast.error('Registration failed. Email may already be in use.')
    },
  })
}
