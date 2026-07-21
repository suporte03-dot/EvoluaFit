import { useEffect, useRef, useState } from 'react'

export default function RestTimer({
  seconds,
  onSkip,
  onAdjust,
  isPaused,
  onComplete,
  soundEnabled = false,
  className = '',
}) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`
  const [justDone, setJustDone] = useState(false)
  const prevSeconds = useRef(seconds)
  const announced = useRef(false)

  useEffect(() => {
    if (prevSeconds.current > 0 && seconds <= 0 && !announced.current) {
      announced.current = true
      setJustDone(true)
      onComplete?.()
      if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
        try {
          const ctx = new window.AudioContext()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          gain.gain.value = 0.04
          osc.start()
          osc.stop(ctx.currentTime + 0.12)
        } catch {
          /* optional sound */
        }
      }
      const t = setTimeout(() => setJustDone(false), 2800)
      return () => clearTimeout(t)
    }
    if (seconds > 0) {
      announced.current = false
      setJustDone(false)
    }
    prevSeconds.current = seconds
    return undefined
  }, [seconds, onComplete, soundEnabled])

  if (seconds <= 0 && !justDone) return null

  return (
    <div
      className={`rest-timer ${isPaused ? 'rest-timer--paused' : ''} ${justDone ? 'rest-timer--done' : ''} ${className}`.trim()}
    >
      <div className="rest-timer__info">
        <span className="rest-timer__label">{justDone ? 'Pronto' : 'Descanso'}</span>
        <strong className="rest-timer__time">{justDone ? '✓' : display}</strong>
        {isPaused && !justDone && <span className="rest-timer__paused-badge">Pausado</span>}
      </div>
      {justDone ? (
        <p className="rest-timer__done-msg" role="status">
          Descanso concluído. Próxima série pronta.
        </p>
      ) : (
        <div className="rest-timer__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onAdjust(-15)} aria-label="Reduzir 15 segundos">
            −15s
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onAdjust(15)} aria-label="Adicionar 15 segundos">
            +15s
          </button>
          <button type="button" className="btn btn--primary btn--sm" onClick={onSkip}>
            Pular descanso
          </button>
        </div>
      )}
    </div>
  )
}
