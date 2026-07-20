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

function resolveDayType(day) {
  const name = String(day?.workoutName || day?.name || day?.workoutType || '').toLowerCase()
  const focus = (day?.muscleGroups || day?.focus || []).join(' ').toLowerCase()
  const hay = `${name} ${focus}`

  if (/descanso|recuper/.test(hay)) return { label: 'Descanso', tone: 'rest' }
  if (/mobil|along|yoga/.test(hay)) return { label: 'Mobilidade', tone: 'mobility' }
  if (/core.*cardio|cardio.*mobil/.test(hay)) return { label: 'Core + Cardio', tone: 'core' }
  if (/cardio|hiit|corrida|aer[óo]bic/.test(hay)) return { label: 'Cardio', tone: 'cardio' }
  if (/core|abd[ôo]men|abdominal/.test(hay)) return { label: 'Core', tone: 'core' }
  if (/push|empurr|peito|peitoral|tr[íi]ceps|ombro/.test(hay)) return { label: 'Push', tone: 'push' }
  if (/pull|puxar|costas|b[íi]ceps|dorsal/.test(hay)) return { label: 'Pull', tone: 'pull' }
  if (/legs|perna|gl[úu]teo|quadr|posterior|panturr|inferior|lower/.test(hay)) {
    return { label: 'Legs', tone: 'legs' }
  }
  if (/superior|upper/.test(hay)) return { label: 'Superiores', tone: 'push' }
  if (/full|corpo/.test(hay)) return { label: 'Full Body', tone: 'full' }
  return { label: day?.workoutType || 'Treino', tone: 'full' }
}

function estimateDuration(day) {
  if (day?.estimatedDuration) return day.estimatedDuration
  if (day?.estimatedMinutes) return day.estimatedMinutes
  const count = (day?.exercises || []).length
  return Math.max(20, count * 8)
}

function getPlanDays(plan) {
  return plan?.weeklyPlan || plan?.schedule || []
}

export default function GeneratedPlan({ plan, onDownloadExcel, onSaveToPlan }) {
  const { addPlanWorkouts, startWorkout, showToast } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [expandedDays, setExpandedDays] = useState(() => new Set())

  const days = getPlanDays(plan)

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayNum)) next.delete(dayNum)
      else next.add(dayNum)
      return next
    })
  }

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
      workouts.find((w) => w.dayNumber === day.day || w.name === (day.workoutName || day.name)) || {
        id: `preview-${plan.id}-${day.day}`,
        name: day.workoutName || day.name,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: day.muscleGroups || day.focus,
        exercises: (day.exercises || []).map((ex) => ({
          ...ex,
          restSeconds: ex.restSeconds ?? ex.rest ?? 60,
        })),
        status: 'Pendente',
        estimatedMinutes: day.estimatedDuration || day.estimatedMinutes,
        intensity: day.intensity,
        workoutType: day.workoutType,
      }
    )
  }

  const openDayDetail = (day) => {
    setDetailWorkout(buildDayWorkout(day))
  }

  const startDayWorkout = (day, e) => {
    e?.stopPropagation()
    const workout = buildDayWorkout(day)
    if (!workout.exercises?.length) {
      showToast?.('Este dia ainda não tem exercícios para iniciar.', 'info')
      return
    }
    startWorkout(workout)
  }

  return (
    <div className="generated-plan glass-card">
      <div className="generated-plan__header">
        <div>
          <h3 className="generated-plan__title">
            {plan.title || `Sua planilha — ${plan.objectiveLabel || plan.goal}`}
          </h3>
          <p className="generated-plan__meta">
            {plan.level} · {plan.daysPerWeek}x/semana · {plan.minutesPerWorkout || plan.duration} min ·{' '}
            {plan.location}
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

      <div className="generated-plan__disclaimer" role="note">
        <strong>Aviso importante</strong>
        <p>
          {plan.disclaimer ||
            'Plano demonstrativo e informativo. Não substitui avaliação de um profissional de educação física. Ajuste conforme sua condição e interrompa em caso de dor.'}
        </p>
      </div>

      <div className="generated-plan__days">
        {days.map((day) => {
          const type = resolveDayType(day)
          const exerciseCount = (day.exercises || []).length
          const duration = estimateDuration(day)
          const muscleGroups = day.muscleGroups || day.focus || []
          const isExpanded = expandedDays.has(day.day)

          return (
            <article
              key={day.day}
              className={`plan-day plan-day--${type.tone}${isExpanded ? ' is-expanded' : ' is-collapsed'}`}
            >
              <header className="plan-day__header">
                <div className="plan-day__head-main">
                  <div className="plan-day__daytag">
                    <span className="plan-day__daynum">Dia {day.day}</span>
                    <span className={`plan-day__type-badge plan-day__type-badge--${type.tone}`}>
                      {day.workoutType || type.label}
                    </span>
                  </div>
                  <h4 className="plan-day__name">{day.workoutName || day.name}</h4>
                  <p className="plan-day__weekday">{weekdayForDay(day.day)}</p>
                </div>
              </header>

              <div className="plan-day__stats">
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">
                    🎯
                  </span>
                  {formatFocus(muscleGroups) || 'Variado'}
                </span>
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">
                    🏋️
                  </span>
                  {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
                  <span className="plan-day__stat-sep" aria-hidden="true">
                    ·
                  </span>
                  ~{duration} min
                </span>
              </div>

              {isExpanded && (
                <ul className="plan-day__exercises">
                  {(day.exercises || []).map((ex) => (
                    <li key={ex.exerciseId || ex.name}>
                      <div className="plan-day__ex-main">
                        <strong>{ex.name}</strong>
                        <span className="plan-day__ex-group">{ex.muscleGroup}</span>
                      </div>
                      <span className="plan-day__ex-meta">
                        {ex.sets}x {ex.reps} · descanso {ex.rest ?? ex.restSeconds}s
                        {ex.equipment ? ` · ${ex.equipment}` : ''}
                      </span>
                      {ex.observation && (
                        <span className="plan-day__ex-note">
                          <em>Obs:</em> {ex.observation}
                        </span>
                      )}
                      {ex.safetyTip && (
                        <span className="plan-day__ex-care">
                          <em>Cuidado:</em> {ex.safetyTip}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="plan-day__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    if (!isExpanded) toggleDay(day.day)
                    else openDayDetail(day)
                  }}
                >
                  {isExpanded ? 'Detalhes' : 'Ver treino'}
                </button>
                {isExpanded && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleDay(day.day)}>
                    Recolher
                  </button>
                )}
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
          Alguns exercícios foram completados com sugestões alternativas compatíveis com seu perfil.
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
