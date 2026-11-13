import { useEffect, useState } from 'react'

export default function BodyPhotoViewer({ open, title, url, onClose }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [url])

  if (!open) return null

  return (
    <div className="body-viewer" role="dialog" aria-modal="true" aria-label={title || 'Foto'}>
      <button type="button" className="body-viewer__backdrop" aria-label="Fechar" onClick={onClose} />
      <div className="body-viewer__panel">
        {!loaded ? <div className="body-uploader__skel" aria-hidden="true" /> : null}
        {url ? (
          <img src={url} alt={title || 'Foto do registro corporal'} onLoad={() => setLoaded(true)} />
        ) : (
          <p>Não foi possível abrir esta foto.</p>
        )}
        <p className="body-uploader__privacy">Somente você pode visualizar</p>
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  )
}
