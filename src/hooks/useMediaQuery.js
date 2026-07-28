import { useEffect, useState } from 'react'

/**
 * Shared matchMedia hook — one source of truth for responsive JS.
 * Prefer CSS media queries when possible; use this only when behavior must change.
 */
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false

  const [matches, setMatches] = useState(getMatch)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Mobile / compact PWA layout (spec: up to 767px) */
export function useIsMobileLayout() {
  return useMediaQuery('(max-width: 767px)')
}
