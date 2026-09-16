import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { sectionIds } from '../data/siteData'
import { sectionFromPath, isDedicatedAppRoute } from '../data/dashboardRoutes'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { useSectionHash } from '../hooks/useSectionHash'
import { useHashRoute } from '../hooks/useHashRoute'
import { scrollToSection } from '../utils/scrollToSection'
import { ProfileProvider } from '../context/ProfileContext'
import { WorkoutPlanProvider } from '../context/WorkoutPlanContext'
import { WorkoutSessionProvider } from '../context/WorkoutSessionContext'
import { ProgressProvider } from '../context/ProgressContext'
import { SyncProvider } from '../context/SyncContext'
import { FitnessProvider, useFitness } from '../context/FitnessContext'
import SyncStatusIndicator from '../components/SyncStatusIndicator'
import { loadExercises } from '../services/exerciseService'
import Header from '../components/Header'
import SectionDivider from '../components/SectionDivider'
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
const UserProfile = lazy(() => import('../components/UserProfile'))
const BodyEvolutionPage = lazy(() => import('./body-evolution/BodyEvolutionPage'))
const BodyMirrorEntry = lazy(() => import('../components/body-evolution/BodyMirrorEntry'))

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
  const pathSection = sectionFromPath(location.pathname)
  const spySeed =
    pathSection && pathSection !== 'perfil' && pathSection !== 'espelho' ? pathSection : 'inicio'
  const activeSection = useScrollSpy(sectionIds, 120, spySeed)
  useSectionHash(sectionIds)
  const { toasts, history, workouts } = useFitness()
  const { page, id: exerciseId } = useHashRoute()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dedicated = isDedicatedAppRoute(location.pathname)
  const shellSection = dedicated ? pathSection : activeSection

  useEffect(() => {
    if (dedicated) return undefined
    const section = sectionFromPath(location.pathname)
    if (!section) return undefined
    const timer = window.setTimeout(() => {
      if (section === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      scrollToSection(section)
    }, 60)
    return () => window.clearTimeout(timer)
  }, [location.pathname, dedicated])

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
          activeSection={shellSection}
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
            activeSection={shellSection}
            mobileMenuOpen={mobileMenuOpen}
            onOpenDashboardMenu={() => setMobileMenuOpen((open) => !open)}
          />
          <main>
            {dedicated ? <Outlet /> : <DashboardHome />}
          </main>
        </div>
      </div>

      <Toast toasts={toasts} />
      <StartWorkoutModal />
      <MobileNav activeSection={shellSection} />
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
        <MyWorkouts />
        <WorkoutPlanner />
        <SectionDivider variant="coach" label="COACH" />
        <CoachIA />
        <ExerciseLibrary />
        <SectionDivider variant="calendar" label="CALENDÁRIO" />
        <TrainingCalendar />
        <SectionDivider variant="progress" label="EVOLUÇÃO" />
        <PerformanceDashboard />
        <BodyMirrorEntry />
        <Goals />
        <SectionDivider variant="profile" label="PERFIL" />
        <UserProfile />
      </Suspense>
    </>
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
                    <Route index element={null} />
                    <Route path="treinos" element={null} />
                    <Route path="planilha" element={null} />
                    <Route path="biblioteca" element={null} />
                    <Route path="indicadores" element={null} />
                    <Route path="metas" element={null} />
                    <Route path="coach" element={null} />
                    <Route path="agenda" element={null} />
                    <Route path="ajuda" element={null} />
                    <Route path="perfil" element={<ProfilePage />} />
                    <Route
                      path="evolucao/espelho/*"
                      element={
                        <Suspense fallback={<SectionFallback label="Carregando Espelho Evolutivo" />}>
                          <BodyEvolutionPage />
                        </Suspense>
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
