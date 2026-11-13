import { useEffect, useState } from 'react'

/**
 * navigator.onLine is only a hint — confirm with real Supabase requests.
 */
export function useNetworkStatus() {
  const [isLikelyOnline, setIsLikelyOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
  )

  useEffect(() => {
    const onOnline = () => setIsLikelyOnline(true)
    const onOffline = () => setIsLikelyOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    setIsLikelyOnline(navigator.onLine !== false)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return { isLikelyOnline }
}