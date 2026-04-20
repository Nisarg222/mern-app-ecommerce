import { useSelector } from 'react-redux'

const useAuth = () => {
  const { user, token, loading } = useSelector((s) => s.auth)
  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin:         user?.role === 'admin',
  }
}

export default useAuth
