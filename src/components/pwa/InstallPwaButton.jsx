import { useEffect, useState } from 'react'

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia?.('(display-mode: standalone)')?.matches
  const iosStandalone = window.navigator?.standalone === true
  return Boolean(media || iosStandalone)
}

export default function InstallPwaButton({ className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => isStandaloneDisplay())
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true)
      return undefined
    }

    const onBeforeInstall = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      setInstalling(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !deferredPrompt) return null

  const handleInstall = async () => {
    if (!deferredPrompt || installing) return
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice?.outcome === 'accepted') {
        setInstalled(true)
      }
    } catch {
      /* prompt can fail on unsupported browsers */
    } finally {
      setDeferredPrompt(null)
      setInstalling(false)
    }
  }

  return (
    <button
      type="button"
      className={`btn btn--outline${className ? ` ${className}` : ''}`}
      onClick={handleInstall}
      disabled={installing}
    >
      {installing ? 'Abrindo instalação...' : 'Instalar aplicativo'}
    </button>
  )
}
