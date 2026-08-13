import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useSectionHash } from './hooks/useSectionHash'
import { useHashRoute } from './hooks/useHashRoute'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { WorkoutPlanProvider } from './context/WorkoutPlanContext'
import { WorkoutSessionProvider } from './context/WorkoutSessionContext'
import { ProgressProvider } from './context/ProgressContext'
import { SyncProvider } from './context/SyncContext'
import { FitnessProvider, useFitness } from './context/FitnessContext'
import SyncStatusIndicator from './components/SyncStatusIndicator'
import PwaUpdatePrompt from './components/pwa/PwaUpdatePrompt'
import { loadExercises } from './services/exerciseService'
import Header from './components/Header'
import SectionDivider from './components/SectionDivider'
import Footer from './components/Footer'
import Toast from './components/Toast'
import StartWorkoutModal from './components/StartWorkoutModal'
import SessionResumeBanner from './components/SessionResumeBanner'
import FirstRunGuide, { hasCompletedOnboarding } from './components/FirstRunGuide'
import MobileNav from './components/MobileNav'
import DashboardShell from './components/dashboard/DashboardShell'
import DashboardSidebar from './components/dashboard/DashboardSidebar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import GuestRoute from './components/auth/GuestRoute'
import RootRedirect from './components/auth/RootRedirect'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'
import './styles/dashboard.css'
import './styles/mobile.css'
import './styles/evoluafit-logo.css'
import './styles/auth.css'
import './styles/identity.css'

const HowItWorks = lazy(() => import('./components/HowItWorks'))
const MyWorkouts = lazy(() => import('./components/MyWorkouts'))
const WorkoutPlanner = lazy(() => import('./components/WorkoutPlanner'))
const CoachIA = lazy(() => import('./components/CoachIA'))
const ExerciseLibrary = lazy(() => import('./components/ExerciseLibrary'))
const ExerciseDetailPage = lazy(() => import('./components/ExerciseDetailPage'))
const TrainingCalendar = lazy(() => import('./components/TrainingCalendar'))
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard'))
const Goals = lazy(() => import('./components/Goals'))
const UserProfile = lazy(() => import('./components/UserProfile'))

function SectionFallback({ label = 'Carregando' }) {
  return (
    <div className="section-lazy-fallback" role="status" aria-live="polite">
      <span className="section-lazy-fallback__pulse" aria-hidden="true" />
      <span>{label}...</span>
    </div>
  )
}

function AppLayout() {
  const location = useLocation()
  const activeSection = useScrollSpy(sectionIds)
  useSectionHash(sectionIds)
  const { toasts, history, workouts } = useFitness()
  const { page, id: exerciseId } = useHashRoute()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isProfileRoute = location.pathname.startsWith('/app/perfil')

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  return (
    <div
      className={`app app--saas${sidebarCollapsed ? ' app--sidebar-collapsed' : ''}${
        mobileMenuOpen ? ' app--drawer-open' : ''
      }`}
    >
      <div className="app__frame">
        <DashboardSidebar
          activeSection={isProfileRoute ? 'perfil' : activeSection}
          history={history}
          workouts={workouts}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="app__content">
          <SyncStatusIndicator />
          <Header
            activeSection={isProfileRoute ? 'perfil' : activeSection}
            mobileMenuOpen={mobileMenuOpen}
            onOpenDashboardMenu={() => setMobileMenuOpen((open) => !open)}
          />
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      <Toast toasts={toasts} />
      <StartWorkoutModal />
      <MobileNav activeSection={isProfileRoute ? 'perfil' : activeSection} />
      {page === 'exercise' && exerciseId && (
        <Suspense fallback={<SectionFallback label="Carregando exercício" />}>
          <ExerciseDetailPage exerciseId={exerciseId} />
        </Suspense>
      )}
    </div>
  )
}

function DashboardHome() {
  const [showOnboard, setShowOnboard] = useState(() => !hasCompletedOnboarding())

  return (
    <>
      {showOnboard && <FirstRunGuide onClose={() => setShowOnboard(false)} />}
      <SessionResumeBanner />
      <DashboardShell />
      <Suspense fallback={<SectionFallback label="Carregando conteúdo" />}>
        <HowItWorks />
        <SectionDivider variant="workouts" label="TREINOS" />
        <MyWorkouts />
        <WorkoutPlanner />
        <SectionDivider variant="coach" label="COACH IA" />
        <CoachIA />
        <ExerciseLibrary />
        <SectionDivider variant="calendar" label="CALENDÁRIO" />
        <TrainingCalendar />
        <SectionDivider variant="progress" label="EVOLUÇÃO" />
        <PerformanceDashboard />
        <Goals />
        <SectionDivider variant="profile" label="PERFIL" />
        <UserProfile />
        <Footer />
      </Suspense>
    </>
  )
}

function DashboardApp() {
  return (
    <ProfileProvider>
      <FitnessProvider>
        <WorkoutPlanProvider>
          <WorkoutSessionProvider>
            <ProgressProvider>
              <SyncProvider>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="perfil" element={<ProfilePage />} />
                  </Route>
                </Routes>
              </SyncProvider>
            </ProgressProvider>
          </WorkoutSessionProvider>
        </WorkoutPlanProvider>
      </FitnessProvider>
    </ProfileProvider>
  )
}

function App() {
  useEffect(() => {
    loadExercises()
  }, [])

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
                <DashboardApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App