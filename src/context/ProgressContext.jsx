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
import { useWorkoutSession } from './WorkoutSessionContext'
import {
  getDashboardProgress,
  getExerciseProgress,
  listExercisesWithProgress,
} from '../services/progressService'
import {
  buildDashboardMetricsFromProgress,
  buildMonthlyVolume,
  buildWeeklyFrequency,
  computePeriodStats,
} from '../utils/progressMetrics'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { profile, goals } = useFitness()
  const { sessionHistory } = useWorkoutSession()

  const [summaries, setSummaries] = useState([])
  const [records, setRecords] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [progressError, setProgressError] = useState(null)
  const [exerciseKey, setExerciseKey] = useState('')
  const [exerciseSeries, setExerciseSeries] = useState([])
  const [loadingExercise, setLoadingExercise] = useState(false)
  const [exerciseError, setExerciseError] = useState(null)
  const [exerciseCatalog, setExerciseCatalog] = useState([])

  const requestIdRef = useRef(0)
  const hydratedUserRef = useRef(null)
  const exerciseCacheRef = useRef(new Map())
  const lastHistorySigRef = useRef('')
  const exerciseKeyRef = useRef('')

  const clearProgress = useCallback(() => {
    requestIdRef.current += 1
    hydratedUserRef.current = null
    exerciseCacheRef.current.clear()
    lastHistorySigRef.current = ''
    setSummaries([])
    setRecords([])
    setLoadingProgress(false)
    setProgressError(null)
    setExerciseKey('')
    setExerciseSeries([])
    setExerciseCatalog([])
    setLoadingExercise(false)
    setExerciseError(null)
  }, [])

  const refreshProgress = useCallback(async () => {
    if (!user?.id) {
      clearProgress()
      return { data: null, error: null }
    }

    const requestId = ++requestIdRef.current
    setLoadingProgress(true)
    setProgressError(null)
    exerciseCacheRef.current.clear()

    const { data, error } = await getDashboardProgress(user.id)
    if (requestId !== requestIdRef.current) return { data: null, error: null }

    if (error) {
      setSummaries([])
      setRecords([])
      setProgressError(error.message || 'Não foi possível carregar sua evolução.')
      setLoadingProgress(false)
      return { data: null, error }
    }

    setSummaries(data.summaries || [])
    setRecords(data.records || [])
    if (data.recordsError) {
      setProgressError(data.recordsError.message || null)
    }

    const catalog = await listExercisesWithProgress(user.id)
    if (requestId === requestIdRef.current && !catalog.error) {
      setExerciseCatalog(catalog.data || [])
    }

    const activeExerciseKey = exerciseKeyRef.current
    if (requestId === requestIdRef.current && activeExerciseKey) {
      const { data: series, error: seriesError } = await getExerciseProgress(
        user.id,
        activeExerciseKey,
        { limit: 40 },
      )
      if (!seriesError) {
        exerciseCacheRef.current.set(activeExerciseKey, series || [])
        setExerciseSeries(series || [])
        setExerciseError(null)
      }
    }

    setLoadingProgress(false)
    return { data, error: null }
  }, [user?.id, clearProgress])

  useEffect(() => {
    if (authLoading) return undefined
    if (!user?.id) {
      clearProgress()
      return undefined
    }
    if (hydratedUserRef.current === user.id) return undefined
    hydratedUserRef.current = user.id
    refreshProgress()
    return undefined
  }, [authLoading, user?.id, refreshProgress, clearProgress])

  const historySig = useMemo(() => {
    const completed = (sessionHistory || []).filter((s) => s.status === 'completed' || s.completedAt)
    return completed
      .slice(0, 12)
      .map((s) => s.id || s.completedAt || '')
      .join('|')
  }, [sessionHistory])

  useEffect(() => {
    if (!user?.id || authLoading) return
    if (hydratedUserRef.current !== user.id) return
    if (!historySig) return
    if (historySig === lastHistorySigRef.current) return
    lastHistorySigRef.current = historySig
    refreshProgress()
  }, [historySig, user?.id, authLoading, refreshProgress])

  const loadExerciseProgress = useCallback(
    async (key) => {
      if (!user?.id || !key) {
        setExerciseSeries([])
        return { data: [], error: null }
      }

      if (exerciseCacheRef.current.has(key)) {
        setExerciseSeries(exerciseCacheRef.current.get(key))
        setExerciseError(null)
        return { data: exerciseCacheRef.current.get(key), error: null }
      }

      setLoadingExercise(true)
      setExerciseError(null)
      const { data, error } = await getExerciseProgress(user.id, key, { limit: 40 })
      setLoadingExercise(false)

      if (error) {
        setExerciseSeries([])
        setExerciseError(error.message || 'Não foi possível carregar o exercício.')
        return { data: [], error }
      }

      exerciseCacheRef.current.set(key, data || [])
      setExerciseSeries(data || [])
      return { data: data || [], error: null }
    },
    [user?.id],
  )

  useEffect(() => {
    exerciseKeyRef.current = exerciseKey
  }, [exerciseKey])

  useEffect(() => {
    if (!exerciseKey) {
      setExerciseSeries([])
      return
    }
    loadExerciseProgress(exerciseKey)
  }, [exerciseKey, loadExerciseProgress])

  const periodStats = useMemo(() => computePeriodStats(summaries), [summaries])
  const weeklyFrequency = useMemo(() => buildWeeklyFrequency(summaries, 8), [summaries])
  const monthlyVolume = useMemo(() => buildMonthlyVolume(summaries, 6), [summaries])

  const exerciseOptions = useMemo(() => {
    const map = new Map()
    exerciseCatalog.forEach((r) => {
      if (r.key) map.set(r.key, r.name || r.key)
    })
    records.forEach((r) => {
      if (r.exercise_key) map.set(r.exercise_key, r.exercise_name || r.exercise_key)
    })
    return [...map.entries()]
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [records, exerciseCatalog])

  useEffect(() => {
    if (!exerciseKey && exerciseOptions.length) {
      setExerciseKey(exerciseOptions[0].key)
    }
  }, [exerciseKey, exerciseOptions])

  const weeklyGoal = useMemo(() => {
    const fromGoal = goals?.find((g) => g.type === 'weekly_workouts')?.target
    if (fromGoal > 0) return fromGoal
    if (profile?.daysPerWeek > 0) return profile.daysPerWeek
    return null
  }, [goals, profile])

  const homeProgressMetrics = useMemo(
    () => buildDashboardMetricsFromProgress(periodStats, weeklyGoal),
    [periodStats, weeklyGoal],
  )

  const selectedRecord = useMemo(
    () => records.find((r) => r.exercise_key === exerciseKey) || null,
    [records, exerciseKey],
  )

  const value = useMemo(
    () => ({
      summaries,
      records,
      loadingProgress: authLoading || loadingProgress,
      progressError,
      refreshProgress,
      clearProgress,
      periodStats,
      weeklyFrequency,
      monthlyVolume,
      weeklyGoal,
      homeProgressMetrics,
      exerciseKey,
      setExerciseKey,
      exerciseOptions,
      exerciseSeries,
      loadingExercise,
      exerciseError,
      selectedRecord,
      loadExerciseProgress,
    }),
    [
      summaries,
      records,
      authLoading,
      loadingProgress,
      progressError,
      refreshProgress,
      clearProgress,
      periodStats,
      weeklyFrequency,
      monthlyVolume,
      weeklyGoal,
      homeProgressMetrics,
      exerciseKey,
      exerciseOptions,
      exerciseSeries,
      loadingExercise,
      exerciseError,
      selectedRecord,
      loadExerciseProgress,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress deve ser usado dentro de ProgressProvider')
  }
  return context
}