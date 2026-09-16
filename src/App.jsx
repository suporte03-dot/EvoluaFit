import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PwaUpdatePrompt from './components/pwa/PwaUpdatePrompt'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/auth/GuestRoute'
import RootRedirect from './components/auth/RootRedirect'
import AuthLoading from './components/auth/AuthLoading'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage'
import './styles/evoluafit-logo.css'
import './styles/auth.css'

const DashboardApp = lazy(() => import('./pages/DashboardApp'))

function BodyEvolutionRedirect() {
  const location = useLocation()
  const suffix = location.pathname.replace(/^\/evolucao\/espelho/, '')
  return <Navigate to={`/app/evolucao/espelho${suffix}${location.search}`} replace />
}

function DashboardGate() {
  return (
    <Suspense fallback={<AuthLoading label="Abrindo o app" />}>
      <DashboardApp />
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PwaUpdatePrompt />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/cadastro"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/esqueci-senha"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/atualizar-senha" element={<UpdatePasswordPage />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DashboardGate />
              </ProtectedRoute>
            }
          />
          <Route path="/evolucao/espelho/*" element={<BodyEvolutionRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
