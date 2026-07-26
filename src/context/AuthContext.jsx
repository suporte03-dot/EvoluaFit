import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (!mounted) return
      setSession(current)
      setUser(current?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          name: name.trim(),
        },
      },
    })
    return { data, error }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  const resetPasswordForEmail = useCallback(async (email) => {
    const redirectTo = `${window.location.origin}/redefinir-senha`
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })
    return { data, error }
  }, [])

  const updatePassword = useCallback(async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    }),
    [session, user, loading, signUp, signIn, signOut, resetPasswordForEmail, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
