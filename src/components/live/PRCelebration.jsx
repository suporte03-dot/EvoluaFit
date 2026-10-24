import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconShare, IconTrophy } from '../dashboard/icons'
import { formatLoad } from '../../utils/liveWorkout/loadSuggestion.js'

const CONFETTI = Array.from({ length: 18 }, (_, i) => i)

function MiniChart({ series }) {
  if (!series?.length) return null
  const max = Math.max(...series.map((p) => p.weight), 1)
  return (
    <figure className="live-pr__chart" aria-label={`Carga máxima nas últimas ${series.length} sessões`}>
      <div className="live-pr__bars">
        {series.map((point, index) => {
          const isLast = index === series.length - 1
          return (
            <div key={`${point.date}-${index}`} className={`live-pr__bar${isLast ? ' is-current' : ''}`}>
              <span className="live-pr__bar-value">{formatLoad(point.weight)}</span>
              <span className="live-pr__bar-fill" style={{ height: `${Math.max(12, (point.weight / max) * 100)}%` }} />
              <span className="live-pr__bar-label">{isLast ? 'Hoje' : point.date.slice(8, 10) + '/' + point.date.slice(5, 7)}</span>
            </div>
          )
        })}
      </div>
    </figure>
  )
}

export default function PRCelebration({ pr, onShare, onContinue }) {
  const continueRef = useRef(null)

  useEffect(() => {
    continueRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onContinue()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onContinue])

  return createPortal(
    <div className="live-root live-pr" role="dialog" aria-modal="true" aria-labelledby="live-pr-title" aria-describedby="live-pr-desc">
      <div className="live-pr__confetti" aria-hidden="true">
        {CONFETTI.map((i) => (
          <span key={i} style={{ '--i': i }} />
        ))}
      </div>
      <div className="live-pr__card">
        <span className="live-pr__trophy" aria-hidden="true">
          <IconTrophy size={40} />
        </span>
        <p className="live-pr__kicker">Novo recorde pessoal</p>
        <h2 id="live-pr-title" className="live-pr__title">
          {pr.exerciseName}
        </h2>
        <div id="live-pr-desc" className="live-pr__compare">
          <div>
            <span>Antes</span>
            <strong>
              {formatLoad(pr.before.weight)} kg × {pr.before.reps}
            </strong>
          </div>
          <span className="live-pr__arrow" aria-hidden="true">
            →
          </span>
          <div className="is-after">
            <span>Agora</span>
            <strong>
              {formatLoad(pr.after.weight)} kg × {pr.after.reps}
            </strong>
          </div>
        </div>
        <MiniChart series={pr.series} />
        {pr.gainPct > 0 ? (
          <p className="live-pr__gain">
            <strong>+{pr.gainPct}%</strong> de carga
            {pr.weeks ? ` em ${pr.weeks} ${pr.weeks === 1 ? 'semana' : 'semanas'}` : ''}
          </p>
        ) : null}
        <ul className="live-pr__chips" aria-label="Conquistas">
          <li className="is-xp">+50 XP</li>
          <li>Recorde de carga</li>
          {pr.muscleGroup ? <li>{pr.muscleGroup}</li> : null}
        </ul>
        <div className="live-pr__actions">
          <button type="button" className="live-btn live-btn--ghost" onClick={onShare}>
            <IconShare size={18} />
            Compartilhar
          </button>
          <button ref={continueRef} type="button" className="live-btn live-btn--primary" onClick={onContinue}>
            Continuar treino
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
