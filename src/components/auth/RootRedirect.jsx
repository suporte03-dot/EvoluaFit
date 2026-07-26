import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLoading from './AuthLoading'

/** Direciona `/` conforme a sessão. */
export default function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading label="Carregando" />
  }

  return <Navigate to={user ? '/app' : '/login'} replace />
}
