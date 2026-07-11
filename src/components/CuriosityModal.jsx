import { useEffect } from 'react'

function CuriosityModal({ curiosity, onClose }) {
  useEffect(() => {
    if (!curiosity) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [curiosity, onClose])

  if (!curiosity) return null

  const paragraphs = curiosity.fullContent ?? [curiosity.answer]

  return (
    <div className="modal curiosity-modal" role="dialog" aria-modal="true" aria-labelledby="curiosity-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar curiosidade">
          ✕
        </button>

        <div className="curiosity-modal__header">
          <span className="curiosity-modal__icon" aria-hidden="true">{curiosity.icon}</span>
          <span className="curiosities__sport">{curiosity.sport}</span>
        </div>

        <div className="modal__body">
          <h2 id="curiosity-modal-title" className="modal__title">{curiosity.question}</h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="modal__paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CuriosityModal
