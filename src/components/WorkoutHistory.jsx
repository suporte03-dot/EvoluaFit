import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import Modal from './Modal'
import EmptyState from './EmptyState'

export default function WorkoutHistory({ embedded = false }) {
  const { history } = useFitness()
  const [selected, setSelected] = useState(null)

  const empty = (
    <EmptyState
      icon="📋"
      title="Nenhum treino registrado"
      description="Finalize uma sessão para ver seu histórico aqui."
      ctaLabel="Ver meus treinos"
      ctaSection="treinos"
    />
  )

  const content = (
    <>
      {!embedded && <h3 className="subsection-title">Histórico de treinos</h3>}
      {!history.length ? (
        empty
      ) : (
        <div className="history-list">
          {history.map((session) => (
            <button
              key={session.id}
              type="button"
              className="history-item glass-card"
              onClick={() => setSelected(session)}
            >
              <div>
                <strong>{session.name}</strong>
                <span>
                  {new Date(session.completedAt).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <div className="history-item__meta">
                <span>{session.durationMinutes} min</span>
                <span>{session.exercises?.length} exercícios</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || 'Detalhes'}>
        {selected && (
          <div className="history-detail">
            <p>
              Realizado em{' '}
              {new Date(selected.completedAt).toLocaleString('pt-BR')} · {selected.durationMinutes} minutos
            </p>
            <ul>
              {selected.exercises?.map((ex, i) => (
                <li key={i}>
                  <strong>{ex.name}</strong>
                  <span>
                    {ex.completedSets || ex.sets}x {ex.reps}
                    {ex.load ? ` · ${ex.load}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  )

  if (embedded) return <div className="workout-history--embedded">{content}</div>

  return (
    <section className="section">
      <div className="container">{content}</div>
    </section>
  )
}
