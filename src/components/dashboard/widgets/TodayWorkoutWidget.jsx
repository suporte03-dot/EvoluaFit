import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFitness } from '../../../context/FitnessContext'
import { IconChevron } from '../icons'
import { scrollToSection } from '../../../utils/scrollToSection'
import { workoutCardMeta } from '../../../utils/todayWorkout'
import WorkoutDetailModal from '../../WorkoutDetailModal'
import { formatDateShort } from '../../../utils/dateFormat'

export default function TodayWorkoutWidget({ profile, today, nextAction, onReorganize }) {
  const { startWorkout, pendingSession, resumePendingSession } = useFitness()
  const navigate = useNavigate()
  const [detailWorkout, setDetailWorkout] = useState(null)
  const meta = workoutCardMeta(today?.workout, profile)
  const detailTarget = nextAction?.workout || today?.workout
  const title = nextAction?.title || meta?.name || 'Treino de hoje'

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
    <div className="focus-widget-body focus-today">
      <p className="hoje-card__kicker">Evolua Daily</p>
      <h3 className="focus-today__title">{title}</h3>
      {meta ? (
        <ul className="dash-hero__meta" aria-label="Resumo do treino">
          {meta.muscles?.length > 0 && <li>{meta.muscles.slice(0, 3).join(' · ')}</li>}
          <li>{meta.exerciseCount} exercícios</li>
          <li>~{meta.duration} min</li>
        </ul>
      ) : (
        <p className="hoje-card__body">{nextAction?.description || 'O próximo passo da sua evolução aparece aqui.'}</p>
      )}
      {nextAction?.description && meta ? (
        <p className="hoje-card__note">{nextAction.description}</p>
      ) : null}
      {today?.nextWorkout && today.situation === 'no_workout_today' ? (
        <p className="hoje-card__note">
          Próximo: {today.nextWorkout.name}
          {today.nextWorkout.date ? ` · ${formatDateShort(today.nextWorkout.date)}` : ''}
        </p>
      ) : null}
      <div className="dash-hero__actions">
        <button type="button" className="dash-hero__cta" onClick={handlePrimary}>
          {nextAction?.primaryLabel || 'Continuar'}
        </button>
        <button type="button" className="dash-hero__more" onClick={handleSecondary}>
          {nextAction?.secondaryLabel || 'Ver detalhes'}
          <IconChevron size={16} />
        </button>
      </div>
      {detailWorkout ? (
        <WorkoutDetailModal workout={detailWorkout} isOpen onClose={() => setDetailWorkout(null)} />
      ) : null}
    </div>
  )
}
