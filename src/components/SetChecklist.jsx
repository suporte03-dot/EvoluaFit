export default function SetChecklist({
  slots = [],
  targetSets = 3,
  draft = { weight: '', reps: '' },
  onDraftChange,
  onCompleteSet,
  disabled = false,
}) {
  const list = slots.length
    ? slots
    : Array.from({ length: targetSets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
        weight: '',
        reps: '',
      }))

  const nextOpen = list.find((s) => !s.completed)

  return (
    <div className="set-checklist">
      <ul className="set-checklist__list">
        {list.map((slot) => (
          <li
            key={slot.setNumber}
            className={`set-checklist__item${slot.completed ? ' set-checklist__item--done' : ''}${
              nextOpen?.setNumber === slot.setNumber ? ' set-checklist__item--active' : ''
            }`}
          >
            <span className="set-checklist__num">Série {slot.setNumber}</span>
            {slot.completed ? (
              <span className="set-checklist__done">
                {slot.weight || '—'} kg · {slot.reps || '—'} reps
              </span>
            ) : nextOpen?.setNumber === slot.setNumber ? (
              <span className="set-checklist__pending">Em andamento</span>
            ) : (
              <span className="set-checklist__pending">Pendente</span>
            )}
          </li>
        ))}
      </ul>

      {nextOpen && (
        <div className="set-checklist__form">
          <p className="set-checklist__form-label">
            Registrar série {nextOpen.setNumber} de {targetSets}
          </p>
          <div className="form-grid form-grid--2">
            <label className="form-field">
              <span>Peso (kg)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={draft.weight}
                onChange={(e) => onDraftChange?.({ ...draft, weight: e.target.value })}
                placeholder="ex: 20"
                disabled={disabled}
              />
            </label>
            <label className="form-field">
              <span>Repetições</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={draft.reps}
                onChange={(e) => onDraftChange?.({ ...draft, reps: e.target.value })}
                placeholder="ex: 12"
                disabled={disabled}
              />
            </label>
          </div>
          <button
            type="button"
            className="btn btn--primary set-checklist__complete"
            onClick={() => onCompleteSet?.(nextOpen.setNumber, draft)}
            disabled={disabled || !draft.reps}
          >
            Concluir série
          </button>
        </div>
      )}
    </div>
  )
}
