import { useEffect, useState } from 'react'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useSectionHash } from './hooks/useSectionHash'
import { useHashRoute } from './hooks/useHashRoute'
import { FitnessProvider, useFitness } from './context/FitnessContext'
import { loadExercises } from './services/exerciseService'
import Header from './components/Header'
import HowItWorks from './components/HowItWorks'
import SectionDivider from './components/SectionDivider'
import MyWorkouts from './components/MyWorkouts'
import WorkoutPlanner from './components/WorkoutPlanner'
import CoachIA from './components/CoachIA'
import ExerciseLibrary from './components/ExerciseLibrary'
import ExerciseDetailPage from './components/ExerciseDetailPage'
import TrainingCalendar from './components/TrainingCalendar'
import PerformanceDashboard from './components/PerformanceDashboard'
import Goals from './components/Goals'
import UserProfile from './components/UserProfile'
import Footer from './components/Footer'
import Toast from './components/Toast'
import StartWorkoutModal from './components/StartWorkoutModal'
import MobileNav from './components/MobileNav'
import DashboardShell from './components/dashboard/DashboardShell'
import DashboardSidebar from './components/dashboard/DashboardSidebar'
import './App.css'
import './styles/dashboard.css'
import './styles/mobile.css'

function AppContent() {
  const activeSection = useScrollSpy(sectionIds)
  useSectionHash(sectionIds)
  const { toasts, profile, history, workouts } = useFitness()
  const { page, id: exerciseId } = useHashRoute()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          activeSection={activeSection}
          profile={profile}
          history={history}
          workouts={workouts}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <div className="app__content">
          <Header
            activeSection={activeSection}
            onOpenDashboardMenu={() => setMobileMenuOpen(true)}
          />
          <main>
            <DashboardShell />
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
          </main>
        </div>
      </div>

      <Toast toasts={toasts} />
      <StartWorkoutModal />
      <MobileNav activeSection={activeSection} />
      {page === 'exercise' && exerciseId && <ExerciseDetailPage exerciseId={exerciseId} />}
    </div>
  )
}

function App() {
  useEffect(() => {
    loadExercises()
  }, [])

  return (
    <FitnessProvider>
      <AppContent />
    </FitnessProvider>
  )
}

export default App
