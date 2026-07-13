export default function RestTimer({ seconds, onSkip, onAdjust, isPaused }) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`

  return (
    <div className={`rest-timer ${isPaused ? 'rest-timer--paused' : ''}`}>
      <div className="rest-timer__info">
        <span className="rest-timer__label">Descanso</span>
        <strong className="rest-timer__time">{display}</strong>
        {isPaused && <span className="rest-timer__paused-badge">Pausado</span>}
      </div>
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
    </div>
  )
}
