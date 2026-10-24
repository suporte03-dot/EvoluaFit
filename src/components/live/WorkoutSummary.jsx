import { useEffect, useRef } from 'react'
import { IconShare, IconSpark, IconTrophy } from '../dashboard/icons'
import { formatClock, formatVolumeKg } from '../../utils/liveWorkout/volume.js'
import { formatLoad } from '../../utils/liveWorkout/loadSuggestion.js'

export default function WorkoutSummary({ summary, score, scoreGap, onShare, onHome, sharing = false }) {
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  const stats = [
    { id: 'duration', label: 'Duração', value: formatClock(summary.durationSec) },
    { id: 'volume', label: 'Volume', value: formatVolumeKg(summary.volumeKg) },
    { id: 'sets', label: 'Séries', value: `${summary.setsDone}/${summary.setsTotal}` },
    { id: 'prs', label: 'Recordes', value: String(summary.prs.length) },
  ]

  return (
    <div className="live-summary">
      <header className="live-summary__head">
        <p className="live-summary__kicker">Treino concluído</p>
        <h1 ref={titleRef} tabIndex={-1} className="live-summary__title">
          {summary.workoutName}
        </h1>
      </header>

      <dl className="live-summary__grid">
        {stats.map((stat) => (
          <div key={stat.id} className="live-card live-summary__stat">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      {summary.prs.length ? (
        <section className="live-card live-summary__prs" aria-labelledby="live-sum-prs">
          <h2 id="live-sum-prs" className="live-summary__h2">
            <IconTrophy size={18} /> Recordes de hoje
          </h2>
          <ul>
            {summary.prs.map((pr) => (
              <li key={pr.exerciseName}>
                <span>{pr.exerciseName}</span>
                <strong>
                  {formatLoad(pr.after.weight)} kg × {pr.after.reps}
                </strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {summary.muscles.length ? (
        <section className="live-card" aria-labelledby="live-sum-muscles">
          <h2 id="live-sum-muscles" className="live-summary__h2">
            Volume por grupo muscular
          </h2>
          <ul className="live-summary__muscles">
            {summary.muscles.map((m) => (
              <li key={m.group}>
                <div className="live-summary__muscle-row">
                  <span>{m.group}</span>
                  <span>{m.pct}%</span>
                </div>
                <span className="live-summary__muscle-track" aria-hidden="true">
                  <span style={{ width: `${m.pct}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="live-card" aria-labelledby="live-sum-week">
        <div className="live-summary__row">
          <h2 id="live-sum-week" className="live-summary__h2">
            Sua semana
          </h2>
          {summary.weeklyGoal ? (
            <span className="live-summary__count">
              {summary.weekDone} de {summary.weeklyGoal}
            </span>
          ) : null}
        </div>
        <ol className="live-summary__week" aria-label="Dias com treino nesta semana">
          {summary.weekStrip.map((day) => (
            <li
              key={day.key}
              className={`${day.trained ? 'is-trained' : ''}${day.isToday ? ' is-today' : ''}`}
              aria-label={`${day.name}: ${day.trained ? 'treinou' : 'sem treino'}${day.isToday ? ' (hoje)' : ''}`}
            >
              {day.letter}
            </li>
          ))}
        </ol>
      </section>

      <section className="live-card live-summary__score" aria-labelledby="live-sum-score">
        <div className="live-summary__row">
          <h2 id="live-sum-score" className="live-summary__h2">
            Evolua Score
          </h2>
          <span className="live-summary__xp">+{summary.xp.total} XP</span>
        </div>
        {score ? (
          <p className="live-summary__score-line">
            <strong>{score.value}</strong>/100 · {score.band}
          </p>
        ) : null}
        <p className="live-summary__muted">
          {scoreGap
            ? `Faltam ${scoreGap.remaining} ${scoreGap.remaining === 1 ? 'ponto' : 'pontos'} para "${scoreGap.name}".`
            : score
              ? 'Você está na faixa mais alta. Agora é manter.'
              : 'Seu Evolua Score aparece com mais alguns treinos registrados.'}
        </p>
        <ul className="live-summary__xp-list">
          {summary.xp.items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <span>+{item.delta} XP</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="live-card live-summary__coach" aria-labelledby="live-sum-coach">
        <h2 id="live-sum-coach" className="live-summary__h2">
          <IconSpark size={18} /> Coach Evolua
        </h2>
        <p>{summary.coachText}</p>
      </section>

      <div className="live-summary__actions">
        <button type="button" className="live-btn live-btn--primary live-btn--block" onClick={onShare} disabled={sharing}>
          <IconShare size={18} />
          {sharing ? 'Gerando imagem...' : 'Compartilhar no story'}
        </button>
        <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={onHome}>
          Voltar ao início
        </button>
      </div>
    </div>
  )
}
