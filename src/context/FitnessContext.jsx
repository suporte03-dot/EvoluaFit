import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import storageService from '../services/storageService'
import { buildHistoryEntry } from '../services/workoutService'
import { getPerformanceSummary } from '../utils/performanceUtils'
import { parseSets, parseRestSeconds } from '../data/exercisesData'
import {
  ensureCalendarMirror,
  markWorkoutPartial,
  mirrorCalendar,
  toPersistedStatus,
} from '../utils/calendarUtils'
import {
  appendProgressEntries,
  buildProgressEntriesFromSession,
  clearActiveSession,
  loadActiveSession,
} from '../utils/progressStorage'

const FitnessContext = createContext(null)

export function FitnessProvider({ children }) {
  const [data, setData] = useState(() => storageService.load())
  const [toasts, setToasts] = useState([])
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [pendingSession, setPendingSession] = useState(() => loadActiveSession())
  const [generatedPlan, setGeneratedPlan] = useState(() => {
    const loaded = storageService.load()
    return loaded.plans?.[0] || null
  })

  useEffect(() => {
    ensureCalendarMirror(data.workouts)
  }, [])

  useEffect(() => {
    if (activeWorkout) {
      setPendingSession(null)
      return
    }
    setPendingSession(loadActiveSession())
  }, [activeWorkout])

  const refreshPendingSession = useCallback(() => {
    if (activeWorkout) {
      setPendingSession(null)
      return null
    }
    const saved = loadActiveSession()
    setPendingSession(saved)
    return saved
  }, [activeWorkout])

  const persist = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      // Preserve nested satellite fields when updater only touches core slices
      const merged = {
        ...prev,
        ...next,
        progressHistory: next.progressHistory ?? prev.progressHistory,
        activeSession: next.activeSession !== undefined ? next.activeSession : prev.activeSession,
        calendarMirror: next.calendarMirror ?? prev.calendarMirror,
        coachMessages: next.coachMessages ?? prev.coachMessages,
        preferences: next.preferences ?? prev.preferences,
      }
      storageService.save(merged)
      mirrorCalendar(merged.workouts)
      return merged
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
      const isPartial = Boolean(sessionData?.partial)
      const workout = data.workouts.find((w) => w.id === workoutId)

      const progressRows = buildProgressEntriesFromSession(
        workout || { id: workoutId, name: sessionData?.name },
        (sessionData?.exercises || []).map((ex) => ({
          ...ex,
          setsLog: ex.setsLog || [],
        })),
        { date: entry.completedAt, workoutId, workoutName: sessionData?.name },
      )
      if (progressRows.length) appendProgressEntries(progressRows)
      clearActiveSession()

      persist((prev) => {
        const exists = prev.workouts.some((w) => w.id === workoutId)
        const updatedFields = {
          status: isPartial ? toPersistedStatus('partial') : toPersistedStatus('completed'),
          completedAt: entry.completedAt,
          date: entry.completedAt.split('T')[0],
          exercises: sessionData.exercises,
          estimatedMinutes: sessionData.durationMinutes ?? workout?.estimatedMinutes,
          notes: sessionData.notes != null ? sessionData.notes : workout?.notes,
          name: sessionData.name || workout?.name,
          muscleGroups: sessionData.muscleGroups || workout?.muscleGroups,
        }

        const workouts = exists
          ? prev.workouts.map((w) => (w.id === workoutId ? { ...w, ...updatedFields } : w))
          : [
              {
                id: workoutId,
                name: sessionData.name || 'Treino',
                muscleGroups: sessionData.muscleGroups || [],
                createdAt: new Date().toISOString(),
                ...updatedFields,
              },
              ...prev.workouts,
            ]

        return {
          ...prev,
          history: [entry, ...prev.history],
          workouts,
          activeSession: null,
        }
      })
      setActiveWorkout(null)
      showToast(isPartial ? 'Treino marcado como parcial.' : 'Treino finalizado com sucesso!')
    },
    [persist, showToast, data.workouts],
  )

  const savePlan = useCallback(
    (plan) => {
      persist((prev) => {
        const withoutDup = (prev.plans || []).filter((p) => p.id !== plan.id)
        return { ...prev, plans: [plan, ...withoutDup] }
      })
      setGeneratedPlan(plan)
    },
    [persist],
  )

  const updatePlanDay = useCallback(
    (planId, dayNumber, dayUpdates) => {
      let updatedPlan = null
      persist((prev) => {
        const plans = (prev.plans || []).map((plan) => {
          if (plan.id !== planId) return plan
          const days = plan.weeklyPlan || plan.schedule || []
          const key = plan.weeklyPlan ? 'weeklyPlan' : 'schedule'
          const nextPlan = {
            ...plan,
            [key]: days.map((day) =>
              day.day === dayNumber || day.dayNumber === dayNumber
                ? { ...day, ...dayUpdates }
                : day,
            ),
          }
          updatedPlan = nextPlan
          return nextPlan
        })
        const workouts = prev.workouts.map((w) => {
          if (w.planId !== planId) return w
          if (w.dayNumber !== dayNumber) return w
          return {
            ...w,
            name: dayUpdates.workoutName || dayUpdates.name || w.name,
            exercises: dayUpdates.exercises
              ? dayUpdates.exercises.map((ex) => ({ ...ex }))
              : w.exercises,
            muscleGroups: dayUpdates.muscleGroups || dayUpdates.focus || w.muscleGroups,
            estimatedMinutes:
              dayUpdates.estimatedDuration || dayUpdates.estimatedMinutes || w.estimatedMinutes,
            volumeSummary: dayUpdates.volumeSummary || w.volumeSummary,
          }
        })
        return { ...prev, plans, workouts }
      })
      if (updatedPlan) setGeneratedPlan(updatedPlan)
    },
    [persist],
  )

  const addPlanWorkouts = useCallback(
    (incoming, { replaceAll = false, silent = false } = {}) => {
      const workouts = (incoming || []).map((w) => ({
        ...w,
        exercises: (w.exercises || []).map((ex) => ({ ...ex })),
      }))
      if (!workouts.length) return

      persist((prev) => {
        const planId = workouts[0]?.planId
        if (!planId) {
          return { ...prev, workouts: [...workouts, ...prev.workouts] }
        }

        const existingForPlan = prev.workouts.filter((w) => w.planId === planId)
        const others = prev.workouts.filter((w) => w.planId !== planId)

        if (replaceAll || !existingForPlan.length) {
          return { ...prev, workouts: [...workouts, ...others] }
        }

        const byDay = new Map(
          existingForPlan.map((w) => [Number(w.dayNumber ?? w.day), w]),
        )

        const merged = workouts.map((nw) => {
          const dayKey = Number(nw.dayNumber ?? nw.day)
          const prevDay = byDay.get(dayKey)
          if (!prevDay) return nw

          const status = String(prevDay.status || '').toLowerCase()
          const hasProgress =
            status === 'realizado' ||
            status === 'parcial' ||
            status === 'completed' ||
            status === 'done' ||
            status === 'partial'

          byDay.delete(dayKey)

          if (hasProgress) {
            return {
              ...nw,
              id: prevDay.id,
              status: prevDay.status,
              completedAt: prevDay.completedAt,
              exercises: (prevDay.exercises || []).map((ex) => ({ ...ex })),
            }
          }

          return {
            ...nw,
            id: prevDay.id,
            status: prevDay.status || nw.status,
          }
        })

        const preservedOrphans = [...byDay.values()].filter((w) => {
          const status = String(w.status || '').toLowerCase()
          return (
            status === 'realizado' ||
            status === 'parcial' ||
            status === 'completed' ||
            status === 'done' ||
            status === 'partial'
          )
        })

        return { ...prev, workouts: [...merged, ...preservedOrphans, ...others] }
      })

      if (!silent) {
        showToast(`${workouts.length} treinos salvos na sua planilha!`)
      }
    },
    [persist, showToast],
  )

  const startWorkout = useCallback((workout) => {
    if (!workout) return
    setActiveWorkout(workout)
  }, [])

  const markWorkoutInProgress = useCallback(
    (workoutId) => {
      if (!workoutId) return
      persist((prev) => ({
        ...prev,
        workouts: markWorkoutPartial(prev.workouts, workoutId),
      }))
    },
    [persist],
  )

  const resumePendingSession = useCallback(() => {
    const saved = loadActiveSession()
    if (!saved?.workoutId) {
      setPendingSession(null)
      showToast('Nenhuma sessão pendente.', 'info')
      return
    }
    const fromPlan = data.workouts.find((w) => w.id === saved.workoutId)
    setActiveWorkout(
      fromPlan || {
        id: saved.workoutId,
        name: saved.workoutName || 'Treino',
        exercises: (saved.sessionExercises || []).map((ex) => ({ ...ex })),
        status: 'Parcial',
      },
    )
  }, [data.workouts, showToast])

  const discardPendingSession = useCallback(() => {
    clearActiveSession()
    setPendingSession(null)
    persist((prev) => ({ ...prev, activeSession: null }))
    showToast('Sessão descartada.', 'info')
  }, [persist, showToast])

  const markWorkoutDoneWithoutSession = useCallback(
    (workoutId) => {
      const workout = data.workouts.find((w) => w.id === workoutId)
      if (!workout) return

      const completedAt = new Date().toISOString()
      const entry = {
        id: `hist-${Date.now()}`,
        workoutId,
        name: workout.name,
        completedAt,
        durationMinutes: workout.estimatedMinutes || 0,
        exercises: (workout.exercises || []).map((ex) => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          load: '',
          completedSets: 0,
          setsLog: [],
        })),
        notes: 'Marcado como realizado sem sessão registrada (sem cargas).',
        noSession: true,
        partial: false,
      }

      persist((prev) => ({
        ...prev,
        history: [entry, ...prev.history],
        workouts: prev.workouts.map((w) =>
          w.id === workoutId
            ? {
                ...w,
                status: toPersistedStatus('completed'),
                completedAt,
                date: completedAt.split('T')[0],
              }
            : w,
        ),
      }))
      showToast('Treino marcado — sem cargas no desempenho.', 'info')
    },
    [data.workouts, persist, showToast],
  )

  const replaceWorkouts = useCallback(
    (workouts, toastMessage) => {
      persist((prev) => ({ ...prev, workouts }))
      if (toastMessage) showToast(toastMessage)
    },
    [persist, showToast],
  )

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

  const clearActivePlan = useCallback(() => {
    persist((prev) => ({ ...prev, plans: [] }))
    setGeneratedPlan(null)
  }, [persist])

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
    pendingSession,
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
    updatePlanDay,
    addPlanWorkouts,
    startWorkout,
    markWorkoutInProgress,
    resumePendingSession,
    discardPendingSession,
    refreshPendingSession,
    markWorkoutDoneWithoutSession,
    replaceWorkouts,
    addWorkoutToPlan,
    addExerciseToPlan,
    updateGoals,
    importData,
    exportData,
    clearAll,
    clearActivePlan,
  }

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
}

export function useFitness() {
  const ctx = useContext(FitnessContext)
  if (!ctx) throw new Error('useFitness deve ser usado dentro de FitnessProvider')
  return ctx
}
