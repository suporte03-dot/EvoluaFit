import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../../../context/FitnessContext'
import { IconChevron } from '../icons'
import { scrollToSection } from '../../../utils/scrollToSection'
import { workoutCardMeta, weeklyProgressSentence } from '../../../utils/todayWorkout'
import { displayWorkoutName, formatExercisePrescription } from '../../../utils/trainingIdentity'
import WorkoutDetailModal from '../../WorkoutDetailModal'
import { formatDateShort } from '../../../utils/dateFormat'
import { sharePlainText, todayWorkoutShareMessage } from '../../../utils/shareWorkout'
import { TIME_OPTIONS, adjustForTime } from '../../../utils/dayAdjust.js'

const PREVIEW_LIMIT = 4

function heroTone(workout, title) {
  const hay = `${title || ''} ${workout?.name || ''} ${workout?.workoutType || ''} ${(workout?.muscleGroups || []).join(' ')}`.toLowerCase()
  if (/descanso|recuper/.test(hay)) return 'rest'
  if (/push|peito|peitoral|ombro|tr[íi]ceps|empurr/.test(hay)) return 'push'
  if (/pull|costas|b[íi]ceps|puxar|dorsal/.test(hay)) return 'pull'
  if (/legs|perna|gl[úu]teo|inferior|lower|quadri/.test(hay)) return 'legs'
  if (/full|corpo/.test(hay)) return 'full'
  return 'default'
}

export default function TodayWorkoutWidget({ profile, today, weekly, nextAction, onReorganize }) {
  const { startWorkout, pendingSession, resumePendingSession, showToast } = useFitness()
  const navigate = useNavigate()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const [timeTarget, setTimeTarget] = useState(null)
  const detailTarget = nextAction?.workout || today?.workout
  const canAdjustTime =
    Boolean(detailTarget?.exercises?.length) &&
    ['start', 'resume'].includes(nextAction?.kind) &&
    today?.situation !== 'completed'
  const sessionFit = useMemo(
    () => (canAdjustTime ? adjustForTime(detailTarget, timeTarget) : null),
    [canAdjustTime, detailTarget, timeTarget],
  )
  const sessionWorkout = sessionFit?.workout || detailTarget
  const meta = workoutCardMeta(sessionWorkout, profile)
  const title = displayWorkoutName(nextAction?.title || meta?.name || 'Treino de hoje')
  const tone = heroTone(detailTarget, title)
  const allExercises = sessionWorkout?.exercises || []
  const preview = allExercises.slice(0, PREVIEW_LIMIT)
  const hiddenCount = allExercises.length - preview.length
  const weekPct =
    weekly?.weeklyGoal > 0
      ? Math.min(100, Math.round((weekly.completedCount / weekly.weeklyGoal) * 100))
      : 0

  const runNavigate = (section, href) => {
    if (href) {
      navigate(href)
      return
    }
    if (section) scrollToSection(section)
  }

  const handlePrimary = () => {
    if (nextAction?.kind === 'resume' || pendingSession?.workoutId) {
      resumePendingSession()
      return
    }
    if (nextAction?.kind === 'start' && nextAction.workout) {
      const payload = sessionFit?.target ? sessionWorkout : nextAction.workout
      startWorkout(payload)
      if (sessionFit?.summary) showToast(sessionFit.summary, 'info')
      return
    }
    if (nextAction?.kind === 'reorganize') {
      onReorganize?.()
      return
    }
    runNavigate(nextAction?.section, nextAction?.href)
  }

  const handleSecondary = () => {
    if (
      detailTarget &&
      (nextAction?.kind === 'start' || nextAction?.kind === 'resume' || nextAction?.id === 'one-to-goal')
    ) {
      setDetailWorkout(detailTarget)
      return
    }
    runNavigate(nextAction?.secondarySection || nextAction?.section, null)
  }

  return (
    <div className={`fit-hero fit-hero--${tone}`}>
      <div className="fit-hero__glow" aria-hidden="true" />
      <div className={`fit-hero__form fit-hero__form--${tone}`} aria-hidden="true" />
      <div className="fit-hero__copy">
        <p className="fit-hero__kicker">Treino de hoje</p>
        <h2 className="fit-hero__title">{title}</h2>
        {meta ? (
          <ul className="fit-hero__meta" aria-label="Resumo do treino">
            {meta.muscles?.length > 0 && <li>{meta.muscles.slice(0, 3).join(' · ')}</li>}
            <li>{meta.exerciseCount} exercícios</li>
            <li>~{meta.duration} min</li>
          </ul>
        ) : (
          <p className="fit-hero__lead">
            {nextAction?.description || 'O próximo passo da sua evolução aparece aqui.'}
          </p>
        )}
        {nextAction?.description && meta ? <p className="fit-hero__lead">{nextAction.description}</p> : null}
        {today?.nextWorkout && today.situation === 'no_workout_today' ? (
          <p className="fit-hero__lead">
            Próximo: {displayWorkoutName(today.nextWorkout.name)}
            {today.nextWorkout.date ? ` · ${formatDateShort(today.nextWorkout.date)}` : ''}
          </p>
        ) : null}

        <div className="fit-hero__week">
          <div className="fit-hero__week-row">
            <span>{weeklyProgressSentence(weekly)}</span>
            {weekly?.weeklyGoal > 0 ? (
              <strong>
                {weekly.completedCount}/{weekly.weeklyGoal}
              </strong>
            ) : null}
          </div>
          <div
            className="fit-hero__week-track"
            role="progressbar"
            aria-valuenow={weekPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso semanal"
          >
            <span className="fit-hero__week-fill" style={{ width: `${weekPct}%` }} />
          </div>
        </div>

        {canAdjustTime ? (
          <div className="fit-hero__time">
            <p className="fit-hero__time-label">Hoje eu tenho</p>
            <div className="fit-hero__time-pills" role="group" aria-label="Tempo disponível hoje">
              {TIME_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={timeTarget === value ? 'is-active' : ''}
                  onClick={() => setTimeTarget(value)}
                >
                  {value} min
                </button>
              ))}
              <button
                type="button"
                className={timeTarget == null ? 'is-active' : ''}
                onClick={() => setTimeTarget(null)}
              >
                Tempo normal
              </button>
            </div>
            {sessionFit?.summary ? <p className="fit-hero__time-note">{sessionFit.summary}</p> : null}
          </div>
        ) : null}

        <div className="fit-hero__actions">
          <button type="button" className="fit-hero__cta" onClick={handlePrimary}>
            {nextAction?.primaryLabel || 'Continuar'}
          </button>
          <button type="button" className="fit-hero__more" onClick={handleSecondary}>
            {nextAction?.secondaryLabel || 'Ver detalhes'}
            <IconChevron size={16} />
          </button>
          {detailTarget?.exercises?.length ? (
            <button
              type="button"
              className="fit-hero__more"
              onClick={() => sharePlainText(todayWorkoutShareMessage(detailTarget))}
              aria-label="Compartilhar treino de hoje no WhatsApp"
              title="Compartilhar treino de hoje no WhatsApp"
            >
              Compartilhar no WhatsApp
            </button>
          ) : null}
        </div>
      </div>
      {preview.length ? (
        <ol className="fit-hero__preview" aria-label="Prévia dos exercícios">
          {preview.map((ex, index) => (
            <li key={`${ex.exerciseId || ex.name}-${index}`}>
              <span>{index + 1}</span>
              <div>
                <strong>{ex.name}</strong>
                <small>{formatExercisePrescription(ex)}</small>
              </div>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className="fit-hero__preview-more">
              <span aria-hidden="true">+</span>
              <div>
                <strong>
                  +{hiddenCount} {hiddenCount === 1 ? 'exercício' : 'exercícios'}
                </strong>
              </div>
            </li>
          ) : null}
        </ol>
      ) : null}
      {detailWorkout ? (
        <WorkoutDetailModal workout={detailWorkout} isOpen onClose={() => setDetailWorkout(null)} />
      ) : null}
    </div>
  )
}
