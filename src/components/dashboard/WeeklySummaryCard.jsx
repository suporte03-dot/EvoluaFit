export default function WeeklySummaryCard({ summary, copy }) {
  if (!copy) return null

  return (
    <section className="hoje-card" aria-label="Resumo da semana">
      <p className="hoje-card__kicker">Semana</p>
      <h3 className="hoje-card__title">{copy.title}</h3>
      <p className="hoje-card__body">{copy.body}</p>
      {summary?.workouts > 0 ? (
        <dl className="hoje-stats">
          <div>
            <dt>Treinos</dt>
            <dd>{summary.workouts}</dd>
          </div>
          {summary.volume > 0 ? (
            <div>
              <dt>Volume</dt>
              <dd>{summary.volume.toLocaleString('pt-BR')}</dd>
            </div>
          ) : null}
          {summary.duration > 0 ? (
            <div>
              <dt>Minutos</dt>
              <dd>{summary.duration}</dd>
            </div>
          ) : null}
          {summary.prs > 0 ? (
            <div>
              <dt>Recordes</dt>
              <dd>{summary.prs}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  )
}
