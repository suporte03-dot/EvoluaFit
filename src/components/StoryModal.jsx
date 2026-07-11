import { useEffect } from 'react'
import SportImage from './SportImage'

function StoryModal({ story, onClose }) {
  useEffect(() => {
    if (!story) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [story, onClose])

  if (!story) return null

  const paragraphs = story.fullContent ?? [story.excerpt]

  return (
    <div className="modal story-modal" role="dialog" aria-modal="true" aria-labelledby="story-modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel">
        <button type="button" className="modal__close" onClick={onClose} aria-label="Fechar história">
          ✕
        </button>

        <div className="modal__image-wrap">
          <SportImage src={story.image} className="modal__image" alt={story.sport} />
          <div className="modal__image-overlay" />
          <span className="modal__category">{story.tag}</span>
        </div>

        <div className="modal__body">
          <div className="modal__meta">
            <span>{story.sport}</span>
            {story.date && <time>{story.date}</time>}
            {story.readTime && <span>{story.readTime} de leitura</span>}
          </div>
          <h2 id="story-modal-title" className="modal__title">{story.title}</h2>
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

export default StoryModal
