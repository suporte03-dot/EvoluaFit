import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { remainingSeconds, restProgress } from '../../utils/liveWorkout/restTimer.js'
import { formatClock } from '../../utils/liveWorkout/volume.js'

const SIZE = 232
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimer({ rest, now, nextLabel, onAdd, onSkip }) {
  const gradientId = useId()
  const skipRef = useRef(null)
  const remaining = remainingSeconds(rest, now)
  const progress = restProgress(rest, now)

  useEffect(() => {
    skipRef.current?.focus()
  }, [])

  return createPortal(
    <div className="live-root live-rest" role="dialog" aria-modal="true" aria-labelledby={`${gradientId}-title`}>
      <p id={`${gradientId}-title`} className="live-rest__kicker">
        Descanso
      </p>
      <div className="live-rest__ring">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F7CF7" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} className="live-rest__track" strokeWidth={STROKE} fill="none" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * progress}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className="live-rest__progress"
          />
        </svg>
        <span className="live-rest__time" role="timer" aria-label={`Faltam ${remaining} segundos de descanso`}>
          {formatClock(remaining)}
        </span>
      </div>
      {nextLabel ? (
        <p className="live-rest__next">
          <span>A seguir</span>
          <strong>{nextLabel}</strong>
        </p>
      ) : null}
      <div className="live-rest__actions">
        <button type="button" className="live-btn live-btn--ghost" onClick={() => onAdd(15)} aria-label="Adicionar 15 segundos">
          +15 s
        </button>
        <button ref={skipRef} type="button" className="live-btn live-btn--primary" onClick={onSkip}>
          Pular descanso
        </button>
      </div>
    </div>,
    document.body,
  )
}
