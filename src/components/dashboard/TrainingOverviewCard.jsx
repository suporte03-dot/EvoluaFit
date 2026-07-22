import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { DumbbellsVisual, IconChevron, IconDumbbell } from './icons'
import { getWeeklyProgress } from '../../utils/todayWorkout'

export default function TrainingOverviewCard({ workouts = [], history = [], profile, goals }) {
  const weekly = useMemo(
    () => getWeeklyProgress({ workouts, history, profile, goals }),
    [workouts, history, profile, goals],
  )

  const done = weekly.completedCount ?? 0
  const goal = weekly.weeklyGoal > 0 ? weekly.weeklyGoal : null
  const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0
  const hasPlan = (workouts || []).some((w) => w && !w.isRest)

  return (
    <article className="dash-module dash-module--green dash-module--split">
      <div className="dash-module__body">
        <div className="dash-module__copy">
          <p className="dash-module__eyebrow">
            <IconDumbbell size={14} />
            Meus treinos
          </p>
          <h3 className="dash-module__title">Meus treinos</h3>
          <p className="dash-module__desc">
            {hasPlan
              ? 'Acompanhe sessões da planilha, status e progresso da semana.'
              : 'Monte sua planilha e acompanhe sessões, status e progresso semanal.'}
          </p>
          <button
            type="button"
            className="dash-module__btn dash-module__btn--solid"
            onClick={() => scrollToSection(hasPlan ? 'treinos' : 'planilha')}
          >
            Ver treinos
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--dumbbells" aria-hidden="true">
          <DumbbellsVisual className="dash-visual-dumbbells" />
        </div>
      </div>

      <footer className="dash-module__progress">
        <div className="dash-module__progress-meta">
          <span>
            {goal != null
              ? `${done} de ${goal} treinos concluídos esta semana`
              : done > 0
                ? `${done} treino${done === 1 ? '' : 's'} concluído${done === 1 ? '' : 's'} esta semana`
                : 'Nenhum treino concluído esta semana'}
          </span>
          {goal != null && <strong>{pct}%</strong>}
        </div>
        <div
          className="dash-module__progress-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso semanal de treinos"
        >
          <div className="dash-module__progress-fill" style={{ width: `${goal ? pct : 0}%` }} />
        </div>
      </footer>
    </article>
  )
}
