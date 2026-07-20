import { useEffect, useId, useRef, useState } from 'react'

/**
 * Select customizado com contraste premium (fundo escuro + texto claro).
 * Substitui o <select> nativo, cujo menu aberto o SO controla e não estiliza bem.
 */
export default function PremiumSelect({
  label,
  value,
  options = [],
  onChange,
  ariaLabel,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const buttonId = useId()

  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  )
  const selected = normalized.find((o) => o.value === value) || normalized[0]

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const choose = (nextValue) => {
    onChange?.(nextValue)
    setOpen(false)
  }

  const moveSelection = (direction) => {
    const idx = Math.max(
      0,
      normalized.findIndex((o) => o.value === (selected?.value ?? value)),
    )
    const next = normalized[(idx + direction + normalized.length) % normalized.length]
    if (next) onChange?.(next.value)
  }

  return (
    <div
      className={`premium-select ${open ? 'is-open' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      {label && (
        <span className="premium-select__label" id={`${buttonId}-label`}>
          {label}
        </span>
      )}
      <button
        type="button"
        id={buttonId}
        className="premium-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label ? `${buttonId}-label` : undefined}
        aria-label={ariaLabel || label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!open) setOpen(true)
            else moveSelection(1)
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!open) setOpen(true)
            else moveSelection(-1)
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
      >
        <span className="premium-select__value">{selected?.label || 'Selecionar'}</span>
        <span className="premium-select__chevron" aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listId}
          className="premium-select__menu"
          role="listbox"
          aria-labelledby={buttonId}
        >
          {normalized.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`premium-select__option${isSelected ? ' is-selected' : ''}`}
                  onClick={() => choose(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
