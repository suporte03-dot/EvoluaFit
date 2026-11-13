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
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import {
  getPendingCount,
  RETRY_DELAYS_MS,
  resetFailedForRetry,
  syncPendingOperations,
} from '../services/offlineSyncService'

const SyncContext = createContext(null)

export function SyncProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { isLikelyOnline } = useNetworkStatus()

  const [syncStatus, setSyncStatus] = useState('synced')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncError, setSyncError] = useState(null)
  const [conflictWarning, setConflictWarning] = useState(null)

  const syncingRef = useRef(false)
  const retryTimerRef = useRef(null)
  const retryAttemptRef = useRef(0)
  const userIdRef = useRef(null)

  const clearVisualState = useCallback(() => {
    setSyncStatus(isLikelyOnline ? 'synced' : 'offline')
    setPendingCount(0)
    setSyncError(null)
    setConflictWarning(null)
    setLastSyncAt(null)
    retryAttemptRef.current = 0
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [isLikelyOnline])

  const refreshPendingCount = useCallback(async () => {
    if (!user?.id) {
      setPendingCount(0)
      return 0
    }
    const count = await getPendingCount(user.id)
    setPendingCount(count)
    return count
  }, [user?.id])

  const scheduleRetry = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    const attempt = retryAttemptRef.current
    if (attempt >= RETRY_DELAYS_MS.length) return
    const delay = RETRY_DELAYS_MS[attempt]
    retryTimerRef.current = setTimeout(() => {
      retryAttemptRef.current += 1
      syncNowRef.current?.({ automatic: true })
    }, delay)
  }, [])

  const syncNowRef = useRef(null)

  const syncNow = useCallback(
    async (options = {}) => {
      if (!user?.id) {
        return { data: null, error: { message: 'Usuário não autenticado.' } }
      }
      if (userIdRef.current && userIdRef.current !== user.id) {
        return { data: null, error: { message: 'Usuário alterado.' } }
      }
      if (syncingRef.current) {
        return { data: { skipped: true }, error: null }
      }

      syncingRef.current = true
      setSyncStatus('syncing')
      setSyncError(null)

      if (options.manual) {
        await resetFailedForRetry(user.id)
        retryAttemptRef.current = 0
      }

      const { data, error } = await syncPendingOperations(user.id)
      syncingRef.current = false

      if (userIdRef.current !== user.id) {
        return { data: null, error: null }
      }

      const count = await getPendingCount(user.id)
      setPendingCount(count)

      if (error) {
        setSyncError(error.message || 'Não foi possível sincronizar')
        setSyncStatus(isLikelyOnline ? 'error' : 'offline')
        if (!options.manual) scheduleRetry()
        return { data: null, error }
      }

      if (data?.warnings?.length) {
        setConflictWarning(data.warnings[0])
      }

      setLastSyncAt(new Date().toISOString())

      if (!isLikelyOnline && count > 0) {
        setSyncStatus('offline')
      } else if (count > 0) {
        setSyncStatus(data?.failed > 0 ? 'error' : 'pending')
        if (data?.failed > 0) {
          setSyncError('Não foi possível sincronizar')
        }
        if (!options.manual && count > 0) scheduleRetry()
      } else {
        setSyncStatus('synced')
        setSyncError(null)
        retryAttemptRef.current = 0
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current)
          retryTimerRef.current = null
        }
      }

      return { data, error: null }
    },
    [user?.id, isLikelyOnline, scheduleRetry],
  )

  syncNowRef.current = syncNow

  useEffect(() => {
    if (authLoading) return undefined
    if (!user?.id) {
      userIdRef.current = null
      clearVisualState()
      return undefined
    }

    userIdRef.current = user.id
    refreshPendingCount().then((count) => {
      if (count > 0) setSyncStatus(isLikelyOnline ? 'pending' : 'offline')
      else setSyncStatus(isLikelyOnline ? 'synced' : 'offline')
    })
    syncNow({ automatic: true })
    return undefined
  }, [authLoading, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return undefined
    if (!isLikelyOnline) {
      setSyncStatus((prev) => (pendingCount > 0 || prev === 'pending' || prev === 'error' ? 'offline' : 'offline'))
      return undefined
    }
    syncNow({ automatic: true })
    return undefined
  }, [isLikelyOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onQueue = () => {
      refreshPendingCount().then((count) => {
        if (syncingRef.current) return
        if (!isLikelyOnline) {
          setSyncStatus('offline')
          return
        }
        if (count > 0) {
          setSyncStatus((s) => (s === 'syncing' ? s : 'pending'))
          syncNow({ automatic: true })
        } else if (!syncError) {
          setSyncStatus('synced')
        }
      })
    }
    window.addEventListener('evoluafit-queue-changed', onQueue)
    return () => window.removeEventListener('evoluafit-queue-changed', onQueue)
  }, [refreshPendingCount, syncNow, isLikelyOnline, syncError])

  useEffect(
    () => () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    },
    [],
  )

  const value = useMemo(
    () => ({
      syncStatus,
      pendingCount,
      lastSyncAt,
      syncError,
      conflictWarning,
      isLikelyOnline,
      syncNow: () => syncNow({ manual: true }),
      refreshPendingCount,
    }),
    [
      syncStatus,
      pendingCount,
      lastSyncAt,
      syncError,
      conflictWarning,
      isLikelyOnline,
      syncNow,
      refreshPendingCount,
    ],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync deve ser usado dentro de SyncProvider')
  }
  return context
}