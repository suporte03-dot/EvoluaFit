import { useCallback, useEffect, useState } from 'react'
import { loadExercises } from '../services/exerciseService.js'

export function useExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('local')
  const [error, setError] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loadExercises()
      setExercises(result.exercises || [])
      setSource(result.source || 'local')
      setUsingFallback(result.source === 'local' && Boolean(result.fallback))
      setLoading(false)
    } catch (err) {
      setError(err?.message || 'Não foi possível carregar os exercícios.')
      setExercises([])
      setSource('local')
      setUsingFallback(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const result = await loadExercises()
        if (cancelled) return
        setExercises(result.exercises || [])
        setSource(result.source || 'local')
        setUsingFallback(result.source === 'local' && Boolean(result.fallback))
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Não foi possível carregar os exercícios.')
        setExercises([])
        setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { exercises, loading, source, error, usingFallback, reload }
}
