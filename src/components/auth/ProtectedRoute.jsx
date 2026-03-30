import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user) {
    const role = String(user.role ?? '').toLowerCase()
    const allowed = allowedRoles.map((r) => String(r).toLowerCase())
    if (!allowed.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}
