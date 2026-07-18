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

/** Resolve a day's visual type + tone from its name/focus. */
function resolveDayType(day) {
  const name = String(day?.name || '').toLowerCase()
  const focus = (day?.focus || []).join(' ').toLowerCase()
  const hay = `${name} ${focus}`

  if (/descanso|recuper/.test(hay)) return { label: 'Descanso', tone: 'rest' }
  if (/mobil|along|yoga/.test(hay)) return { label: 'Mobilidade', tone: 'mobility' }
  if (/cardio|hiit|corrida|aer[óo]bic/.test(hay)) return { label: 'Cardio', tone: 'cardio' }
  if (/core|abd[ôo]men|abdominal/.test(hay)) return { label: 'Core', tone: 'core' }
  if (/push|empurr|peito|peitoral|tr[íi]ceps|ombro/.test(hay)) return { label: 'Push', tone: 'push' }
  if (/pull|puxar|costas|b[íi]ceps|dorsal/.test(hay)) return { label: 'Pull', tone: 'pull' }
  if (/legs|perna|gl[úu]teo|quadr|posterior|panturr|inferior/.test(hay)) return { label: 'Legs', tone: 'legs' }
  if (/superior/.test(hay)) return { label: 'Superiores', tone: 'push' }
  if (/full|corpo/.test(hay)) return { label: 'Full Body', tone: 'full' }
  return { label: 'Treino', tone: 'full' }
}

function estimateDuration(day) {
  if (day?.estimatedMinutes) return day.estimatedMinutes
  const count = (day?.exercises || []).length
  return Math.max(20, count * 8)
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
        {plan.schedule.map((day) => {
          const type = resolveDayType(day)
          const exerciseCount = (day.exercises || []).length
          const duration = estimateDuration(day)
          return (
            <article key={day.day} className={`plan-day plan-day--${type.tone}`}>
              <header className="plan-day__header">
                <div className="plan-day__head-main">
                  <div className="plan-day__daytag">
                    <span className="plan-day__daynum">Dia {day.day}</span>
                    <span className={`plan-day__type-badge plan-day__type-badge--${type.tone}`}>
                      {type.label}
                    </span>
                  </div>
                  <h4 className="plan-day__name">{day.name}</h4>
                  <p className="plan-day__weekday">{weekdayForDay(day.day)}</p>
                </div>
              </header>

              <div className="plan-day__stats">
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">🎯</span>
                  {formatFocus(day.focus) || 'Variado'}
                </span>
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">🏋️</span>
                  {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
                </span>
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">⏱️</span>
                  ~{duration} min
                </span>
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

              <div className="plan-day__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openDayDetail(day)}>
                  Ver treino
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--start-workout"
                  onClick={(e) => startDayWorkout(day, e)}
                >
                  Iniciar treino
                </button>
              </div>
            </article>
          )
        })}
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
