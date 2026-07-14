import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { planToWorkouts } from '../utils/workoutGenerator'
import WorkoutDetailModal from './WorkoutDetailModal'

const WEEKDAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']

function weekdayForDay(dayNumber) {
  return WEEKDAYS[Math.max(0, (dayNumber || 1) - 1) % WEEKDAYS.length]
}

function formatFocus(focus = []) {
  if (!focus.length) return ''
  if (focus.length === 1) return focus[0]
  if (focus.length === 2) return `${focus[0]} e ${focus[1]}`
  return `${focus.slice(0, -1).join(', ')} e ${focus[focus.length - 1]}`
}

export default function GeneratedPlan({ plan, onDownloadExcel, onSaveToPlan }) {
  const { addPlanWorkouts, startWorkout } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)

  const handleAddWorkouts = () => {
    if (onSaveToPlan) {
      onSaveToPlan()
      return
    }
    const workouts = planToWorkouts(plan)
    addPlanWorkouts(workouts)
  }

  const buildDayWorkout = (day) => {
    const workouts = planToWorkouts(plan)
    return (
      workouts.find((w) => w.name === day.name && w.muscleGroups?.join() === day.focus?.join()) || {
        id: `preview-${plan.id}-${day.day}`,
        name: day.name,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: day.focus,
        exercises: day.exercises,
        status: 'Pendente',
        estimatedMinutes: day.estimatedMinutes,
      }
    )
  }

  const openDayDetail = (day) => {
    setDetailWorkout(buildDayWorkout(day))
  }

  const startDayWorkout = (day, e) => {
    e?.stopPropagation()
    startWorkout(buildDayWorkout(day))
  }

  return (
    <div className="generated-plan glass-card">
      <div className="generated-plan__header">
        <div>
          <h3 className="generated-plan__title">Sua planilha — {plan.objectiveLabel}</h3>
          <p className="generated-plan__meta">
            {plan.level} · {plan.daysPerWeek}x/semana · {plan.duration} min · {plan.location}
          </p>
        </div>
        <div className="generated-plan__actions">
          {onDownloadExcel && (
            <button type="button" className="btn btn--ghost" onClick={onDownloadExcel}>
              Baixar Excel
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={handleAddWorkouts}>
            Salvar na minha planilha
          </button>
        </div>
      </div>

      <div className="generated-plan__days">
        {plan.schedule.map((day) => (
          <div key={day.day} className="plan-day">
            <div className="plan-day__header">
              <div>
                <h4>
                  Dia {day.day}: {day.name}
                </h4>
                <p className="plan-day__weekday">{weekdayForDay(day.day)}</p>
                <p className="plan-day__focus">Grupos: {formatFocus(day.focus)}</p>
              </div>
              <div className="plan-day__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--start-workout"
                  onClick={(e) => startDayWorkout(day, e)}
                >
                  Iniciar treino
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openDayDetail(day)}>
                  Ver treino
                </button>
              </div>
            </div>
            <ul className="plan-day__exercises">
              {day.exercises.map((ex) => (
                <li key={ex.exerciseId}>
                  <div className="plan-day__ex-main">
                    <strong>{ex.name}</strong>
                    <span className="plan-day__ex-group">{ex.muscleGroup}</span>
                  </div>
                  <span className="plan-day__ex-meta">
                    {ex.sets}x {ex.reps} · descanso {ex.restSeconds}s
                    {ex.equipment ? ` · ${ex.equipment}` : ''}
                    {ex.level ? ` · ${ex.level}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {plan.usedFallback && (
        <p className="plan-fallback-note">
          Alguns exercícios foram completados com sugestões alternativas.
        </p>
      )}

      {plan.safetyNotes?.length > 0 && (
        <div className="safety-box">
          <strong>Notas de segurança</strong>
          <ul>
            {plan.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="safety-note">
        {plan.disclaimer ||
          'Plano demonstrativo. Este conteúdo é informativo. Respeite seus limites. Em caso de dor, interrompa o exercício e procure orientação profissional.'}
      </p>

      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />
    </div>
  )
}
