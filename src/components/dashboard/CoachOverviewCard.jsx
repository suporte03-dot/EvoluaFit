import { useMemo } from 'react'
import coachOrb from '../../assets/dashboard/coach-ai-orb.svg'
import { scrollToSection } from '../../utils/scrollToSection'
import { IconChevron } from './icons'
import { resolveTodayWorkout, situationCopy } from '../../utils/todayWorkout'
import { formatDateShort } from '../../utils/dateFormat'

export default function CoachOverviewCard({ workouts, history, plans, generatedPlan, profile }) {
  const today = useMemo(
    () =>
      resolveTodayWorkout({
        workouts,
        history,
        plans: plans?.length ? plans : generatedPlan ? [generatedPlan] : [],
      }),
    [workouts, history, plans, generatedPlan],
  )

  const copy = situationCopy(today.situation, {
    daysSinceLast: today.daysSinceLast,
    nextWorkout: today.nextWorkout || today.workout,
  })

  const tip = useMemo(() => {
    const workout = today.nextWorkout || today.workout
    const name = workout?.name?.split('—')[0]?.trim()
    const focus = workout?.name?.split('—')[1]?.trim()
    const when = workout?.date ? formatDateShort(workout.date) : null

    switch (today.situation) {
      case 'ready':
        return name
          ? `Foco${focus ? ` no ${focus.toLowerCase()}` : ''}! Seu treino ${name} está pronto para hoje.`
          : 'Há um treino pronto para hoje. Comece quando estiver aquecido.'
      case 'completed':
        return 'Sessão feita. Priorize sono e hidratação para recuperar bem.'
      case 'partial':
        return name
          ? `Você tem ${name} parcial. Retomar agora evita perder o ritmo.`
          : 'Você tem uma sessão parcial. Retomar agora evita perder o ritmo.'
      case 'returning':
        return 'Volte com volume confortável. Consistência vale mais que intensidade.'
      case 'no_plan':
        return 'Monte uma planilha e o Coach passa a sugerir com base na sua rotina.'
      case 'no_workout_today':
        if (name) {
          return `Foco${focus ? ` no ${focus.toLowerCase()}` : ''}! Seu próximo treino ${name}${
            when ? ` está agendado para ${when}` : ''
          }.`
        }
        return copy.description || 'Use o calendário para alinhar o próximo treino.'
      default:
        return 'Pergunte ao Coach sobre carga, substituições ou ajustes da planilha.'
    }
  }, [today, copy.description])

  return (
    <article className="dash-module dash-module--cyan dash-module--coach">
      <div className="dash-module__body dash-module__body--coach">
        <div className="dash-module__copy">
          <h3 className="dash-module__title">Coach</h3>
          <p className="dash-module__desc">
            {profile?.level
              ? `Sugestões com base no seu nível (${profile.level}) e na planilha.`
              : 'Sugestões com base no próximo treino da planilha.'}
          </p>
          <button
            type="button"
            className="dash-module__btn dash-module__btn--outline"
            onClick={() => scrollToSection('coach-ia')}
          >
            Abrir Coach
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--orb" aria-hidden="true">
          <img src={coachOrb} alt="" className="dash-visual-orb" width={160} height={160} />
        </div>

        <aside className="dash-coach-bubble" aria-label="Dica do Coach">
          <p>{tip}</p>
        </aside>
      </div>
    </article>
  )
}
