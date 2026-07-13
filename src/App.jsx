import { useEffect } from 'react'
import { sectionIds } from './data/siteData'
import { useScrollSpy } from './hooks/useScrollSpy'
import { useHashRoute } from './hooks/useHashRoute'
import { FitnessProvider, useFitness } from './context/FitnessContext'
import { loadExercises } from './services/exerciseService'
import Header from './components/Header'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import TodaySuggestion from './components/TodaySuggestion'
import MyWorkouts from './components/MyWorkouts'
import WorkoutPlanner from './components/WorkoutPlanner'
import CoachIA from './components/CoachIA'
import ExerciseLibrary from './components/ExerciseLibrary'
import ExerciseDetailPage from './components/ExerciseDetailPage'
import TrainingCalendar from './components/TrainingCalendar'
import PerformanceDashboard from './components/PerformanceDashboard'
import WorkoutHistory from './components/WorkoutHistory'
import Goals from './components/Goals'
import UserProfile from './components/UserProfile'
import Footer from './components/Footer'
import Toast from './components/Toast'
import './App.css'

function AppContent() {
  const activeSection = useScrollSpy(sectionIds)
  const { toasts } = useFitness()
  const { page, id: exerciseId } = useHashRoute()

  return (
    <div className="app">
      <Header activeSection={activeSection} />
      <main>
        <Hero />
        <Dashboard />
        <TodaySuggestion />
        <MyWorkouts />
        <WorkoutPlanner />
        <CoachIA />
        <ExerciseLibrary />
        <TrainingCalendar />
        <PerformanceDashboard />
        <WorkoutHistory />
        <Goals />
        <UserProfile />
        <Footer />
      </main>
      <Toast toasts={toasts} />
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
