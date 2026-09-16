import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLoading from './AuthLoading'

const LandingPage = lazy(() => import('../../pages/LandingPage'))

/** `/` — app se autenticado; landing pública se visitante. */
export default function RootRedirect() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <Suspense fallback={<AuthLoading label="Carregando" />}>
      <LandingPage />
    </Suspense>
  )
}
