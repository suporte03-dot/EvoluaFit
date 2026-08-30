import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Aplica a nova versão na hora — evita login preso em cache antigo. */
export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return
      window.setInterval(() => {
        registration.update()
      }, 15 * 60 * 1000)
    },
    onRegisterError() {
      /* app segue sem SW */
    },
  })

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true)
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
