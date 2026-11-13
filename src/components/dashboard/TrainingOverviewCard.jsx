import { useMemo } from 'react'
import { scrollToSection } from '../../utils/scrollToSection'
import { IconChevron } from './icons'
import dumbbellsImage from '../../assets/dashboard/dumbbells-green.png'
import { getWeeklyProgress } from '../../utils/todayWorkout'
import { formatDateShort } from '../../utils/dateFormat'

function isPending(status) {
  const s = String(status || '').toLowerCase()
  return ['pendente', 'parcial', 'planejado', 'planned', 'pending', 'partial'].includes(s)
}

function isDone(status) {
  const s = String(status || '').toLowerCase()
  return ['realizado', 'completed', 'done'].includes(s)
}

export default function TrainingOverviewCard({ workouts = [], history = [], profile, goals }) {
  const weekly = useMemo(
    () => getWeeklyProgress({ workouts, history, profile, goals }),
    [workouts, history, profile, goals],
  )

  const done = weekly.completedCount ?? 0
  const goal = weekly.weeklyGoal > 0 ? weekly.weeklyGoal : null
  const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0
  const remaining = goal != null ? Math.max(0, goal - done) : weekly.pendingThisWeek
  const hasPlan = (workouts || []).some((w) => w && !w.isRest)

  const nextWorkout = useMemo(() => {
    return (workouts || [])
      .filter((w) => w && !w.isRest && isPending(w.status))
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))[0]
  }, [workouts])

  const lastSession = useMemo(() => {
    if (history?.[0]) return history[0]
    return (workouts || [])
      .filter((w) => w && isDone(w.status))
      .sort((a, b) =>
        String(b.completedAt || b.date || '').localeCompare(String(a.completedAt || a.date || '')),
      )[0]
  }, [history, workouts])

  return (
    <article className="dash-module dash-module--green">
      <div className="dash-module__body">
        <div className="dash-module__copy">
          <h3 className="dash-module__title">Meus treinos</h3>
          <p className="dash-module__desc">
            {hasPlan
              ? 'Acompanhe sessões da planilha, status e progresso da semana.'
              : 'Monte sua planilha e acompanhe sessões, status e progresso semanal.'}
          </p>

          {(nextWorkout || lastSession || remaining > 0) && (
            <ul className="dash-module__facts">
              {nextWorkout && (
                <li>
                  <span>Próximo</span>
                  <strong>
                    {nextWorkout.name?.split('—')[0]?.trim() || nextWorkout.name}
                    {nextWorkout.date ? ` · ${formatDateShort(nextWorkout.date)}` : ''}
                  </strong>
                </li>
              )}
              {lastSession && (
                <li>
                  <span>Última sessão</span>
                  <strong>
                    {lastSession.name?.split('—')[0]?.trim() || 'Treino'}
                    {lastSession.completedAt || lastSession.date
                      ? ` · ${formatDateShort(lastSession.completedAt || lastSession.date)}`
                      : ''}
                  </strong>
                </li>
              )}
              {goal != null && (
                <li>
                  <span>Restante na semana</span>
                  <strong>
                    {remaining} treino{remaining === 1 ? '' : 's'}
                  </strong>
                </li>
              )}
            </ul>
          )}

          <button
            type="button"
            className="dash-module__btn dash-module__btn--outline"
            onClick={() => scrollToSection(hasPlan ? 'treinos' : 'planilha')}
          >
            Ver treinos
            <IconChevron size={16} />
          </button>
        </div>

        <div className="dash-module__visual dash-module__visual--dumbbells" aria-hidden="true">
          <img src={dumbbellsImage} alt="" className="dash-visual-dumbbells" />
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
