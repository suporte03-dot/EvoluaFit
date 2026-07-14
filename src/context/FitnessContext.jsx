import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import storageService from '../services/storageService'
import { buildHistoryEntry } from '../services/workoutService'
import { getPerformanceSummary } from '../utils/performanceUtils'
import { parseSets, parseRestSeconds } from '../data/exercisesData'

const FitnessContext = createContext(null)

export function FitnessProvider({ children }) {
  const [data, setData] = useState(() => storageService.load())
  const [toasts, setToasts] = useState([])
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const persist = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      storageService.save(next)
      return next
    })
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const updateProfile = useCallback(
    (profile) => {
      persist((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }))
      showToast('Perfil atualizado!')
    },
    [persist, showToast],
  )

  const addWorkout = useCallback(
    (workout) => {
      persist((prev) => ({ ...prev, workouts: [workout, ...prev.workouts] }))
      showToast('Treino adicionado!')
    },
    [persist, showToast],
  )

  const updateWorkout = useCallback(
    (id, updates) => {
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      }))
    },
    [persist],
  )

  const deleteWorkout = useCallback(
    (id) => {
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.filter((w) => w.id !== id),
      }))
      showToast('Treino excluído.')
    },
    [persist, showToast],
  )

  const duplicateWorkout = useCallback(
    (id) => {
      persist((prev) => {
        const original = prev.workouts.find((w) => w.id === id)
        if (!original) return prev
        const copy = {
          ...original,
          id: `workout-${Date.now()}`,
          status: 'Pendente',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          exercises: original.exercises.map((ex) => ({ ...ex })),
        }
        return { ...prev, workouts: [copy, ...prev.workouts] }
      })
      showToast('Treino duplicado!')
    },
    [persist, showToast],
  )

  const completeWorkout = useCallback(
    (workoutId, sessionData) => {
      // Persisted via localStorage (evoluafit-data). Future: sync to Supabase workout_history + workout_sets.
      const entry = buildHistoryEntry(workoutId, sessionData)

      persist((prev) => ({
        ...prev,
        history: [entry, ...prev.history],
        workouts: prev.workouts.map((w) =>
          w.id === workoutId
            ? { ...w, status: 'Realizado', completedAt: entry.completedAt, exercises: sessionData.exercises }
            : w,
        ),
      }))
      setActiveWorkout(null)
      showToast('Treino finalizado com sucesso!')
    },
    [persist, showToast],
  )

  const savePlan = useCallback(
    (plan) => {
      persist((prev) => ({ ...prev, plans: [plan, ...prev.plans] }))
      setGeneratedPlan(plan)
      showToast('Planilha gerada com sucesso!')
    },
    [persist, showToast],
  )

  const addPlanWorkouts = useCallback(
    (workouts) => {
      persist((prev) => ({
        ...prev,
        workouts: [...workouts, ...prev.workouts],
      }))
      showToast(`${workouts.length} treinos adicionados à sua lista!`)
    },
    [persist, showToast],
  )

  const startWorkout = useCallback((workout) => {
    setActiveWorkout(workout)
  }, [])

  const addWorkoutToPlan = useCallback(
    (workout) => {
      if (!workout) return
      const exists = data.workouts.some((w) => w.id === workout.id)
      if (exists) {
        showToast('Treino já está na sua planilha.', 'info')
        return
      }
      const entry = {
        ...workout,
        id: workout.id || `workout-${Date.now()}`,
        status: workout.status || 'Pendente',
        date: workout.date || new Date().toISOString().split('T')[0],
        createdAt: workout.createdAt || new Date().toISOString(),
        exercises: (workout.exercises || []).map((ex) => ({ ...ex })),
      }
      persist((prev) => ({
        ...prev,
        workouts: [entry, ...prev.workouts],
      }))
      showToast('Treino adicionado à planilha!')
    },
    [data.workouts, persist, showToast],
  )

  const addExerciseToPlan = useCallback(
    (exercise) => {
      if (!exercise) return

      const entry = {
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.category,
        sets: parseSets(exercise.sets),
        reps: exercise.reps,
        restSeconds: parseRestSeconds(exercise.rest),
        load: '',
      }

      const pending = data.workouts.find((w) => w.status === 'Pendente')

      if (pending) {
        persist((prev) => ({
          ...prev,
          workouts: prev.workouts.map((w) =>
            w.id === pending.id
              ? {
                  ...w,
                  exercises: [...w.exercises, entry],
                  muscleGroups: [...new Set([...(w.muscleGroups || []), exercise.category])],
                }
              : w,
          ),
        }))
        showToast(`"${exercise.name}" adicionado ao treino ${pending.name}`)
        return
      }

      const newWorkout = {
        id: `workout-${Date.now()}`,
        name: `Treino — ${exercise.category}`,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: [exercise.category],
        status: 'Pendente',
        estimatedMinutes: 45,
        exercises: [entry],
        createdAt: new Date().toISOString(),
      }

      persist((prev) => ({
        ...prev,
        workouts: [newWorkout, ...prev.workouts],
      }))
      showToast(`"${exercise.name}" adicionado à planilha!`)
    },
    [data.workouts, persist, showToast],
  )

  const updateGoals = useCallback(
    (goals) => {
      persist((prev) => ({ ...prev, goals }))
      showToast('Metas atualizadas!')
    },
    [persist, showToast],
  )

  const importData = useCallback(
    async (file) => {
      const imported = await storageService.importData(file)
      setData(imported)
      showToast('Dados importados com sucesso!')
    },
    [showToast],
  )

  const exportData = useCallback(() => {
    storageService.exportData()
    showToast('Backup exportado!')
  }, [showToast])

  const clearAll = useCallback(() => {
    const defaults = storageService.clearAll()
    setData(defaults)
    setGeneratedPlan(null)
    showToast('Dados resetados.')
  }, [showToast])

  const performance = useMemo(
    () => getPerformanceSummary(data.workouts, data.history),
    [data.workouts, data.history],
  )

  const value = {
    profile: data.profile,
    workouts: data.workouts,
    plans: data.plans,
    history: data.history,
    goals: data.goals,
    performance,
    toasts,
    activeWorkout,
    generatedPlan,
    setActiveWorkout,
    setGeneratedPlan,
    showToast,
    updateProfile,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
    completeWorkout,
    savePlan,
    addPlanWorkouts,
    startWorkout,
    addWorkoutToPlan,
    addExerciseToPlan,
    updateGoals,
    importData,
    exportData,
    clearAll,
  }

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
}

export function useFitness() {
  const ctx = useContext(FitnessContext)
  if (!ctx) throw new Error('useFitness deve ser usado dentro de FitnessProvider')
  return ctx
}
