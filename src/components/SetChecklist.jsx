export default function SetChecklist({
  slots = [],
  targetSets = 3,
  draft = { weight: '', reps: '' },
  onDraftChange,
  onCompleteSet,
  disabled = false,
  tracking = 'reps',
  lastLoad = '',
}) {
  const timed = tracking === 'time' || tracking === 'duration'
  const valueLabel = timed ? (tracking === 'duration' ? 'Tempo (min)' : 'Tempo (s)') : 'Repetições'
  const valuePlaceholder = timed ? (tracking === 'duration' ? 'ex: 8' : 'ex: 40') : 'ex: 12'
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
                {timed
                  ? `${slot.reps || '—'} ${tracking === 'duration' ? 'min' : 's'}`
                  : `${slot.weight || '—'} kg · ${slot.reps || '—'} reps`}
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
          {lastLoad && !timed ? (
            <p className="set-checklist__last">Última carga: {/kg/i.test(String(lastLoad)) ? lastLoad : `${lastLoad} kg`}</p>
          ) : null}
          <div className={`form-grid${timed ? '' : ' form-grid--2'}`}>
            {timed ? null : (
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
            )}
            <label className="form-field">
              <span>{valueLabel}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step={timed ? '1' : '1'}
                value={draft.reps}
                onChange={(e) => onDraftChange?.({ ...draft, reps: e.target.value })}
                placeholder={valuePlaceholder}
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
