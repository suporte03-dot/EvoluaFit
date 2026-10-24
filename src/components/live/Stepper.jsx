import { useEffect, useState } from 'react'
import { IconMinimize, IconPlus } from '../dashboard/icons'

function parseInput(raw) {
  const n = parseFloat(String(raw).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function display(value, decimals) {
  const n = Number(value) || 0
  if (!decimals || Number.isInteger(n)) return String(n)
  return n.toFixed(decimals).replace('.', ',')
}

export default function Stepper({
  id,
  label,
  unit,
  value,
  step = 1,
  min = 0,
  max = 999,
  decimals = 0,
  onChange,
  disabled = false,
}) {
  const [text, setText] = useState(display(value, decimals))

  useEffect(() => {
    setText(display(value, decimals))
  }, [value, decimals])

  const commit = (next) => {
    const clamped = Math.min(max, Math.max(min, Math.round(next / step) * step))
    const rounded = Number(clamped.toFixed(2))
    onChange?.(rounded)
    setText(display(rounded, decimals))
  }

  return (
    <div className="live-stepper">
      <label className="live-stepper__label" htmlFor={id}>
        {label}
      </label>
      <div className="live-stepper__control">
        <button
          type="button"
          className="live-stepper__btn"
          onClick={() => commit((Number(value) || 0) - step)}
          disabled={disabled || (Number(value) || 0) <= min}
          aria-label={`Diminuir ${label.toLowerCase()} em ${display(step, decimals)}${unit ? ` ${unit}` : ''}`}
        >
          <IconMinimize size={20} />
        </button>
        <input
          id={id}
          className="live-stepper__value"
          type="text"
          inputMode={decimals ? 'decimal' : 'numeric'}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value.replace(/[^\d.,]/g, ''))}
          onBlur={() => commit(parseInput(text))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
          aria-describedby={unit ? `${id}-unit` : undefined}
        />
        {unit ? (
          <span id={`${id}-unit`} className="live-stepper__unit">
            {unit}
          </span>
        ) : null}
        <button
          type="button"
          className="live-stepper__btn"
          onClick={() => commit((Number(value) || 0) + step)}
          disabled={disabled || (Number(value) || 0) >= max}
          aria-label={`Aumentar ${label.toLowerCase()} em ${display(step, decimals)}${unit ? ` ${unit}` : ''}`}
        >
          <IconPlus size={20} />
        </button>
      </div>
    </div>
  )
}
