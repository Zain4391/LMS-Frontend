import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { AuthRole } from '@/types'

interface Props {
  allowedRoles?: AuthRole[]
  redirectTo?: string
}

export function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'USER' ? '/app' : '/staff'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
