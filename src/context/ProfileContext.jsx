import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { getProfile, updateProfile as updateProfileRequest } from '../services/profileService'

const ProfileContext = createContext(null)

function isMissingProfileError(error) {
  return error?.code === 'PGRST116' || error?.details?.includes?.('0 rows')
}

export function ProfileProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const requestIdRef = useRef(0)

  const clearProfile = useCallback(() => {
    setProfile(null)
    setProfileError(null)
    setLoadingProfile(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      clearProfile()
      return { data: null, error: null }
    }

    const requestId = ++requestIdRef.current
    setLoadingProfile(true)
    setProfileError(null)

    const { data, error } = await getProfile(user.id)

    if (requestId !== requestIdRef.current) {
      return { data: null, error: null }
    }

    if (error) {
      if (isMissingProfileError(error)) {
        setProfile(null)
        setProfileError('Perfil ainda não encontrado para esta conta.')
      } else {
        setProfile(null)
        setProfileError(error.message || 'Não foi possível carregar o perfil.')
      }
      setLoadingProfile(false)
      return { data: null, error }
    }

    setProfile(data)
    setProfileError(null)
    setLoadingProfile(false)
    return { data, error: null }
  }, [user?.id, clearProfile])

  useEffect(() => {
    if (authLoading) return undefined

    if (!user?.id) {
      requestIdRef.current += 1
      clearProfile()
      return undefined
    }

    refreshProfile()
    return undefined
  }, [authLoading, user?.id, refreshProfile, clearProfile])

  const updateProfile = useCallback(
    async (profileData) => {
      if (!user?.id) {
        const error = { message: 'Usuário não autenticado.' }
        return { data: null, error }
      }

      const { data, error } = await updateProfileRequest(user.id, profileData)

      if (error) {
        return { data: null, error }
      }

      setProfile(data)
      setProfileError(null)
      return { data, error: null }
    },
    [user?.id],
  )

  const value = useMemo(
    () => ({
      profile,
      loadingProfile: authLoading || loadingProfile,
      profileError,
      refreshProfile,
      updateProfile,
    }),
    [profile, authLoading, loadingProfile, profileError, refreshProfile, updateProfile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de ProfileProvider')
  }
  return context
}