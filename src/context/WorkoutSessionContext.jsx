import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import { useWorkoutPlan } from './WorkoutPlanContext'
import storageService from '../services/storageService'
import {
  cancelWorkoutSession,
  completeWorkoutSession,
  getActiveSession,
  getWorkoutSession,
  listWorkoutSessions,
  startWorkoutSession,
  updateWorkoutSession,
} from '../services/workoutSessionService'
import {
  listSessionSets,
  saveWorkoutSet,
} from '../services/workoutSetService'

const WorkoutSessionContext = createContext(null)

const PENDING_SETS_KEY = 'evoluafit-pending-workout-sets'
const HISTORY_MIGRATION_KEY = (userId) => `evoluafit-workout-history-migrated-${userId}`
const LOCAL_OWNER_KEY = 'evoluafit-workout-session-local-owner'

function readPendingSets() {
  try {
    const raw = localStorage.getItem(PENDING_SETS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePendingSets(list) {
  try {
    localStorage.setItem(PENDING_SETS_KEY, JSON.stringify(list.slice(0, 200)))
  } catch {
    /* ignore */
  }
}

function isHistoryMigrated(userId) {
  try {
    return localStorage.getItem(HISTORY_MIGRATION_KEY(userId)) === '1'
  } catch {
    return false
  }
}

function markHistoryMigrated(userId) {
  try {
    localStorage.setItem(HISTORY_MIGRATION_KEY(userId), '1')
  } catch {
    /* ignore */
  }
}

function getLocalOwner() {
  try {
    return localStorage.getItem(LOCAL_OWNER_KEY) || ''
  } catch {
    return ''
  }
}

function setLocalOwner(userId) {
  try {
    if (userId) localStorage.setItem(LOCAL_OWNER_KEY, userId)
  } catch {
    /* ignore */
  }
}

function buildPlanDayKey(workout) {
  if (!workout) return null
  if (workout.planId != null && workout.dayNumber != null) {
    return `${workout.planId}:${workout.dayNumber}`
  }
  if (workout.dayNumber != null) return `day-${workout.dayNumber}`
  return workout.id || null
}

function buildWorkoutSnapshot(workout) {
  if (!workout || typeof workout !== 'object') return null
  return {
    id: workout.id,
    name: workout.name,
    planId: workout.planId || null,
    dayNumber: workout.dayNumber ?? null,
    muscleGroups: workout.muscleGroups || [],
    estimatedMinutes: workout.estimatedMinutes ?? null,
    workoutType: workout.workoutType || null,
    exercises: (workout.exercises || []).map((ex) => ({
      exerciseId: ex.exerciseId || ex.id || '',
      name: ex.name,
      muscleGroup: ex.muscleGroup || '',
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds ?? ex.rest ?? null,
      load: ex.load || '',
    })),
  }
}

function parseWeight(value) {
  if (value == null || value === '') return null
  const n = parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function parseReps(value) {
  if (value == null || value === '') return null
  const n = parseInt(String(value).match(/\d+/)?.[0] || '', 10)
  return Number.isFinite(n) ? n : null
}

function isValidLocalHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return false
  if (!entry.name && !entry.workoutName) return false
  if (!entry.completedAt && !entry.date) return false
  const exercises = entry.exercises || []
  if (!Array.isArray(exercises) || exercises.length === 0) return false
  const hasSets = exercises.some(
    (ex) =>
      (Array.isArray(ex.setsLog) && ex.setsLog.length > 0) ||
      Number(ex.completedSets) > 0 ||
      Number(ex.sets) > 0,
  )
  return hasSets
}

function mapRemoteSessionToHistoryItem(session, sets = []) {
  const exercisesMap = new Map()
  sets.forEach((row) => {
    const key = `${row.exercise_order}-${row.exercise_key || row.exercise_name}`
    if (!exercisesMap.has(key)) {
      exercisesMap.set(key, {
        exerciseId: row.exercise_key,
        name: row.exercise_name,
        completedSets: 0,
        setsLog: [],
        reps: row.planned_reps || '',
        load: '',
      })
    }
    const ex = exercisesMap.get(key)
    if (row.completed) ex.completedSets += 1
    ex.setsLog.push({
      setNumber: row.set_number,
      weight: row.weight != null ? String(row.weight) : '',
      load: row.weight != null ? String(row.weight) : '',
      reps: row.repetitions != null ? String(row.repetitions) : '',
      completed: Boolean(row.completed),
      done: Boolean(row.completed),
      rpe: row.rpe,
      notes: row.notes || '',
    })
    if (row.weight != null) ex.load = String(row.weight)
    if (row.repetitions != null) ex.reps = String(row.repetitions)
  })

  const exercises = [...exercisesMap.values()]
  const durationMinutes = session.duration_seconds
    ? Math.max(1, Math.round(session.duration_seconds / 60))
    : null

  return {
    id: session.id,
    remoteSessionId: session.id,
    workoutId: session.workout_snapshot?.id || null,
    name: session.workout_name,
    completedAt: session.completed_at || session.started_at,
    durationMinutes,
    durationSeconds: session.duration_seconds,
    exercises,
    notes: session.notes || '',
    perceivedEffort: session.perceived_effort,
    status: session.status,
    partial: false,
    noSession: false,
    setCount: sets.filter((s) => s.completed).length,
    exerciseCount: exercises.length,
  }
}

export function WorkoutSessionProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { workoutPlan } = useWorkoutPlan()

  const [activeSession, setActiveSession] = useState(null)
  const [sessionSets, setSessionSets] = useState([])
  const [sessionHistory, setSessionHistory] = useState([])
  const [loadingSession, setLoadingSession] = useState(true)
  const [savingSession, setSavingSession] = useState(false)
  const [savingSetKey, setSavingSetKey] = useState('')
  const [syncPending, setSyncPending] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [conflictSession, setConflictSession] = useState(null)

  const requestIdRef = useRef(0)
  const hydratedUserRef = useRef(null)
  const saveLockRef = useRef(false)

  const clearSessionState = useCallback(() => {
    requestIdRef.current += 1
    hydratedUserRef.current = null
    saveLockRef.current = false
    setActiveSession(null)
    setSessionSets([])
    setSessionHistory([])
    setLoadingSession(false)
    setSavingSession(false)
    setSavingSetKey('')
    setSyncPending(false)
    setSessionError(null)
    setConflictSession(null)
  }, [])

  const flushPendingSets = useCallback(async (sessionId) => {
    if (!sessionId) return
    const pending = readPendingSets().filter((p) => p.sessionId === sessionId)
    if (!pending.length) {
      setSyncPending(readPendingSets().length > 0)
      return
    }

    const remaining = readPendingSets().filter((p) => p.sessionId !== sessionId)
    for (const item of pending) {
      const { error } = await saveWorkoutSet(sessionId, item.setData)
      if (error) {
        remaining.push(item)
      }
    }
    writePendingSets(remaining)
    setSyncPending(remaining.length > 0)

    const { data } = await listSessionSets(sessionId)
    if (data) setSessionSets(data)
  }, [])

  const migrateLocalHistoryIfNeeded = useCallback(async (userId) => {
    if (!userId || isHistoryMigrated(userId)) return

    const owner = getLocalOwner()
    if (owner && owner !== userId) {
      markHistoryMigrated(userId)
      return
    }

    const { data: remote, error } = await listWorkoutSessions(userId, {
      statuses: ['completed', 'cancelled'],
      limit: 5,
    })
    if (error) return
    if (remote?.length) {
      markHistoryMigrated(userId)
      setLocalOwner(userId)
      return
    }

    const localHistory = storageService.load()?.history || []
    const valid = localHistory.filter(isValidLocalHistoryEntry)
    if (!valid.length) {
      markHistoryMigrated(userId)
      setLocalOwner(userId)
      return
    }

    for (const entry of valid.slice(0, 30)) {
      const snapshot = {
        id: entry.workoutId || entry.id,
        name: entry.name,
        exercises: entry.exercises || [],
      }
      const { data: created, error: createError } = await startWorkoutSession(userId, {
        workout_plan_id: null,
        plan_day_key: entry.workoutId || entry.id,
        workout_name: entry.name,
        started_at: entry.completedAt,
        notes: entry.notes || null,
        workout_snapshot: snapshot,
      })
      if (createError || !created) continue

      const exercises = entry.exercises || []
      for (let exOrder = 0; exOrder < exercises.length; exOrder += 1) {
        const ex = exercises[exOrder]
        const logs = Array.isArray(ex.setsLog) && ex.setsLog.length
          ? ex.setsLog
          : Array.from({ length: Number(ex.completedSets) || 0 }, (_, i) => ({
              setNumber: i + 1,
              reps: ex.reps,
              weight: ex.load,
              completed: true,
            }))

        for (const log of logs) {
          if (Array.isArray(ex.setsLog) && ex.setsLog.length && !log?.completed && !log?.done) continue
          await saveWorkoutSet(created.id, {
            exercise_key: ex.exerciseId || ex.name || `ex-${exOrder}`,
            exercise_name: ex.name || 'Exercício',
            exercise_order: exOrder,
            set_number: Number(log.setNumber) || 1,
            planned_reps: ex.reps || null,
            repetitions: parseReps(log.reps ?? ex.reps),
            weight: parseWeight(log.weight ?? log.load ?? ex.load),
            completed: true,
            notes: log.notes || ex.notes || null,
          })
        }
      }

      const durationSeconds =
        entry.durationMinutes != null ? Math.round(Number(entry.durationMinutes) * 60) : null

      await completeWorkoutSession(userId, created.id, {
        completed_at: entry.completedAt,
        duration_seconds: durationSeconds,
        notes: entry.notes || null,
      })
    }

    markHistoryMigrated(userId)
    setLocalOwner(userId)
  }, [])

  const refreshSession = useCallback(async () => {
    if (!user?.id) {
      clearSessionState()
      return { data: null, error: null }
    }

    const requestId = ++requestIdRef.current
    setLoadingSession(true)
    setSessionError(null)

    const { data: active, error: activeError } = await getActiveSession(user.id)
    if (requestId !== requestIdRef.current) return { data: null, error: null }

    if (activeError) {
      setSessionError(activeError.message || 'Não foi possível carregar a sessão.')
      setLoadingSession(false)
      return { data: null, error: activeError }
    }

    setActiveSession(active)
    if (active?.id) {
      const { data: sets } = await listSessionSets(active.id)
      if (requestId !== requestIdRef.current) return { data: null, error: null }
      setSessionSets(sets || [])
      await flushPendingSets(active.id)
    } else {
      setSessionSets([])
    }

    const { data: sessions, error: listError } = await listWorkoutSessions(user.id, {
      statuses: ['completed', 'cancelled'],
      limit: 40,
    })
    if (requestId !== requestIdRef.current) return { data: null, error: null }

    if (listError) {
      setSessionError(listError.message || 'Não foi possível carregar o histórico.')
    } else {
      const mapped = []
      for (const session of sessions || []) {
        const { data: sets } = await listSessionSets(session.id)
        mapped.push(mapRemoteSessionToHistoryItem(session, sets || []))
      }
      setSessionHistory(mapped)
    }

    const hadRemoteHistory = Boolean(sessions?.length)
    await migrateLocalHistoryIfNeeded(user.id)

    if (!hadRemoteHistory) {
      const { data: afterMigrate } = await listWorkoutSessions(user.id, {
        statuses: ['completed', 'cancelled'],
        limit: 40,
      })
      if (afterMigrate?.length) {
        const mapped = []
        for (const session of afterMigrate) {
          const { data: sets } = await listSessionSets(session.id)
          mapped.push(mapRemoteSessionToHistoryItem(session, sets || []))
        }
        setSessionHistory(mapped)
      }
    }

    setLocalOwner(user.id)
    setLoadingSession(false)
    setSyncPending(readPendingSets().length > 0)
    return { data: active, error: null }
  }, [user?.id, clearSessionState, flushPendingSets, migrateLocalHistoryIfNeeded])

  useEffect(() => {
    if (authLoading) return undefined
    if (!user?.id) {
      clearSessionState()
      return undefined
    }
    if (hydratedUserRef.current === user.id) return undefined
    hydratedUserRef.current = user.id
    refreshSession()
    return undefined
  }, [authLoading, user?.id, refreshSession, clearSessionState])

  const startSession = useCallback(
    async (workout, options = {}) => {
      if (!user?.id) {
        return { data: null, error: { message: 'Usuário não autenticado.' } }
      }
      if (!workout) {
        return { data: null, error: { message: 'Treino não informado.' } }
      }

      const { data: existing } = await getActiveSession(user.id)
      if (existing && !options.force) {
        const sameWorkout =
          existing.workout_snapshot?.id === workout.id ||
          existing.plan_day_key === buildPlanDayKey(workout)
        if (!sameWorkout) {
          setConflictSession(existing)
          return { data: null, error: { code: 'ACTIVE_SESSION_EXISTS', session: existing } }
        }
        setActiveSession(existing)
        const { data: sets } = await listSessionSets(existing.id)
        setSessionSets(sets || [])
        setConflictSession(null)
        return { data: existing, error: null, resumed: true }
      }

      if (existing && options.force) {
        await cancelWorkoutSession(user.id, existing.id)
      }

      if (saveLockRef.current) {
        return { data: null, error: { message: 'Aguarde o salvamento atual.' } }
      }
      saveLockRef.current = true
      setSavingSession(true)
      setSessionError(null)

      const { data, error } = await startWorkoutSession(user.id, {
        workout_plan_id: workoutPlan?.id || null,
        plan_day_key: buildPlanDayKey(workout),
        workout_name: workout.name || 'Treino',
        started_at: new Date().toISOString(),
        workout_snapshot: buildWorkoutSnapshot(workout),
      })

      saveLockRef.current = false
      setSavingSession(false)

      if (error) {
        setSessionError(error.message || 'Não foi possível iniciar a sessão.')
        return { data: null, error }
      }

      setActiveSession(data)
      setSessionSets([])
      setConflictSession(null)
      setLocalOwner(user.id)
      return { data, error: null }
    },
    [user?.id, workoutPlan?.id],
  )

  const resumeSession = useCallback(async () => {
    if (!user?.id) return { data: null, error: { message: 'Usuário não autenticado.' } }
    const { data, error } = await getActiveSession(user.id)
    if (error) {
      setSessionError(error.message || 'Não foi possível retomar a sessão.')
      return { data: null, error }
    }
    setActiveSession(data)
    if (data?.id) {
      const { data: sets } = await listSessionSets(data.id)
      setSessionSets(sets || [])
      await flushPendingSets(data.id)
    }
    setConflictSession(null)
    return { data, error: null }
  }, [user?.id, flushPendingSets])

  const saveSet = useCallback(
    async (setInput) => {
      if (!user?.id) {
        return { data: null, error: { message: 'Usuário não autenticado.' } }
      }
      const sessionId = activeSession?.id
      if (!sessionId) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }

      const setKey = `${setInput.exercise_order ?? setInput.exerciseOrder}-${setInput.set_number ?? setInput.setNumber}`
      setSavingSetKey(setKey)

      const setData = {
        exercise_key: setInput.exercise_key || setInput.exerciseKey || setInput.exerciseId || '',
        exercise_name: setInput.exercise_name || setInput.exerciseName || setInput.name || '',
        exercise_order: Number(setInput.exercise_order ?? setInput.exerciseOrder ?? 0),
        set_number: Number(setInput.set_number ?? setInput.setNumber ?? 1),
        set_type: setInput.set_type || 'working',
        planned_reps: setInput.planned_reps ?? setInput.plannedReps ?? null,
        repetitions: parseReps(setInput.repetitions ?? setInput.reps),
        weight: parseWeight(setInput.weight ?? setInput.load),
        rpe: setInput.rpe ?? null,
        completed: setInput.completed !== false,
        notes: setInput.notes ?? null,
      }

      const { data, error } = await saveWorkoutSet(sessionId, setData)
      setSavingSetKey('')

      if (error) {
        const pending = readPendingSets()
        pending.push({
          id: `${sessionId}-${setKey}-${Date.now()}`,
          sessionId,
          setData,
          createdAt: new Date().toISOString(),
        })
        writePendingSets(pending)
        setSyncPending(true)
        setSessionError('Sincronização pendente')
        return { data: null, error, pending: true }
      }

      setSessionSets((prev) => {
        const without = prev.filter(
          (s) =>
            !(
              Number(s.exercise_order) === Number(setData.exercise_order) &&
              Number(s.set_number) === Number(setData.set_number)
            ),
        )
        return [...without, data].sort(
          (a, b) =>
            Number(a.exercise_order) - Number(b.exercise_order) ||
            Number(a.set_number) - Number(b.set_number),
        )
      })
      await flushPendingSets(sessionId)
      return { data, error: null }
    },
    [user?.id, activeSession?.id, flushPendingSets],
  )

  const completeSession = useCallback(
    async (completionData = {}) => {
      if (!user?.id || !activeSession?.id) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }
      if (saveLockRef.current) {
        return { data: null, error: { message: 'Aguarde o salvamento atual.' } }
      }

      saveLockRef.current = true
      setSavingSession(true)
      await flushPendingSets(activeSession.id)

      const { data, error } = await completeWorkoutSession(user.id, activeSession.id, {
        completed_at: completionData.completed_at || new Date().toISOString(),
        duration_seconds: completionData.duration_seconds ?? null,
        perceived_effort: completionData.perceived_effort ?? null,
        notes: completionData.notes ?? null,
      })

      saveLockRef.current = false
      setSavingSession(false)

      if (error) {
        setSessionError(error.message || 'Não foi possível finalizar a sessão.')
        return { data: null, error }
      }

      const { data: sets } = await listSessionSets(activeSession.id)
      const historyItem = mapRemoteSessionToHistoryItem(data, sets || [])
      setSessionHistory((prev) => [historyItem, ...prev.filter((h) => h.id !== historyItem.id)])
      setActiveSession(null)
      setSessionSets([])
      setConflictSession(null)
      return { data, error: null, historyItem }
    },
    [user?.id, activeSession, flushPendingSets],
  )

  const cancelSession = useCallback(
    async (sessionId = activeSession?.id) => {
      if (!user?.id || !sessionId) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }
      if (!window.confirm('Cancelar o treino em andamento? Os dados já registrados serão preservados.')) {
        return { data: null, error: { code: 'ABORTED' } }
      }

      setSavingSession(true)
      const { data, error } = await cancelWorkoutSession(user.id, sessionId)
      setSavingSession(false)

      if (error) {
        setSessionError(error.message || 'Não foi possível cancelar a sessão.')
        return { data: null, error }
      }

      if (activeSession?.id === sessionId) {
        setActiveSession(null)
        setSessionSets([])
      }
      setConflictSession(null)
      await refreshSession()
      return { data, error: null }
    },
    [user?.id, activeSession?.id, refreshSession],
  )

  const value = useMemo(
    () => ({
      activeSession,
      sessionSets,
      sessionHistory,
      loadingSession: authLoading || loadingSession,
      savingSession,
      savingSetKey,
      syncPending,
      sessionError,
      conflictSession,
      startSession,
      resumeSession,
      saveSet,
      completeSession,
      cancelSession,
      refreshSession,
      clearSessionState,
      setConflictSession,
    }),
    [
      activeSession,
      sessionSets,
      sessionHistory,
      authLoading,
      loadingSession,
      savingSession,
      savingSetKey,
      syncPending,
      sessionError,
      conflictSession,
      startSession,
      resumeSession,
      saveSet,
      completeSession,
      cancelSession,
      refreshSession,
      clearSessionState,
    ],
  )

  return (
    <WorkoutSessionContext.Provider value={value}>{children}</WorkoutSessionContext.Provider>
  )
}

export function useWorkoutSession() {
  const context = useContext(WorkoutSessionContext)
  if (!context) {
    throw new Error('useWorkoutSession deve ser usado dentro de WorkoutSessionProvider')
  }
  return context
}

export { buildPlanDayKey, buildWorkoutSnapshot, mapRemoteSessionToHistoryItem }