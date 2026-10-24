import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  closeLabel = 'Fechar',
  showClose = true,
}) {
  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className={`modal-overlay modal-overlay--animated ${className ? `${className}-overlay` : ''}`} onClick={onClose} role="presentation">
      <div
        className={`modal modal--${size} modal--animated ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          {title ? (
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
          ) : (
            <span id="modal-title" className="sr-only">
              Diálogo
            </span>
          )}
          {showClose ? (
            <button type="button" className="modal__close" onClick={onClose} aria-label={closeLabel}>
              ×
            </button>
          ) : null}
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
