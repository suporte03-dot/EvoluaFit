import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createCheckin,
  deleteAllBodyEvolution,
  deleteCheckin,
  deletePhoto,
  getSignedPhotoUrl,
  getSnapshot,
  retryPhotoUpload,
  saveConsent,
  upsertGoals,
  upsertProfile,
} from '../services/bodyEvolutionService'
import {
  daysBetween,
  diffMeasures,
  flattenCheckin,
  regionProgress,
} from '../utils/bodyEvolutionMetrics'

export function useBodyEvolution() {
  const { user } = useAuth()
  const userId = user?.id || null
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setSnapshot(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    const { data, error: nextError } = await getSnapshot(userId)
    setSnapshot(data)
    setError(nextError)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const checkins = snapshot?.checkins || []
  const first = checkins[0] || null
  const latest = checkins[checkins.length - 1] || null
  const firstMeasures = first ? flattenCheckin(first) : null
  const latestMeasures = latest ? flattenCheckin(latest) : null

  const summary = useMemo(() => {
    if (!latestMeasures) {
      return { diffs: null, regions: [], daysSince: null }
    }
    return {
      diffs: firstMeasures ? diffMeasures(firstMeasures, latestMeasures) : null,
      regions: firstMeasures ? regionProgress(firstMeasures, latestMeasures) : [],
      daysSince: daysBetween(latest.created_at || latest.checkin_date),
    }
  }, [firstMeasures, latest, latestMeasures])

  const photoUrl = useCallback(
    (photo) => {
      if (!photo?.storage_path) return null
      return snapshot?.signedUrls?.[photo.storage_path] || null
    },
    [snapshot],
  )

  const resolvePhotoUrl = useCallback(async (photo) => {
    const cached = photoUrl(photo)
    if (cached) return cached
    const { data } = await getSignedPhotoUrl(photo?.storage_path)
    return data
  }, [photoUrl])

  const acceptConsent = useCallback(async () => {
    setSaving(true)
    const result = await saveConsent(userId)
    setSaving(false)
    if (!result.error) await refresh()
    return result
  }, [refresh, userId])

  const saveProfile = useCallback(
    async (patch) => {
      const result = await upsertProfile(userId, patch)
      if (!result.error) await refresh()
      return result
    },
    [refresh, userId],
  )

  const addCheckin = useCallback(
    async (payload) => {
      setSaving(true)
      const result = await createCheckin(userId, payload)
      setSaving(false)
      if (result.data) await refresh()
      return result
    },
    [refresh, userId],
  )

  const saveGoals = useCallback(
    async (goals) => {
      setSaving(true)
      const result = await upsertGoals(userId, goals)
      setSaving(false)
      if (!result.error) await refresh()
      return result
    },
    [refresh, userId],
  )

  const removePhoto = useCallback(
    async (photo) => {
      const result = await deletePhoto(userId, photo)
      if (!result.error) await refresh()
      return result
    },
    [refresh, userId],
  )

  const removeCheckin = useCallback(
    async (checkin) => {
      const result = await deleteCheckin(userId, checkin)
      if (!result.error) await refresh()
      return result
    },
    [refresh, userId],
  )

  const removeAll = useCallback(async () => {
    setSaving(true)
    const result = await deleteAllBodyEvolution(userId)
    setSaving(false)
    if (!result.error) await refresh()
    return result
  }, [refresh, userId])

  const retryPhoto = useCallback(
    async (checkinId, type, file) => {
      const result = await retryPhotoUpload(userId, checkinId, type, file)
      if (!result.error) await refresh()
      return result
    },
    [refresh, userId],
  )

  return {
    userId,
    loading,
    error,
    saving,
    profile: snapshot?.profile || null,
    consent: snapshot?.consent || null,
    goals: snapshot?.goals || null,
    checkins,
    first,
    latest,
    firstMeasures,
    latestMeasures,
    summary,
    hasCheckin: checkins.length > 0,
    canCompare: checkins.length > 1,
    photoUrl,
    resolvePhotoUrl,
    refresh,
    acceptConsent,
    saveProfile,
    addCheckin,
    saveGoals,
    removePhoto,
    removeCheckin,
    removeAll,
    retryPhoto,
  }
}

export function useBodyProfile() {
  const body = useBodyEvolution()
  return { profile: body.profile, loading: body.loading, saveProfile: body.saveProfile }
}

export function useBodyCheckins() {
  const body = useBodyEvolution()
  return { checkins: body.checkins, loading: body.loading, addCheckin: body.addCheckin }
}

export function useBodyMeasurements() {
  const body = useBodyEvolution()
  return { latest: body.latestMeasures, first: body.firstMeasures, loading: body.loading }
}

export function useBodyPhotos() {
  const body = useBodyEvolution()
  return { photoUrl: body.photoUrl, removePhoto: body.removePhoto, loading: body.loading }
}

export function useBodyGoals() {
  const body = useBodyEvolution()
  return { goals: body.goals, saveGoals: body.saveGoals, loading: body.loading }
}

export default useBodyEvolution
