import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { inferWorkoutType } from '../utils/workoutSession'
import SectionTitle from './SectionTitle'
import EmptyState from './EmptyState'
import WorkoutDetailModal from './WorkoutDetailModal'

const statusClass = {
  Pendente: 'status--pending',
  Realizado: 'status--done',
  Parcial: 'status--partial',
  Pulado: 'status--skipped',
}

export default function MyWorkouts() {
  const { workouts, startWorkout, updateWorkout, deleteWorkout, duplicateWorkout, showToast } = useFitness()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const startEdit = (workout, e) => {
    e.stopPropagation()
    setEditingId(workout.id)
    setEditName(workout.name)
  }

  const saveEdit = (id, e) => {
    e?.stopPropagation()
    updateWorkout(id, { name: editName })
    setEditingId(null)
  }

  const markDone = (workout, e) => {
    e.stopPropagation()
    updateWorkout(workout.id, {
      status: 'Realizado',
      completedAt: new Date().toISOString(),
    })
    showToast('Treino marcado como realizado!')
  }

  const openDetail = (workout) => setDetailWorkout(workout)

  const handleCardClick = (workout) => openDetail(workout)

  const stopProp = (e) => e.stopPropagation()

  return (
    <section id="treinos" className="section section--workouts">
      <div className="container">
        <div className="workouts-panel">
          <SectionTitle
            tag="Treinos"
            title="Meus treinos"
            subtitle="Gerencie sua rotina, inicie sessões e acompanhe o status de cada treino."
          />

          {workouts.length === 0 ? (
            <EmptyState
              className="empty-state--premium"
              icon="🏋️"
              title="Nenhum treino cadastrado"
              description="Monte sua planilha personalizada ou peça uma sugestão ao Coach IA para começar."
              ctaLabel="Criar planilha"
              ctaSection="planilha"
              secondaryCtaLabel="Falar com Coach IA"
              secondaryCtaSection="coach-ia"
            />
          ) : (
            <div className="workout-list">
              {workouts.map((workout, index) => {
                const type = inferWorkoutType(workout)
                const exerciseCount = workout.exercises?.length || 0
                const duration = workout.estimatedMinutes || 45

                return (
                  <article
                    key={workout.id}
                    className={`workout-card glass-card workout-card--clickable${expandedId === workout.id ? ' workout-card--expanded' : ''}`}
                    style={{ '--card-delay': `${Math.min(index, 8) * 40}ms` }}
                    onClick={() => handleCardClick(workout)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCardClick(workout)
                      }
                    }}
                  >
                    <div className="workout-card__top">
                      {editingId === workout.id ? (
                        <div className="workout-card__edit" onClick={stopProp}>
                          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                          <button
                            type="button"
                            className="btn btn--sm btn--primary"
                            onClick={(e) => saveEdit(workout.id, e)}
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <div className="workout-card__heading">
                          <h3 className="workout-card__name">{workout.name}</h3>
                          <span className="workout-card__type">{type}</span>
                        </div>
                      )}
                      <span className={`status-badge ${statusClass[workout.status] || ''}`}>
                        {workout.status}
                      </span>
                    </div>

                    <div className="workout-card__meta">
                      <span>
                        {new Date(workout.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span>{exerciseCount} exercícios</span>
                      <span>{duration} min</span>
                    </div>

                    <div className="workout-card__muscles">
                      {workout.muscleGroups?.map((g) => (
                        <span key={g} className="muscle-tag">
                          {g}
                        </span>
                      ))}
                    </div>

                    <div className="workout-card__actions" onClick={stopProp}>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm btn--start-workout"
                        onClick={() => startWorkout(workout)}
                        disabled={workout.status === 'Realizado'}
                      >
                        Iniciar treino
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm btn--secondary-mobile"
                        onClick={() => openDetail(workout)}
                      >
                        Ver treino
                      </button>
                    </div>
                    <div className="workout-card__more" onClick={stopProp}>
                      <button
                        type="button"
                        className="workout-card__more-btn"
                        onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
                        aria-expanded={expandedId === workout.id}
                      >
                        {expandedId === workout.id ? 'Menos opções' : 'Mais opções'}
                      </button>
                    </div>
                    <div className="workout-card__actions workout-card__actions--extra" onClick={stopProp}>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={(e) => startEdit(workout, e)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => duplicateWorkout(workout.id)}
                      >
                        Duplicar
                      </button>
                      {workout.status !== 'Realizado' && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={(e) => markDone(workout, e)}>
                          Marcar realizado
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
