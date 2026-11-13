import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      /* registration handled by plugin */
    },
    onRegisterError() {
      /* ignore — app keeps working without SW */
    },
  })

  if (!needRefresh) return null

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
  }

  return (
    <div className="pwa-update-prompt" role="status" aria-live="polite">
      <p className="pwa-update-prompt__text">Uma nova versão do EvoluaFit está disponível.</p>
      <div className="pwa-update-prompt__actions">
        <button type="button" className="btn btn--primary btn--sm" onClick={handleUpdate}>
          Atualizar agora
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={handleDismiss}>
          Depois
        </button>
      </div>
    </div>
  )
}
