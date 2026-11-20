import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { planToWorkouts, summarizeDayVolume } from '../utils/workoutGenerator'
import { getSplitStyleLabel } from '../data/workoutTemplates'
import { classifyWorkoutDay, displayWorkoutName, formatRestLabel } from '../utils/trainingIdentity'
import { IconCalendar, IconDumbbell } from './dashboard/icons'
import DayVolumeSummary from './DayVolumeSummary'
import { workoutDisplayMinutes } from '../utils/workoutDuration'
import { findActiveWorkoutForPlanDay } from '../utils/libraryAdd.js'
import { planWeekdayLong, planWeekdayShort } from '../utils/planWeekday.js'
import {
  applyCompleteSuggestions,
  moveExercise,
  planCompleteDay,
  removeExerciseAt,
  suggestedDurationBump,
  updateExerciseFields,
} from '../utils/completeWorkout.js'
import { appendExerciseToList, replaceExerciseInList } from '../utils/exerciseSubstitution.js'
import { muscleGroups as catalogGroups } from '../data/exercisesData.js'
import WorkoutDetailModal from './WorkoutDetailModal'
import ExerciseSubstitutionModal from './ExerciseSubstitutionModal'
import CompleteWorkoutModal from './CompleteWorkoutModal'

function formatFocus(focus = []) {
  if (!focus.length) return ''
  if (focus.length === 1) return focus[0]
  if (focus.length === 2) return `${focus[0]} e ${focus[1]}`
  return `${focus.slice(0, -1).join(', ')} e ${focus[focus.length - 1]}`
}

function resolveDayType(day) {
  return classifyWorkoutDay(day)
}

function estimateDuration(day) {
  return workoutDisplayMinutes(day, Math.max(20, (day?.exercises || []).length * 8))
}

function getPlanDays(plan) {
  return plan?.weeklyPlan || plan?.schedule || []
}

export default function GeneratedPlan({
  plan,
  onDownloadExcel,
  onSaveToPlan,
  onGenerateNew,
  onRegenerateWithDuration,
}) {
  const {
    addPlanWorkouts,
    addWorkoutToPlan,
    startWorkout,
    showToast,
    workouts,
    updatePlanDay,
    updateWorkout,
    profile,
  } = useFitness()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [addForDay, setAddForDay] = useState(null)
  const [subFor, setSubFor] = useState(null)
  const [completeFor, setCompleteFor] = useState(null)
  const days = getPlanDays(plan)
  const firstDay = days[0]?.day
  const [expandedDays, setExpandedDays] = useState(() =>
    firstDay != null ? new Set([firstDay]) : new Set(),
  )
  const hasActiveRoutine = (workouts || []).some((w) => w.planId === plan?.id)
  const planPreference = plan.minutesPerWorkout || plan.duration
  const hasManualEdits = Boolean(plan?.manualEdited || hasActiveRoutine)

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
    const active = findActiveWorkoutForPlanDay(workouts, plan, day)
    if (active) return active
    const fromPlan = planToWorkouts(plan)
    return (
      fromPlan.find((w) => w.dayNumber === day.day || w.name === (day.workoutName || day.name)) || {
        id: `preview-${plan.id}-${day.day}`,
        planId: plan.id,
        dayNumber: day.day,
        name: day.workoutName || day.name,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: day.muscleGroups || day.focus,
        exercises: (day.exercises || []).map((ex) => ({
          ...ex,
          restSeconds: ex.restSeconds ?? ex.rest ?? 60,
        })),
        status: 'Pendente',
        estimatedMinutes: estimateDuration(day),
        intensity: day.intensity,
        workoutType: day.workoutType,
      }
    )
  }

  const dayDisplay = (day) => {
    const active = findActiveWorkoutForPlanDay(workouts, plan, day)
    const source = active || day
    const exerciseCount = (source.exercises || []).length
    const duration = workoutDisplayMinutes(source, Math.max(20, exerciseCount * 8))
    return {
      active,
      exerciseCount,
      duration,
      exercises: source.exercises || [],
      muscleGroups: active?.muscleGroups || day.muscleGroups || day.focus || [],
      sourceLabel: active ? 'Rotina ativa' : 'Plano gerado',
    }
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
    if (!findActiveWorkoutForPlanDay(workouts, plan, day)) {
      addWorkoutToPlan(workout)
    }
    startWorkout(workout)
  }

  const ensurePersistedWorkout = (day) => {
    let workout = buildDayWorkout(day)
    if (!findActiveWorkoutForPlanDay(workouts, plan, day)) {
      addWorkoutToPlan(workout)
      workout = { ...workout }
    }
    return workout
  }

  const persistExercises = (day, nextExercises) => {
    const volumeSummary = summarizeDayVolume(nextExercises, day.workoutType || day.workoutName).text
    const workout = ensurePersistedWorkout(day)
    if (workout?.planId && workout?.dayNumber != null) {
      updatePlanDay(workout.planId, workout.dayNumber, {
        exercises: nextExercises,
        volumeSummary,
        manualEdited: true,
      })
    } else if (workout?.id) {
      updateWorkout(workout.id, { exercises: nextExercises, volumeSummary })
    }
    showToast('Treino atualizado.')
  }

  const handleGenerateNew = () => {
    if (hasManualEdits) {
      const ok = window.confirm(
        'Gerar uma nova planilha substitui as edições manuais desta rotina. Continuar?',
      )
      if (!ok) return
    }
    onGenerateNew?.()
  }

  const bumpMinutes = suggestedDurationBump(planPreference, plan.level)

  return (
    <div className="generated-plan glass-card">
      <div className="generated-plan__header">
        <div>
          <h3 className="generated-plan__title">
            {plan.title || `Sua planilha — ${plan.objectiveLabel || plan.goal}`}
          </h3>
          <p className="generated-plan__meta">
            {plan.level} · {plan.daysPerWeek}x/semana · {plan.splitLabel || getSplitStyleLabel(plan.splitStyle)} ·{' '}
            preferência {planPreference} min · {plan.location}
          </p>
          <p className="generated-plan__source-note">
            {hasActiveRoutine
              ? 'Abaixo, cada dia mostra a rotina ativa (Meus treinos) quando ela já foi salva — contagem e duração vêm da mesma fonte.'
              : 'Isto é o plano gerado. Depois de “Salvar na minha planilha”, a rotina ativa fica em Meus treinos e passa a ser a fonte ao iniciar.'}
          </p>
        </div>
        <div className="generated-plan__actions">
          {onGenerateNew ? (
            <button type="button" className="btn btn--ghost" onClick={handleGenerateNew}>
              Gerar nova planilha
            </button>
          ) : null}
          <button type="button" className="btn btn--primary" onClick={handleAddWorkouts}>
            Salvar na minha planilha
          </button>
          {onDownloadExcel && (
            <button type="button" className="btn btn--outline generated-plan__excel" onClick={onDownloadExcel}>
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {days.length ? (
        <ol className="generated-plan__week" aria-label="Divisão semanal">
          {days.map((day) => {
            const type = resolveDayType(day)
            return (
              <li key={day.day} className={`generated-plan__chip generated-plan__chip--${type.tone}`}>
                <span>{planWeekdayShort(day.day)}</span>
                <strong>{type.label}</strong>
              </li>
            )
          })}
        </ol>
      ) : null}

      <div className="generated-plan__days" role="list">
        {days.map((day) => {
          const type = resolveDayType(day)
          const display = dayDisplay(day)
          const exerciseCount = display.exerciseCount
          const duration = display.duration
          const muscleGroups = display.muscleGroups
          const isExpanded = expandedDays.has(day.day)
          const panelId = `plan-day-panel-${plan.id}-${day.day}`

          return (
            <article
              key={day.day}
              role="listitem"
              className={`plan-day plan-day--accordion plan-day--${type.tone}${isExpanded ? ' is-expanded' : ' is-collapsed'}`}
            >
              <button
                type="button"
                className="plan-day__accordion-trigger"
                onClick={() => toggleDay(day.day)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
              >
                <div className="plan-day__head-main">
                  <div className="plan-day__daytag">
                    <span className="plan-day__daynum">Dia {day.day}</span>
                    <span className={`plan-day__type-badge plan-day__type-badge--${type.tone}`}>
                      {day.workoutType || type.label}
                    </span>
                    <span className="plan-day__source-badge">{display.sourceLabel}</span>
                  </div>
                  <h4 className="plan-day__name">{displayWorkoutName(day.workoutName || day.name)}</h4>
                  <p className="plan-day__weekday">{planWeekdayLong(day.day)}</p>
                </div>
                <span className="plan-day__chevron" aria-hidden="true">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              <div className="plan-day__stats">
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">
                    <IconCalendar size={14} />
                  </span>
                  {formatFocus(muscleGroups) || 'Variado'}
                </span>
                <span className="plan-day__stat">
                  <span className="plan-day__stat-icon" aria-hidden="true">
                    <IconDumbbell size={14} />
                  </span>
                  {exerciseCount} {exerciseCount === 1 ? 'exercício' : 'exercícios'}
                  <span className="plan-day__stat-sep" aria-hidden="true">
                    ·
                  </span>
                  ~{duration} min
                </span>
              </div>

              <div id={panelId} className="plan-day__panel" hidden={!isExpanded}>
                {isExpanded && (
                  <>
                    <DayVolumeSummary
                      exercises={display.exercises}
                      dayType={day.workoutType || type.label}
                      volumeSummary={day.volumeSummary}
                    />
                    <ul className="plan-day__exercises">
                      {display.exercises.map((ex, index) => (
                        <li key={`${ex.exerciseId || ex.name}-${index}`}>
                          <div className="plan-day__ex-main">
                            <strong>{ex.name}</strong>
                            <span className="plan-day__ex-group">{ex.muscleGroup}</span>
                          </div>
                          <div className="plan-day__ex-edit">
                            <label>
                              <span className="sr-only">Séries</span>
                              <input
                                type="number"
                                min={1}
                                max={8}
                                value={ex.sets ?? 3}
                                aria-label={`Séries de ${ex.name}`}
                                onChange={(e) => {
                                  const next = updateExerciseFields(display.exercises, index, {
                                    sets: Number(e.target.value) || 1,
                                  })
                                  persistExercises(day, next)
                                }}
                              />
                            </label>
                            <label>
                              <span className="sr-only">Repetições</span>
                              <input
                                type="text"
                                value={ex.reps ?? ''}
                                aria-label={`Repetições de ${ex.name}`}
                                onChange={(e) => {
                                  const next = updateExerciseFields(display.exercises, index, {
                                    reps: e.target.value,
                                  })
                                  persistExercises(day, next)
                                }}
                              />
                            </label>
                            <label>
                              <span className="sr-only">Descanso</span>
                              <input
                                type="number"
                                min={0}
                                step={15}
                                value={ex.restSeconds ?? ex.rest ?? 60}
                                aria-label={`Descanso de ${ex.name} em segundos`}
                                onChange={(e) => {
                                  const restSeconds = Number(e.target.value) || 0
                                  const next = updateExerciseFields(display.exercises, index, {
                                    restSeconds,
                                    rest: restSeconds,
                                  })
                                  persistExercises(day, next)
                                }}
                              />
                              <span>s</span>
                            </label>
                          </div>
                          <div className="plan-day__ex-tools">
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              aria-label={`Subir ${ex.name}`}
                              onClick={() => persistExercises(day, moveExercise(display.exercises, index, -1))}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              aria-label={`Descer ${ex.name}`}
                              onClick={() => persistExercises(day, moveExercise(display.exercises, index, 1))}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() =>
                                setSubFor({ day, index, exercise: ex, workout: buildDayWorkout(day) })
                              }
                            >
                              Substituir
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => persistExercises(day, removeExerciseAt(display.exercises, index))}
                            >
                              Remover
                            </button>
                          </div>
                          <span className="plan-day__ex-meta">
                            Descanso {formatRestLabel(ex.rest ?? ex.restSeconds)}
                            {ex.equipment ? ` · ${ex.equipment}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="plan-day__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--start-workout"
                  onClick={(e) => startDayWorkout(day, e)}
                >
                  Iniciar treino
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    ensurePersistedWorkout(day)
                    setAddForDay(day)
                  }}
                >
                  + Adicionar exercício
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setCompleteFor(day)}
                >
                  Completar treino
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openDayDetail(day)}>
                  Ver detalhes
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

      {plan.volumeWarnings?.length > 0 && (
        <div className="safety-box">
          <strong>Volume semanal</strong>
          <p className="generated-plan__volume-note">
            Abaixo da faixa usa séries efetivas (diretas + 0,5 quando o grupo é secundário em
            compostos). O “Volume do dia” nos cards conta só o grupo principal — por isso Ombros
            pode mostrar 6 no dia e 8 no semanal.
          </p>
          <ul>
            {plan.volumeWarnings.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="generated-plan__volume-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                const lowDay = days.find((d) => {
                  const w = buildDayWorkout(d)
                  return planCompleteDay(w, plan, { level: plan.level }).deficit > 0
                })
                if (lowDay) setCompleteFor(lowDay)
                else showToast('Nenhum dia com déficit claro para completar.', 'info')
              }}
            >
              Completar automaticamente
            </button>
            {onRegenerateWithDuration ? (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onRegenerateWithDuration(bumpMinutes)}
              >
                Aumentar tempo para {bumpMinutes} min
              </button>
            ) : null}
          </div>
        </div>
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

      <WorkoutDetailModal
        workout={detailWorkout}
        isOpen={Boolean(detailWorkout)}
        onClose={() => setDetailWorkout(null)}
      />

      <ExerciseSubstitutionModal
        isOpen={Boolean(addForDay)}
        mode="add"
        onClose={() => setAddForDay(null)}
        defaultMuscleGroup={
          addForDay?.muscleGroups?.[0] || addForDay?.focus?.[0] || catalogGroups[0]
        }
        muscleGroupOptions={catalogGroups}
        excludeIds={(addForDay ? buildDayWorkout(addForDay).exercises : []).map(
          (ex) => ex.exerciseId || ex.id,
        )}
        onSelect={(catalogEx) => {
          const day = addForDay
          const workout = ensurePersistedWorkout(day)
          const next = appendExerciseToList(workout.exercises || [], catalogEx, {
            sets: 3,
            reps: '8-12',
          })
          persistExercises(day, next)
          setAddForDay(null)
        }}
      />

      <ExerciseSubstitutionModal
        isOpen={Boolean(subFor)}
        mode="substitute"
        onClose={() => setSubFor(null)}
        currentExercise={subFor?.exercise}
        excludeIds={(subFor?.workout?.exercises || [])
          .map((ex) => ex.exerciseId || ex.id)
          .filter((id) => id && id !== (subFor?.exercise?.exerciseId || subFor?.exercise?.id))}
        onSelect={(catalogEx) => {
          const next = replaceExerciseInList(
            subFor.workout.exercises || [],
            subFor.index,
            catalogEx,
            true,
          )
          persistExercises(subFor.day, next)
          setSubFor(null)
        }}
      />

      <CompleteWorkoutModal
        isOpen={Boolean(completeFor)}
        onClose={() => setCompleteFor(null)}
        workout={completeFor ? buildDayWorkout(completeFor) : null}
        plan={plan}
        profile={profile}
        onApply={(indexes) => {
          const day = completeFor
          const workout = ensurePersistedWorkout(day)
          const preview = planCompleteDay(workout, plan, {
            level: plan.level,
            goal: plan.objective || plan.goal,
          })
          const updated = applyCompleteSuggestions(workout, preview.suggestions, indexes)
          persistExercises(day, updated.exercises)
          setCompleteFor(null)
          showToast('Treino completado com as sugestões escolhidas.')
        }}
      />
    </div>
  )
}
