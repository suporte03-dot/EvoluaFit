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
  listWorkoutSessions,
  upsertWorkoutSession,
} from '../services/workoutSessionService'
import {
  listSessionSets,
  upsertWorkoutSet,
} from '../services/workoutSetService'
import {
  deleteWorkoutDraft,
  enqueueOperation,
  getPendingCount,
  getWorkoutDraft,
  listWorkoutDrafts,
  saveWorkoutDraft,
  syncPendingOperations,
} from '../services/offlineSyncService'

const WorkoutSessionContext = createContext(null)

const HISTORY_MIGRATION_KEY = (userId) => `evoluafit-workout-history-migrated-${userId}`
const LOCAL_OWNER_KEY = 'evoluafit-workout-session-local-owner'
const LEGACY_PENDING_SETS_KEY = 'evoluafit-pending-workout-sets'

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

function setSlotKey(exerciseOrder, setNumber) {
  return `${Number(exerciseOrder)}-${Number(setNumber)}`
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
      clientId: row.client_id || null,
    })
    if (row.weight != null) ex.load = String(row.weight)
    if (row.repetitions != null) ex.reps = String(row.repetitions)
  })

  const exercises = [...exercisesMap.values()]
  const durationMinutes = session.duration_seconds
    ? Math.max(1, Math.round(session.duration_seconds / 60))
    : null

  return {
    id: session.id || session.client_id,
    remoteSessionId: session.id || null,
    clientId: session.client_id || null,
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

async function persistActiveDraft(userId, session, sets, setClientIds) {
  if (!userId || !session?.client_id) return
  await saveWorkoutDraft(userId, session.client_id, {
    session,
    sets: sets || [],
    setClientIds: setClientIds || {},
  })
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
  const setClientIdsRef = useRef({})
  const activeSessionRef = useRef(null)
  const sessionSetsRef = useRef([])

  useEffect(() => {
    activeSessionRef.current = activeSession
  }, [activeSession])

  useEffect(() => {
    sessionSetsRef.current = sessionSets
  }, [sessionSets])

  const refreshPendingFlag = useCallback(async () => {
    if (!user?.id) {
      setSyncPending(false)
      return
    }
    const count = await getPendingCount(user.id)
    setSyncPending(count > 0)
  }, [user?.id])

  const clearSessionState = useCallback(() => {
    requestIdRef.current += 1
    hydratedUserRef.current = null
    saveLockRef.current = false
    setClientIdsRef.current = {}
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

  const migrateLegacyPendingSets = useCallback(async (userId) => {
    if (!userId) return
    try {
      const raw = localStorage.getItem(LEGACY_PENDING_SETS_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || !parsed.length) {
        localStorage.removeItem(LEGACY_PENDING_SETS_KEY)
        return
      }
      for (const item of parsed) {
        if (!item?.setData || !item?.sessionId) continue
        const clientId = item.setData.client_id || crypto.randomUUID()
        await enqueueOperation({
          userId,
          entity: 'workout_set',
          action: 'update',
          clientId,
          parentClientId: item.sessionClientId || null,
          payload: {
            ...item.setData,
            client_id: clientId,
            session_id: item.sessionId,
            updated_at: item.createdAt || new Date().toISOString(),
          },
        })
      }
      localStorage.removeItem(LEGACY_PENDING_SETS_KEY)
    } catch {
      /* ignore legacy migration errors */
    }
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
      const clientId = crypto.randomUUID()
      const snapshot = {
        id: entry.workoutId || entry.id,
        name: entry.name,
        exercises: entry.exercises || [],
      }
      const { data: created, error: createError } = await upsertWorkoutSession(userId, {
        client_id: clientId,
        workout_plan_id: null,
        plan_day_key: entry.workoutId || entry.id,
        workout_name: entry.name,
        started_at: entry.completedAt,
        notes: entry.notes || null,
        workout_snapshot: snapshot,
        status: 'in_progress',
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
          await upsertWorkoutSet(created.id, {
            client_id: crypto.randomUUID(),
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

  const restoreLocalActiveDraft = useCallback(async (userId) => {
    const drafts = await listWorkoutDrafts(userId)
    const activeDraft = drafts
      .filter((d) => d?.data?.session?.status === 'in_progress')
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]

    if (!activeDraft?.data?.session) return null

    const session = activeDraft.data.session
    setClientIdsRef.current = activeDraft.data.setClientIds || {}
    setActiveSession(session)
    setSessionSets(activeDraft.data.sets || [])
    return session
  }, [])

  const refreshSession = useCallback(async () => {
    if (!user?.id) {
      clearSessionState()
      return { data: null, error: null }
    }

    const requestId = ++requestIdRef.current
    setLoadingSession(true)
    setSessionError(null)
    await migrateLegacyPendingSets(user.id)

    const { data: active, error: activeError } = await getActiveSession(user.id)
    if (requestId !== requestIdRef.current) return { data: null, error: null }

    if (activeError) {
      const restored = await restoreLocalActiveDraft(user.id)
      if (restored) {
        setSessionError('Sincronização pendente')
        setSyncPending(true)
        setLoadingSession(false)
        return { data: restored, error: null, pending: true }
      }
      setSessionError(activeError.message || 'Não foi possível carregar a sessão.')
      setLoadingSession(false)
      return { data: null, error: activeError }
    }

    if (active) {
      setActiveSession(active)
      const { data: sets } = await listSessionSets(active.id)
      if (requestId !== requestIdRef.current) return { data: null, error: null }
      const nextSets = sets || []
      setSessionSets(nextSets)
      const map = {}
      nextSets.forEach((s) => {
        if (s.client_id) map[setSlotKey(s.exercise_order, s.set_number)] = s.client_id
      })
      setClientIdsRef.current = map
      await persistActiveDraft(user.id, active, nextSets, map)
    } else {
      const restored = await restoreLocalActiveDraft(user.id)
      if (!restored) {
        setActiveSession(null)
        setSessionSets([])
        setClientIdsRef.current = {}
      }
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
    await refreshPendingFlag()
    setLoadingSession(false)
    return { data: active, error: null }
  }, [
    user?.id,
    clearSessionState,
    migrateLocalHistoryIfNeeded,
    migrateLegacyPendingSets,
    restoreLocalActiveDraft,
    refreshPendingFlag,
  ])

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

      let existing = null
      try {
        const remote = await getActiveSession(user.id)
        existing = remote.data
        if (remote.error && remote.error.code === 'NETWORK') {
          const restored = await restoreLocalActiveDraft(user.id)
          if (restored && !options.force) {
            existing = restored
          }
        }
      } catch {
        const restored = await restoreLocalActiveDraft(user.id)
        if (restored) existing = restored
      }

      if (existing && !options.force) {
        const sameWorkout =
          existing.workout_snapshot?.id === workout.id ||
          existing.plan_day_key === buildPlanDayKey(workout)
        if (!sameWorkout) {
          setConflictSession(existing)
          return { data: null, error: { code: 'ACTIVE_SESSION_EXISTS', session: existing } }
        }
        setActiveSession(existing)
        if (existing.id) {
          const { data: sets } = await listSessionSets(existing.id)
          setSessionSets(sets || [])
        }
        setConflictSession(null)
        return { data: existing, error: null, resumed: true }
      }

      if (existing && options.force) {
        if (existing.id) {
          await cancelWorkoutSession(user.id, existing.id)
        } else if (existing.client_id) {
          await enqueueOperation({
            userId: user.id,
            entity: 'workout_session',
            action: 'cancel',
            clientId: existing.client_id,
            payload: {
              ...existing,
              status: 'cancelled',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          })
          await syncPendingOperations(user.id)
        }
      }

      if (saveLockRef.current) {
        return { data: null, error: { message: 'Aguarde o salvamento atual.' } }
      }
      saveLockRef.current = true
      setSavingSession(true)
      setSessionError(null)

      const clientId = crypto.randomUUID()
      const startedAt = new Date().toISOString()
      const localSession = {
        id: null,
        client_id: clientId,
        user_id: user.id,
        workout_plan_id: workoutPlan?.id || null,
        plan_day_key: buildPlanDayKey(workout),
        workout_name: workout.name || 'Treino',
        status: 'in_progress',
        started_at: startedAt,
        completed_at: null,
        duration_seconds: null,
        perceived_effort: null,
        notes: null,
        workout_snapshot: buildWorkoutSnapshot(workout),
        updated_at: startedAt,
      }

      setClientIdsRef.current = {}
      setActiveSession(localSession)
      setSessionSets([])
      await persistActiveDraft(user.id, localSession, [], {})

      await enqueueOperation({
        userId: user.id,
        entity: 'workout_session',
        action: 'insert',
        clientId,
        payload: { ...localSession },
      })

      const { data, error } = await upsertWorkoutSession(user.id, localSession)

      saveLockRef.current = false
      setSavingSession(false)

      if (error) {
        setSessionError('Sincronização pendente')
        setSyncPending(true)
        setConflictSession(null)
        setLocalOwner(user.id)
        return { data: localSession, error: null, pending: true }
      }

      setActiveSession(data)
      await persistActiveDraft(user.id, data, [], {})
      await syncPendingOperations(user.id)
      await refreshPendingFlag()
      setConflictSession(null)
      setLocalOwner(user.id)
      return { data, error: null }
    },
    [user?.id, workoutPlan?.id, restoreLocalActiveDraft, refreshPendingFlag],
  )

  const resumeSession = useCallback(async () => {
    if (!user?.id) return { data: null, error: { message: 'Usuário não autenticado.' } }
    const { data, error } = await getActiveSession(user.id)
    if (error) {
      const restored = await restoreLocalActiveDraft(user.id)
      if (restored) {
        setSessionError('Sincronização pendente')
        return { data: restored, error: null, pending: true }
      }
      setSessionError(error.message || 'Não foi possível retomar a sessão.')
      return { data: null, error }
    }
    setActiveSession(data)
    if (data?.id) {
      const { data: sets } = await listSessionSets(data.id)
      setSessionSets(sets || [])
    }
    setConflictSession(null)
    return { data, error: null }
  }, [user?.id, restoreLocalActiveDraft])

  const saveSet = useCallback(
    async (setInput) => {
      if (!user?.id) {
        return { data: null, error: { message: 'Usuário não autenticado.' } }
      }
      const session = activeSessionRef.current
      if (!session?.client_id) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }

      const exerciseOrder = Number(setInput.exercise_order ?? setInput.exerciseOrder ?? 0)
      const setNumber = Number(setInput.set_number ?? setInput.setNumber ?? 1)
      const slot = setSlotKey(exerciseOrder, setNumber)
      const clientId = setClientIdsRef.current[slot] || setInput.client_id || crypto.randomUUID()
      setClientIdsRef.current[slot] = clientId

      const setKey = slot
      setSavingSetKey(setKey)

      const updatedAt = new Date().toISOString()
      const setData = {
        client_id: clientId,
        exercise_key: setInput.exercise_key || setInput.exerciseKey || setInput.exerciseId || '',
        exercise_name: setInput.exercise_name || setInput.exerciseName || setInput.name || '',
        exercise_order: exerciseOrder,
        set_number: setNumber,
        set_type: setInput.set_type || 'working',
        planned_reps: setInput.planned_reps ?? setInput.plannedReps ?? null,
        repetitions: parseReps(setInput.repetitions ?? setInput.reps),
        weight: parseWeight(setInput.weight ?? setInput.load),
        rpe: setInput.rpe ?? null,
        completed: setInput.completed !== false,
        notes: setInput.notes ?? null,
        session_client_id: session.client_id,
        session_id: session.id || null,
        updated_at: updatedAt,
      }

      const optimistic = {
        ...setData,
        id: setData.id || `local-${clientId}`,
        session_id: session.id || null,
      }

      let nextSets = []
      setSessionSets((prev) => {
        const without = prev.filter(
          (s) =>
            !(
              Number(s.exercise_order) === exerciseOrder &&
              Number(s.set_number) === setNumber
            ) && s.client_id !== clientId,
        )
        nextSets = [...without, optimistic].sort(
          (a, b) =>
            Number(a.exercise_order) - Number(b.exercise_order) ||
            Number(a.set_number) - Number(b.set_number),
        )
        return nextSets
      })

      await persistActiveDraft(user.id, session, nextSets, setClientIdsRef.current)

      await enqueueOperation({
        userId: user.id,
        entity: 'workout_set',
        action: 'update',
        clientId,
        parentClientId: session.client_id,
        payload: setData,
      })

      if (!session.id) {
        await syncPendingOperations(user.id)
        const { data: draft } = await getWorkoutDraft(user.id, session.client_id)
        const remoteId = draft?.data?.session?.id
        if (remoteId) {
          setActiveSession((prev) => (prev ? { ...prev, id: remoteId } : prev))
        }
      }

      const remoteSessionId = activeSessionRef.current?.id || session.id
      if (remoteSessionId) {
        const { data, error } = await upsertWorkoutSet(remoteSessionId, setData)
        setSavingSetKey('')
        if (error) {
          setSyncPending(true)
          setSessionError('Sincronização pendente')
          await refreshPendingFlag()
          return { data: optimistic, error: null, pending: true }
        }

        setSessionSets((prev) => {
          const without = prev.filter((s) => s.client_id !== clientId)
          return [...without, data].sort(
            (a, b) =>
              Number(a.exercise_order) - Number(b.exercise_order) ||
              Number(a.set_number) - Number(b.set_number),
          )
        })
        await syncPendingOperations(user.id)
        setSessionSets((prev) => {
          void persistActiveDraft(
            user.id,
            { ...session, id: remoteSessionId },
            prev,
            setClientIdsRef.current,
          )
          return prev
        })
        await refreshPendingFlag()
        return { data, error: null }
      }

      setSavingSetKey('')
      setSyncPending(true)
      setSessionError('Sincronização pendente')
      await refreshPendingFlag()
      return { data: optimistic, error: null, pending: true }
    },
    [user?.id, refreshPendingFlag],
  )

  const completeSession = useCallback(
    async (completionData = {}) => {
      const session = activeSessionRef.current
      if (!user?.id || !session?.client_id) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }
      if (saveLockRef.current) {
        return { data: null, error: { message: 'Aguarde o salvamento atual.' } }
      }

      saveLockRef.current = true
      setSavingSession(true)

      const completedAt = completionData.completed_at || new Date().toISOString()
      const payload = {
        ...session,
        status: 'completed',
        completed_at: completedAt,
        duration_seconds: completionData.duration_seconds ?? null,
        perceived_effort: completionData.perceived_effort ?? null,
        notes: completionData.notes ?? null,
        updated_at: completedAt,
      }

      await enqueueOperation({
        userId: user.id,
        entity: 'workout_session',
        action: 'complete',
        clientId: session.client_id,
        payload,
      })

      await persistActiveDraft(user.id, payload, sessionSetsRef.current, setClientIdsRef.current)

      let data = null
      let error = null
      if (session.id) {
        const result = await completeWorkoutSession(user.id, session.id, {
          completed_at: completedAt,
          duration_seconds: completionData.duration_seconds ?? null,
          perceived_effort: completionData.perceived_effort ?? null,
          notes: completionData.notes ?? null,
        })
        data = result.data
        error = result.error
      }

      const syncResult = await syncPendingOperations(user.id)

      saveLockRef.current = false
      setSavingSession(false)

      if (error && !syncResult?.data?.synced) {
        const historyItem = mapRemoteSessionToHistoryItem(payload, sessionSetsRef.current)
        setSessionHistory((prev) => [historyItem, ...prev.filter((h) => h.id !== historyItem.id)])
        setActiveSession(null)
        setSessionSets([])
        setConflictSession(null)
        setSyncPending(true)
        setSessionError('Sincronização pendente')
        await refreshPendingFlag()
        return { data: payload, error: null, pending: true, historyItem }
      }

      const finalSession = data || payload
      const sets = session.id
        ? (await listSessionSets(session.id)).data || sessionSetsRef.current
        : sessionSetsRef.current
      const historyItem = mapRemoteSessionToHistoryItem(finalSession, sets)
      setSessionHistory((prev) => [historyItem, ...prev.filter((h) => h.id !== historyItem.id)])
      setActiveSession(null)
      setSessionSets([])
      setConflictSession(null)
      setClientIdsRef.current = {}
      if (!error) await deleteWorkoutDraft(user.id, session.client_id)
      await refreshPendingFlag()
      return { data: finalSession, error: null, historyItem }
    },
    [user?.id, refreshPendingFlag],
  )

  const cancelSession = useCallback(
    async (sessionId = activeSessionRef.current?.id) => {
      const session = activeSessionRef.current
      if (!user?.id || (!sessionId && !session?.client_id)) {
        return { data: null, error: { message: 'Nenhuma sessão ativa.' } }
      }
      if (!window.confirm('Cancelar o treino em andamento? Os dados já registrados serão preservados.')) {
        return { data: null, error: { code: 'ABORTED' } }
      }

      setSavingSession(true)
      const clientId = session?.client_id
      const payload = {
        ...session,
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (clientId) {
        await enqueueOperation({
          userId: user.id,
          entity: 'workout_session',
          action: 'cancel',
          clientId,
          payload,
        })
      }

      let error = null
      if (sessionId || session?.id) {
        const result = await cancelWorkoutSession(user.id, sessionId || session.id)
        error = result.error
      }

      await syncPendingOperations(user.id)
      setSavingSession(false)

      if (error) {
        setActiveSession(null)
        setSessionSets([])
        setConflictSession(null)
        setSyncPending(true)
        setSessionError('Sincronização pendente')
        await refreshPendingFlag()
        return { data: payload, error: null, pending: true }
      }

      if (activeSessionRef.current?.client_id === clientId || activeSessionRef.current?.id === sessionId) {
        setActiveSession(null)
        setSessionSets([])
      }
      setConflictSession(null)
      if (clientId) await deleteWorkoutDraft(user.id, clientId)
      await refreshSession()
      return { data: payload, error: null }
    },
    [user?.id, refreshSession, refreshPendingFlag],
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