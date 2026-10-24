import { IconTick, IconTrophy } from '../dashboard/icons'
import { formatLoad } from '../../utils/liveWorkout/loadSuggestion.js'

function previousLabel(previous) {
  if (!previous) return '—'
  return previous.weight > 0 ? `${formatLoad(previous.weight)} × ${previous.reps}` : `${previous.reps} reps`
}

/**
 * state: 'done' | 'active' | 'editing' | 'pending'
 * Na linha ativa, KG/REPS mostram o rascunho controlado pelos steppers.
 */
export default function SetRow({ set, previous, state, draft, onEdit, onComplete }) {
  const weight = state === 'active' || state === 'editing' ? draft?.weight : set.weight
  const reps = state === 'active' || state === 'editing' ? draft?.reps : set.reps
  const hasValues = state !== 'pending' || set.completed
  const cells = (
    <>
      <span className="live-set__cell live-set__cell--num">
        {set.setNumber}
        {set.isPR ? <IconTrophy size={14} className="live-set__pr" label="Recorde pessoal" /> : null}
      </span>
      <span className="live-set__cell live-set__cell--prev">{previousLabel(previous)}</span>
      <span className="live-set__cell live-set__cell--val">{hasValues ? formatLoad(weight) : '—'}</span>
      <span className="live-set__cell live-set__cell--val">{hasValues ? reps || '—' : '—'}</span>
    </>
  )

  if (state === 'done') {
    return (
      <li className="live-set live-set--done">
        <button
          type="button"
          className="live-set__row"
          onClick={onEdit}
          aria-label={`Editar série ${set.setNumber}: ${formatLoad(set.weight)} kg, ${set.reps} repetições${set.isPR ? ', recorde pessoal' : ''}`}
        >
          {cells}
          <span className="live-set__cell live-set__cell--ok">
            <span className="live-set__check live-set__check--done" aria-hidden="true">
              <IconTick size={18} />
            </span>
          </span>
        </button>
      </li>
    )
  }

  return (
    <li className={`live-set live-set--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
      <div className="live-set__row">
        {cells}
        <span className="live-set__cell live-set__cell--ok">
          {state === 'active' ? (
            <button
              type="button"
              className="live-set__check live-set__check--active"
              onClick={onComplete}
              aria-label={`Concluir série ${set.setNumber}`}
            >
              <IconTick size={18} />
            </button>
          ) : (
            <span className="live-set__check" aria-hidden="true" />
          )}
        </span>
      </div>
    </li>
  )
}
