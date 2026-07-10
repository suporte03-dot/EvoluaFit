import { useEffect } from 'react'
import SportImage from './SportImage'

function NewsModal({ article, onClose }) {
  useEffect(() => {
    if (!article) return undefined

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [article, onClose])

  if (!article) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="modal__panel">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Fechar notícia"
        >
          ✕
        </button>

        <div className="modal__image-wrap">
          <SportImage
            src={article.image}
            filter={article.filter}
            alt={article.category}
            className="modal__image"
          />
          <div className="modal__image-overlay" />
          <span className="modal__category">{article.category}</span>
        </div>

        <div className="modal__body">
          <div className="modal__meta">
            <time>{article.date}</time>
            <span>{article.readTime} de leitura</span>
          </div>
          <h2 id="modal-title" className="modal__title">
            {article.title}
          </h2>
          {article.fullContent.map((paragraph) => (
            <p key={paragraph.slice(0, 30)} className="modal__paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NewsModal
