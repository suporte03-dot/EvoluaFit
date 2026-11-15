import SetRow from './SetRow'
import { previousForSet } from '../../utils/liveWorkout/exerciseHistory.js'
import { formatSetHint, suggestSetTarget } from '../../utils/liveWorkout/loadSuggestion.js'

export default function SetTable({
  slots,
  lastSets,
  activeIndex,
  editingIndex,
  draft,
  onEdit,
  onComplete,
  suggestion = null,
  repRange = null,
  onUseSuggestion,
}) {
  return (
    <section className="live-sets" aria-label="Séries do exercício">
      <div className="live-sets__head" aria-hidden="true">
        <span>Série</span>
        <span>Anterior</span>
        <span>Kg</span>
        <span>Reps</span>
        <span>OK</span>
      </div>
      <ol className="live-sets__list">
        {slots.map((set, index) => {
          let state = 'pending'
          if (index === editingIndex) state = 'editing'
          else if (set.completed) state = 'done'
          else if (index === activeIndex && editingIndex == null) state = 'active'
          const previous = previousForSet(lastSets, set.setNumber)
          const target = state === 'done' ? null : suggestSetTarget(suggestion, { previous, repRange })
          const canUse = target && (state === 'active' || state === 'editing') && onUseSuggestion
          return (
            <SetRow
              key={set.setNumber}
              set={set}
              previous={previous}
              state={state}
              draft={draft}
              onEdit={() => onEdit(index)}
              onComplete={onComplete}
              hint={formatSetHint(target)}
              onUseHint={canUse ? () => onUseSuggestion(target) : null}
            />
          )
        })}
      </ol>
    </section>
  )
}
