import { useEffect, useState } from 'react'
import { loadExercises } from '../services/exerciseService.js'

export function useExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('local')

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      const result = await loadExercises()
      if (cancelled) return
      setExercises(result.exercises)
      setSource(result.source)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { exercises, loading, source }
}
