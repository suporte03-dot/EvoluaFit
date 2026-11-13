export default function ExerciseProgressChart({ points = [], lastWeight, bestWeight, lastReps, avgReps }) {
  const hasPoints = points?.length > 0
  const maxW = Math.max(1, ...(points || []).map((p) => p.weight || 0), bestWeight || 0)

  return (
    <div className="exercise-progress-chart">
      <div className="exercise-progress-chart__stats">
        <div>
          <span>Última carga</span>
          <strong>{lastWeight != null ? `${lastWeight} kg` : '—'}</strong>
        </div>
        <div>
          <span>Melhor carga</span>
          <strong>{bestWeight != null ? `${bestWeight} kg` : '—'}</strong>
        </div>
        <div>
          <span>Últimas reps</span>
          <strong>{lastReps != null ? lastReps : '—'}</strong>
        </div>
        <div>
          <span>Média reps</span>
          <strong>{avgReps != null ? avgReps : '—'}</strong>
        </div>
      </div>

      {hasPoints ? (
        <svg
          className="exercise-progress-chart__svg"
          viewBox="0 0 240 80"
          role="img"
          aria-label="Evolução de carga"
        >
          <polyline
            fill="none"
            stroke="rgba(0, 229, 143, 0.85)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points
              .map((p, i) => {
                const x = points.length === 1 ? 120 : (i / (points.length - 1)) * 220 + 10
                const y = 70 - ((p.weight || 0) / maxW) * 55
                return `${x},${y}`
              })
              .join(' ')}
          />
          {points.map((p, i) => {
            const x = points.length === 1 ? 120 : (i / (points.length - 1)) * 220 + 10
            const y = 70 - ((p.weight || 0) / maxW) * 55
            return <circle key={p.date || i} cx={x} cy={y} r="3.5" fill="#00e58f" />
          })}
        </svg>
      ) : (
        <p className="exercise-progress-chart__empty">Sem histórico de carga para este exercício.</p>
      )}
    </div>
  )
}
