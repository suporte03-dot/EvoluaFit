import { useEffect } from 'react'

function StandingsToast({ message, visible, onHide }) {
  useEffect(() => {
    if (!visible) return undefined
    const timer = setTimeout(onHide, 3500)
    return () => clearTimeout(timer)
  }, [visible, onHide])

  if (!visible || !message) return null

  return (
    <div className="standings-toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}

export default StandingsToast
