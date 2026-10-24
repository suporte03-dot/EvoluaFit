import SetRow from './SetRow'
import { previousForSet } from '../../utils/liveWorkout/exerciseHistory.js'

export default function SetTable({ slots, lastSets, activeIndex, editingIndex, draft, onEdit, onComplete }) {
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
          return (
            <SetRow
              key={set.setNumber}
              set={set}
              previous={previousForSet(lastSets, set.setNumber)}
              state={state}
              draft={draft}
              onEdit={() => onEdit(index)}
              onComplete={onComplete}
            />
          )
        })}
      </ol>
    </section>
  )
}
