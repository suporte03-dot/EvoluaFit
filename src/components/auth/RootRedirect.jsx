import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLoading from './AuthLoading'
import LandingPage from '../../pages/LandingPage'

/** `/` — app se autenticado; landing pública se visitante. */
export default function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading label="Carregando" />
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return <LandingPage />
}
