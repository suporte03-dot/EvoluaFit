import { useEffect, useState } from 'react'

/**
 * Modo Foco: mantém a tela ligada durante a sessão (Screen Wake Lock API).
 * O navegador solta o bloqueio quando a aba fica oculta; readquire ao voltar.
 * @returns {boolean} true enquanto o bloqueio estiver ativo
 */
export function useWakeLock(enabled) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.wakeLock?.request) return undefined
    let sentinel = null
    let cancelled = false
    let pending = false

    const acquire = async () => {
      if (cancelled || sentinel || pending || document.visibilityState !== 'visible') return
      pending = true
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          lock.release().catch(() => {})
          return
        }
        sentinel = lock
        setActive(true)
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null
          setActive(false)
        })
      } catch {
        /* bateria fraca, permissão negada ou aba em segundo plano */
      } finally {
        pending = false
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      const lock = sentinel
      sentinel = null
      setActive(false)
      lock?.release().catch(() => {})
    }
  }, [enabled])

  return active
}

/** navigator.onLine com eventos online/offline. */
export function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))

  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return online
}

/**
 * Pré-carrega a mídia do próximo exercício no cache do service worker (CacheFirst em /media/exercises/),
 * para o GIF aparecer mesmo se a conexão cair. Um arquivo por vez: GIFs têm alguns MB.
 */
export function useWarmExerciseMedia(exercise) {
  const url = exercise?.gif || exercise?.mediaUrl || ''

  useEffect(() => {
    if (!url.startsWith('/media/exercises/') || typeof window === 'undefined') return undefined
    if (!navigator.serviceWorker?.controller || navigator.connection?.saveData || navigator.onLine === false) return undefined
    const controller = new AbortController()
    const id = window.setTimeout(() => {
      fetch(url, { signal: controller.signal, credentials: 'same-origin' }).catch(() => {})
    }, 4000)
    return () => {
      window.clearTimeout(id)
      controller.abort()
    }
  }, [url])
}
