import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../../../context/FitnessContext'
import { IconChevron } from '../icons'
import { scrollToSection } from '../../../utils/scrollToSection'
import { workoutCardMeta, weeklyProgressSentence } from '../../../utils/todayWorkout'
import WorkoutDetailModal from '../../WorkoutDetailModal'
import { formatDateShort } from '../../../utils/dateFormat'

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
  const { startWorkout, pendingSession, resumePendingSession } = useFitness()
  const navigate = useNavigate()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const meta = workoutCardMeta(today?.workout, profile)
  const detailTarget = nextAction?.workout || today?.workout
  const title = nextAction?.title || meta?.name || 'Treino de hoje'
  const tone = heroTone(detailTarget, title)
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
      startWorkout(nextAction.workout)
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
            Próximo: {today.nextWorkout.name}
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

        <div className="fit-hero__actions">
          <button type="button" className="fit-hero__cta" onClick={handlePrimary}>
            {nextAction?.primaryLabel || 'Continuar'}
          </button>
          <button type="button" className="fit-hero__more" onClick={handleSecondary}>
            {nextAction?.secondaryLabel || 'Ver detalhes'}
            <IconChevron size={16} />
          </button>
        </div>
      </div>
      {detailWorkout ? (
        <WorkoutDetailModal workout={detailWorkout} isOpen onClose={() => setDetailWorkout(null)} />
      ) : null}
    </div>
  )
}
