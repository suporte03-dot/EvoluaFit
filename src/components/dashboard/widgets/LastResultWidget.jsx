import { formatDateShort } from '../../../utils/dateFormat'
import { lastCompletedResult } from '../../../utils/trainingIdentity'
import { scrollToSection } from '../../../utils/scrollToSection'

export default function LastResultWidget({ history, workouts }) {
  const last = lastCompletedResult({ history, workouts })

  if (!last) {
    return (
      <div className="last-result last-result--empty">
        <p className="last-result__kicker">Último resultado</p>
        <p className="last-result__empty">Seu primeiro treino cria a referência para acompanhar sua evolução.</p>
      </div>
    )
  }

  const facts = [
    last.volume ? `${Math.round(last.volume)} kg de volume` : null,
    last.sets ? `${last.sets} séries` : null,
    last.durationMinutes ? `${last.durationMinutes} min` : null,
  ].filter(Boolean)

  return (
    <div className="last-result">
      <p className="last-result__kicker">Último resultado</p>
      <h3 className="last-result__title">{last.name}</h3>
      <p className="last-result__meta">
        {last.date ? formatDateShort(last.date) : 'Sessão recente'}
        {facts.length ? ` · ${facts[0]}` : ''}
      </p>
      <button type="button" className="last-result__cta" onClick={() => scrollToSection('desempenho')}>
        Ver evolução
      </button>
    </div>
  )
}
