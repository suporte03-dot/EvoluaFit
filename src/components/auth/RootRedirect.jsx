import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LandingPage from '../../pages/LandingPage'

/** `/` — app se autenticado; landing pública se visitante. */
export default function RootRedirect() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/app" replace />
  }

  return <LandingPage />
}
