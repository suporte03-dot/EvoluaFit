import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLoading from './AuthLoading'

/** Redireciona usuário autenticado para o dashboard. */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading label="Carregando" />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
