import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { sectionFromPath } from '../data/dashboardRoutes'
import { useHashRoute } from '../hooks/useHashRoute'
import { setSectionNavigator } from '../utils/scrollToSection'
import { ProfileProvider } from '../context/ProfileContext'
import { WorkoutPlanProvider } from '../context/WorkoutPlanContext'
import { WorkoutSessionProvider } from '../context/WorkoutSessionContext'
import { ProgressProvider } from '../context/ProgressContext'
import { SyncProvider } from '../context/SyncContext'
import { FitnessProvider, useFitness } from '../context/FitnessContext'
import SyncStatusIndicator from '../components/SyncStatusIndicator'
import { loadExercises } from '../services/exerciseService'
import Header from '../components/Header'
import Toast from '../components/Toast'
import StartWorkoutModal from '../components/StartWorkoutModal'
import SessionResumeBanner from '../components/SessionResumeBanner'
import FirstRunGuide, { hasCompletedOnboarding } from '../components/FirstRunGuide'
import MobileNav from '../components/MobileNav'
import DashboardShell from '../components/dashboard/DashboardShell'
import DashboardSidebar from '../components/dashboard/DashboardSidebar'
import ProfileFitnessSync from '../components/ProfileFitnessSync'
import ProfilePage from './ProfilePage'
import '../App.css'
import '../styles/dashboard.css'
import '../styles/mobile.css'
import '../styles/identity.css'

const MyWorkouts = lazy(() => import('../components/MyWorkouts'))
const WorkoutPlanner = lazy(() => import('../components/WorkoutPlanner'))
const CoachIA = lazy(() => import('../components/CoachIA'))
const ExerciseLibrary = lazy(() => import('../components/ExerciseLibrary'))
const ExerciseDetailPage = lazy(() => import('../components/ExerciseDetailPage'))
const TrainingCalendar = lazy(() => import('../components/TrainingCalendar'))
const PerformanceDashboard = lazy(() => import('../components/PerformanceDashboard'))
const Goals = lazy(() => import('../components/Goals'))
const BodyEvolutionPage = lazy(() => import('./body-evolution/BodyEvolutionPage'))
const HowItWorks = lazy(() => import('../components/HowItWorks'))

function SectionFallback({ label = 'Carregando' }) {
  return (
    <div className="section-lazy-fallback" role="status" aria-live="polite">
      <span className="section-lazy-fallback__pulse" aria-hidden="true" />
      <span>{label}...</span>
    </div>
  )
}

function SectionPage({ label, children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return <Suspense fallback={<SectionFallback label={label} />}>{children}</Suspense>
}

function HomePage() {
  const [showOnboard, setShowOnboard] = useState(() => !hasCompletedOnboarding())

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      {showOnboard && <FirstRunGuide onClose={() => setShowOnboard(false)} />}
      <DashboardShell />
    </>
  )
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathSection = sectionFromPath(location.pathname) || 'inicio'
  const { toasts, history, workouts } = useFitness()
  const { page, id: exerciseId } = useHashRoute()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setSectionNavigator((path) => navigate(path))
    return () => setSectionNavigator(null)
  }, [navigate])

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
          activeSection={pathSection}
          history={history}
          workouts={workouts}
          collapsed={sidebarCollapsed && !mobileMenuOpen}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="app__content">
          <SyncStatusIndicator />
          <Header
            activeSection={pathSection}
            mobileMenuOpen={mobileMenuOpen}
            onOpenDashboardMenu={() => setMobileMenuOpen((open) => !open)}
          />
          <main>
            <SessionResumeBanner />
            <Outlet />
          </main>
        </div>
      </div>

      <Toast toasts={toasts} />
      <StartWorkoutModal />
      <MobileNav activeSection={pathSection} />
      {page === 'exercise' && exerciseId && (
        <Suspense fallback={<SectionFallback label="Carregando exercício" />}>
          <ExerciseDetailPage exerciseId={exerciseId} />
        </Suspense>
      )}
    </div>
  )
}

export default function DashboardApp() {
  useEffect(() => {
    loadExercises()
  }, [])

  return (
    <ProfileProvider>
      <FitnessProvider>
        <WorkoutPlanProvider>
          <WorkoutSessionProvider>
            <ProgressProvider>
              <SyncProvider>
                <ProfileFitnessSync />
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route
                      path="treinos"
                      element={
                        <SectionPage label="Carregando treinos">
                          <MyWorkouts />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="planilha"
                      element={
                        <SectionPage label="Carregando seu treino">
                          <WorkoutPlanner />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="biblioteca"
                      element={
                        <SectionPage label="Carregando grupos musculares">
                          <ExerciseLibrary />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="indicadores"
                      element={
                        <SectionPage label="Carregando progresso">
                          <PerformanceDashboard />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="metas"
                      element={
                        <SectionPage label="Carregando metas">
                          <Goals />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="coach"
                      element={
                        <SectionPage label="Carregando Coach">
                          <CoachIA />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="agenda"
                      element={
                        <SectionPage label="Carregando calendário">
                          <TrainingCalendar />
                        </SectionPage>
                      }
                    />
                    <Route
                      path="ajuda"
                      element={
                        <SectionPage label="Carregando ajuda">
                          <HowItWorks />
                        </SectionPage>
                      }
                    />
                    <Route path="perfil" element={<ProfilePage />} />
                    <Route
                      path="evolucao/espelho/*"
                      element={
                        <SectionPage label="Carregando Espelho Evolutivo">
                          <BodyEvolutionPage />
                        </SectionPage>
                      }
                    />
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
