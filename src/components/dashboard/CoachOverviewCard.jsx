import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { IconChevron, IconSpark, RadarVisual } from './icons'
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
          <p className="dash-module__eyebrow">
            <IconSpark size={14} />
            Coach IA
          </p>
          <h3 className="dash-module__title">Coach IA</h3>
          <p className="dash-module__desc">
            {profile?.level
              ? `Orientação personalizada para nível ${profile.level}.`
              : 'Dicas contextuais com base no seu próximo treino e rotina.'}
          </p>
          <button
            type="button"
            className="dash-module__btn dash-module__btn--outline"
            onClick={() => scrollToSection('coach-ia')}
          >
            Conversar com IA
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--radar" aria-hidden="true">
          <RadarVisual className="dash-visual-radar" />
        </div>

        <aside className="dash-coach-bubble" aria-label="Dica do Coach">
          <p>{tip}</p>
        </aside>
      </div>
    </article>
  )
}
