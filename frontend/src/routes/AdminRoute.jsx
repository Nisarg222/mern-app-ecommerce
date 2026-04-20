import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Spinner from '../components/common/Spinner'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) return <Spinner className="min-h-screen" />

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin)         return <Navigate to="/"      replace />

  return children
}

export default AdminRoute
