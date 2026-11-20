export default function Toast({ toasts, onAction }) {
  if (!toasts.length) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`}>
          <span className="toast__message">{toast.message}</span>
          {toast.actionLabel ? (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.onAction?.()
                onAction?.(toast)
              }}
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
