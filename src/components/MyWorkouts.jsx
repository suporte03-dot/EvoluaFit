import { useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import EmptyState from './EmptyState'
import WorkoutDetailModal from './WorkoutDetailModal'
import CollapsibleWorkoutCard from './CollapsibleWorkoutCard'

function isDoneWorkout(workout) {
  const status = String(workout?.status || '').toLowerCase()
  return status === 'realizado' || status === 'completed' || status === 'done'
}

function startOfMonday(ref = new Date()) {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  const weekday = d.getDay()
  d.setDate(d.getDate() + (weekday === 0 ? -6 : 1 - weekday))
  return d
}

function groupWorkouts(workouts = [], generatedPlan) {
  const activeId = generatedPlan?.id
  const weekStart = startOfMonday()
  const active = []
  const library = []
  const previous = []

  workouts.forEach((workout) => {
    const date = workout?.date ? new Date(`${String(workout.date).slice(0, 10)}T12:00:00`) : null
    const fromActivePlan = Boolean(activeId && workout.planId === activeId)
    const thisWeek = date && !Number.isNaN(date.getTime()) ? date >= weekStart : !isDoneWorkout(workout)

    if (fromActivePlan && (thisWeek || !isDoneWorkout(workout))) {
      active.push(workout)
      return
    }
    if (isDoneWorkout(workout) && (!thisWeek || !fromActivePlan)) {
      previous.push(workout)
      return
    }
    library.push(workout)
  })

  return { active, library, previous }
}

export default function MyWorkouts() {
  const {
    workouts,
    generatedPlan,
    startWorkout,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
    showToast,
  } = useFitness()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [isTreinosOpen, setIsTreinosOpen] = useState(true)
  const groups = useMemo(() => groupWorkouts(workouts, generatedPlan), [workouts, generatedPlan])

  const toggleOpen = (id) => {
    setOpenId((current) => (current === id ? null : id))
  }

  const startEdit = (workout, e) => {
    e?.stopPropagation()
    setEditingId(workout.id)
    setEditName(workout.name)
  }

  const saveEdit = (id, e) => {
    e?.stopPropagation()
    updateWorkout(id, { name: editName })
    setEditingId(null)
  }

  const markDone = (workout, e) => {
    e?.stopPropagation()
    updateWorkout(workout.id, {
      status: 'Realizado',
      completedAt: new Date().toISOString(),
    })
    showToast('Treino marcado como realizado!')
  }

  return (
    <section id="treinos" className="section section--workouts">
      <div className="container">
        <div className="workouts-panel">
          <SectionTitle
            tag="Treinos"
            title="Meus treinos"
            subtitle={
              <>
                <span className="copy-desktop">
                  A rotina ativa fica no topo. A biblioteca e os treinos anteriores ficam separados.
                </span>
                <span className="copy-mobile">Rotina ativa, biblioteca e treinos anteriores.</span>
              </>
            }
          />

          {workouts.length === 0 ? (
            <EmptyState
              className="empty-state--premium"
              title="Nenhum treino na planilha"
              description="Monte sua planilha para ver os treinos da semana aqui."
              ctaLabel="Criar planilha"
              ctaSection="planilha"
              secondaryCtaLabel="Falar com o Coach"
              secondaryCtaSection="coach-ia"
            />
          ) : (
            <>
              <button
                type="button"
                className={`disclose-toggle${isTreinosOpen ? ' is-open' : ''}`}
                onClick={() => setIsTreinosOpen((o) => !o)}
                aria-expanded={isTreinosOpen}
                aria-controls="meus-treinos-panel"
              >
                <span>{isTreinosOpen ? 'Ocultar meus treinos' : 'Ver meus treinos'}</span>
                <span className="disclose-toggle__chevron" aria-hidden="true">
                  ▼
                </span>
              </button>

              <div
                id="meus-treinos-panel"
                className={`disclose-panel${isTreinosOpen ? ' is-open' : ''}`}
                aria-hidden={!isTreinosOpen}
              >
                <div className="disclose-panel__inner">
                  {[
                    {
                      id: 'active',
                      title: generatedPlan?.title || 'Rotina ativa',
                      hint: 'Treinos da planilha em uso nesta semana.',
                      items: groups.active,
                    },
                    {
                      id: 'library',
                      title: 'Biblioteca e extras',
                      hint: 'Sequências salvas que não fazem parte da rotina ativa.',
                      items: groups.library,
                    },
                    {
                      id: 'previous',
                      title: 'Planos anteriores',
                      hint: 'Sessões já concluídas ou de semanas passadas.',
                      items: groups.previous,
                    },
                  ]
                    .filter((group) => group.items.length)
                    .map((group) => (
                      <section key={group.id} className="workout-group" aria-labelledby={`workout-group-${group.id}`}>
                        <header className="workout-group__head">
                          <h3 id={`workout-group-${group.id}`}>{group.title}</h3>
                          <p>{group.hint}</p>
                        </header>
                        <div className="workout-list">
                          {group.items.map((workout, index) => (
                            <CollapsibleWorkoutCard
                              key={workout.id}
                              workout={workout}
                              index={index}
                              isOpen={openId === workout.id}
                              onToggle={toggleOpen}
                              editingId={editingId}
                              editName={editName}
                              onEditNameChange={setEditName}
                              onSaveEdit={saveEdit}
                              onStartWorkout={startWorkout}
                              onViewWorkout={setDetailWorkout}
                              onEdit={startEdit}
                              onDuplicate={duplicateWorkout}
                              onComplete={markDone}
                              onDelete={deleteWorkout}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <WorkoutDetailModal
        workout={detailWorkout ? workouts.find((w) => w.id === detailWorkout.id) || detailWorkout : null}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </section>
  )
}
