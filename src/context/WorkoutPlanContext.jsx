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
import { useFitness } from './FitnessContext'
import storageService from '../services/storageService'
import {
  getActiveWorkoutPlan,
  isValidPlanData,
  saveActiveWorkoutPlan,
} from '../services/workoutPlanService'
import { planToWorkouts } from '../utils/workoutGenerator'

const WorkoutPlanContext = createContext(null)

const DEBOUNCE_MS = 1000
const LOCAL_OWNER_KEY = 'evoluafit-workout-plan-local-owner'

function migrationKey(userId) {
  return `evoluafit-workout-plan-migrated-${userId}`
}

function backupKey(userId) {
  return `evoluafit-workout-plan-backup-${userId}`
}

function isMigrationDone(userId) {
  try {
    return localStorage.getItem(migrationKey(userId)) === '1'
  } catch {
    return false
  }
}

function markMigrationDone(userId) {
  try {
    localStorage.setItem(migrationKey(userId), '1')
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

function planSnapshot(plan) {
  try {
    return JSON.stringify(plan)
  } catch {
    return ''
  }
}

function readPlanFromStorage() {
  try {
    const data = storageService.load()
    const plan = data?.plans?.[0] || null
    return isValidPlanData(plan) ? plan : null
  } catch {
    return null
  }
}

function readBackupPlan(userId) {
  try {
    const raw = localStorage.getItem(backupKey(userId))
    if (!raw) return null
    const plan = JSON.parse(raw)
    return isValidPlanData(plan) ? plan : null
  } catch {
    return null
  }
}

function backupLocalPlanForOwner(ownerId) {
  if (!ownerId) return
  const plan = readPlanFromStorage()
  if (!plan) return
  try {
    localStorage.setItem(backupKey(ownerId), JSON.stringify(plan))
  } catch {
    /* ignore */
  }
}

function resolvePlanName(plan) {
  return plan?.title || plan?.name || 'Planilha ativa'
}

function getMigratableLocalPlan(userId) {
  const owner = getLocalOwner()
  const localPlan = readPlanFromStorage()

  if (localPlan && (!owner || owner === userId)) {
    return localPlan
  }

  return readBackupPlan(userId)
}

export function WorkoutPlanProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { generatedPlan, savePlan, clearActivePlan, addPlanWorkouts } = useFitness()

  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [loadingWorkoutPlan, setLoadingWorkoutPlan] = useState(true)
  const [workoutPlanError, setWorkoutPlanError] = useState(null)
  const [savingWorkoutPlan, setSavingWorkoutPlan] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')

  const requestIdRef = useRef(0)
  const lastSyncedSnapshotRef = useRef('')
  const saveInFlightRef = useRef(false)
  const pendingPlanRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const hydratedUserRef = useRef(null)

  const clearWorkoutPlan = useCallback(() => {
    requestIdRef.current += 1
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    pendingPlanRef.current = null
    saveInFlightRef.current = false
    lastSyncedSnapshotRef.current = ''
    hydratedUserRef.current = null
    setWorkoutPlan(null)
    setWorkoutPlanError(null)
    setLoadingWorkoutPlan(false)
    setSavingWorkoutPlan(false)
    setLastSavedAt(null)
    setSaveStatus('idle')
  }, [])

  const applyRemotePlanLocally = useCallback(
    (planData, remoteRow = null) => {
      if (!isValidPlanData(planData)) return
      const withId = {
        ...planData,
        id: planData.id || remoteRow?.id,
        name: planData.name || planData.title || remoteRow?.name,
      }
      lastSyncedSnapshotRef.current = planSnapshot(withId)
      savePlan(withId)
      addPlanWorkouts(planToWorkouts(withId), { silent: true })
      if (user?.id) setLocalOwner(user.id)
    },
    [savePlan, addPlanWorkouts, user?.id],
  )

  const persistRemote = useCallback(
    async (planData) => {
      if (!user?.id) {
        return { data: null, error: { message: 'Usuário não autenticado.' } }
      }

      if (!isValidPlanData(planData)) {
        return { data: null, error: { message: 'Planilha inválida ou vazia.' } }
      }

      const snapshot = planSnapshot(planData)
      if (snapshot && snapshot === lastSyncedSnapshotRef.current) {
        setSaveStatus('saved')
        return { data: workoutPlan, error: null }
      }

      setSavingWorkoutPlan(true)
      setSaveStatus('saving')
      saveInFlightRef.current = true

      const { data, error } = await saveActiveWorkoutPlan(
        user.id,
        planData,
        resolvePlanName(planData),
      )

      saveInFlightRef.current = false
      setSavingWorkoutPlan(false)

      if (error) {
        setSaveStatus('error')
        setWorkoutPlanError(error.message || 'Erro ao salvar a planilha.')
        return { data: null, error }
      }

      lastSyncedSnapshotRef.current = snapshot
      setWorkoutPlan(data)
      setLastSavedAt(data?.updated_at || new Date().toISOString())
      setWorkoutPlanError(null)
      setSaveStatus('saved')
      setLocalOwner(user.id)
      return { data, error: null }
    },
    [user?.id, workoutPlan],
  )

  const flushPendingSave = useCallback(async () => {
    const pending = pendingPlanRef.current
    pendingPlanRef.current = null
    if (!pending) return { data: null, error: null }
    if (saveInFlightRef.current) {
      pendingPlanRef.current = pending
      return { data: null, error: null }
    }
    const result = await persistRemote(pending)
    if (pendingPlanRef.current && !saveInFlightRef.current) {
      const next = pendingPlanRef.current
      pendingPlanRef.current = null
      return persistRemote(next)
    }
    return result
  }, [persistRemote])

  const queueRemoteSave = useCallback(
    (planData) => {
      if (!user?.id) return
      if (!isValidPlanData(planData)) return

      const snapshot = planSnapshot(planData)
      if (snapshot && snapshot === lastSyncedSnapshotRef.current) return

      pendingPlanRef.current = planData

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = window.setTimeout(() => {
        debounceTimerRef.current = null
        flushPendingSave()
      }, DEBOUNCE_MS)
    },
    [user?.id, flushPendingSave],
  )

  const refreshWorkoutPlan = useCallback(async () => {
    if (!user?.id) {
      clearWorkoutPlan()
      return { data: null, error: null }
    }

    const requestId = ++requestIdRef.current
    setLoadingWorkoutPlan(true)
    setWorkoutPlanError(null)

    const previousOwner = getLocalOwner()
    if (previousOwner && previousOwner !== user.id) {
      backupLocalPlanForOwner(previousOwner)
    }

    const { data, error } = await getActiveWorkoutPlan(user.id)

    if (requestId !== requestIdRef.current) {
      return { data: null, error: null }
    }

    if (error) {
      setWorkoutPlan(null)
      setWorkoutPlanError(error.message || 'Não foi possível carregar sua planilha.')
      setLoadingWorkoutPlan(false)
      setSaveStatus('error')
      return { data: null, error }
    }

    if (data && isValidPlanData(data.plan_data)) {
      setWorkoutPlan(data)
      setLastSavedAt(data.updated_at || null)
      applyRemotePlanLocally(data.plan_data, data)
      setSaveStatus('saved')
      setLoadingWorkoutPlan(false)
      markMigrationDone(user.id)
      return { data, error: null }
    }

    if (!isMigrationDone(user.id)) {
      const localPlan = getMigratableLocalPlan(user.id)
      if (localPlan) {
        const { error: saveError } = await saveActiveWorkoutPlan(
          user.id,
          localPlan,
          resolvePlanName(localPlan),
        )

        if (requestId !== requestIdRef.current) {
          return { data: null, error: null }
        }

        if (saveError) {
          setWorkoutPlan(null)
          setWorkoutPlanError(
            saveError.message || 'Não foi possível migrar sua planilha local.',
          )
          setLoadingWorkoutPlan(false)
          setSaveStatus('error')
          return { data: null, error: saveError }
        }

        const { data: confirmed, error: confirmError } = await getActiveWorkoutPlan(user.id)

        if (requestId !== requestIdRef.current) {
          return { data: null, error: null }
        }

        if (confirmError || !confirmed || !isValidPlanData(confirmed.plan_data)) {
          setWorkoutPlan(null)
          setWorkoutPlanError('Não foi possível confirmar a migração da planilha.')
          setLoadingWorkoutPlan(false)
          setSaveStatus('error')
          return {
            data: null,
            error: confirmError || { message: 'Migração não confirmada.' },
          }
        }

        setWorkoutPlan(confirmed)
        setLastSavedAt(confirmed.updated_at || null)
        applyRemotePlanLocally(confirmed.plan_data, confirmed)
        markMigrationDone(user.id)
        setSaveStatus('saved')
        setLoadingWorkoutPlan(false)
        return { data: confirmed, error: null }
      }
    }

    // Conta sem plano remoto: não reutilizar planilha de outro usuário
    if (previousOwner && previousOwner !== user.id) {
      clearActivePlan()
      setLocalOwner(user.id)
    }

    setWorkoutPlan(null)
    setLastSavedAt(null)
    lastSyncedSnapshotRef.current = ''
    setSaveStatus('idle')
    setLoadingWorkoutPlan(false)
    return { data: null, error: null }
  }, [user?.id, clearWorkoutPlan, applyRemotePlanLocally, clearActivePlan])

  useEffect(() => {
    if (authLoading) return undefined

    if (!user?.id) {
      clearWorkoutPlan()
      return undefined
    }

    if (hydratedUserRef.current === user.id) return undefined
    hydratedUserRef.current = user.id
    refreshWorkoutPlan()
    return undefined
  }, [authLoading, user?.id, refreshWorkoutPlan, clearWorkoutPlan])

  useEffect(() => {
    if (authLoading || loadingWorkoutPlan) return
    if (!user?.id) return
    if (!generatedPlan) return
    queueRemoteSave(generatedPlan)
  }, [generatedPlan, authLoading, loadingWorkoutPlan, user?.id, queueRemoteSave])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const saveWorkoutPlan = useCallback(
    async (planData) => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      pendingPlanRef.current = null
      return persistRemote(planData || generatedPlan)
    },
    [generatedPlan, persistRemote],
  )

  const value = useMemo(
    () => ({
      workoutPlan,
      loadingWorkoutPlan: authLoading || loadingWorkoutPlan,
      workoutPlanError,
      saveWorkoutPlan,
      refreshWorkoutPlan,
      clearWorkoutPlan,
      lastSavedAt,
      savingWorkoutPlan,
      saveStatus,
    }),
    [
      workoutPlan,
      authLoading,
      loadingWorkoutPlan,
      workoutPlanError,
      saveWorkoutPlan,
      refreshWorkoutPlan,
      clearWorkoutPlan,
      lastSavedAt,
      savingWorkoutPlan,
      saveStatus,
    ],
  )

  return (
    <WorkoutPlanContext.Provider value={value}>{children}</WorkoutPlanContext.Provider>
  )
}

export function useWorkoutPlan() {
  const context = useContext(WorkoutPlanContext)
  if (!context) {
    throw new Error('useWorkoutPlan deve ser usado dentro de WorkoutPlanProvider')
  }
  return context
}