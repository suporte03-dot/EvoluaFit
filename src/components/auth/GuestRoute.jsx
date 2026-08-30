import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/** Mostra login/cadastro na hora. Só redireciona se já houver sessão. */
export default function GuestRoute({ children }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/app" replace />
  }

  return children
}
