import { useCallback, useEffect, useState } from 'react'

function parseHash(hash = '') {
  const exerciseMatch = hash.match(/^#\/exercicio\/([^/?#]+)/)
  if (exerciseMatch) {
    return { page: 'exercise', id: decodeURIComponent(exerciseMatch[1]) }
  }
  return { page: null, id: null }
}

export function navigateToExercise(id) {
  if (!id) return
  window.location.hash = `/exercicio/${encodeURIComponent(id)}`
}

export function clearHashRoute() {
  if (window.location.hash) {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((id) => navigateToExercise(id), [])

  return { ...route, navigate, clearRoute: clearHashRoute }
}
