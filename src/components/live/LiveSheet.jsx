import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Bottom sheet acessível: foco preso no painel, Esc fecha, foco volta ao gatilho. */
export default function LiveSheet({ open, title, onClose, children, tone = 'default', dismissible = true }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const panel = panelRef.current
    const focusables = () =>
      panel?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])') || []
    ;(focusables()[0] || panel)?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = [...focusables()]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, dismissible])

  if (!open) return null

  return createPortal(
    <div className="live-root live-sheet" role="presentation">
      <button
        type="button"
        className="live-sheet__backdrop"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        className={`live-sheet__panel live-sheet__panel--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <span className="live-sheet__grip" aria-hidden="true" />
        <h2 id={titleId} className="live-sheet__title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
