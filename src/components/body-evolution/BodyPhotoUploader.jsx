import { useEffect, useId, useRef, useState } from 'react'
import BodyCameraGuide from './BodyCameraGuide'

const EMPTY = { file: null, preview: null }

export default function BodyPhotoUploader({
  label,
  hint,
  required = false,
  value,
  onChange,
  disabled = false,
  error = '',
  uploading = false,
  existingUrl = null,
  onRemoveExisting,
  pose = 'front',
}) {
  const inputId = useId()
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const preview = value?.preview || existingUrl || null
  const filled = Boolean(value?.file || existingUrl)

  useEffect(() => {
    return () => {
      if (value?.preview) URL.revokeObjectURL(value.preview)
    }
  }, [value?.preview])

  const pick = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLocalError('Selecione uma imagem.')
      return
    }
    setLocalError('')
    if (value?.preview) URL.revokeObjectURL(value.preview)
    onChange({ file, preview: URL.createObjectURL(file) })
  }

  const clear = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview)
    onChange(EMPTY)
    setLocalError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={`body-uploader${filled ? ' is-filled' : ''}${uploading ? ' is-loading' : ''}`}>
      <div className="body-uploader__head">
        <label htmlFor={inputId}>
          {label}
          {required ? <span className="body-uploader__req">obrigatória</span> : <span>{hint}</span>}
        </label>
      </div>

      <div className="body-uploader__frame">
        {uploading ? <div className="body-uploader__skel" aria-hidden="true" /> : null}
        {preview ? (
          <img src={preview} alt={`${label} selecionada`} className="body-uploader__preview" />
        ) : (
          <p className="body-uploader__empty">Toque para escolher uma foto</p>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={disabled || uploading}
          onChange={(event) => pick(event.target.files?.[0])}
        />
      </div>

      <div className="body-uploader__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {filled ? 'Substituir' : 'Escolher foto'}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setCameraOpen(true)}
          disabled={disabled || uploading}
        >
          Câmera com guia
        </button>
        {value?.file ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clear} disabled={disabled}>
            Remover
          </button>
        ) : null}
        {!value?.file && existingUrl && onRemoveExisting ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onRemoveExisting}
            disabled={disabled}
          >
            Excluir foto
          </button>
        ) : null}
      </div>
      <p className="body-uploader__privacy">Somente você pode visualizar</p>
      {localError || error ? (
        <p className="body-uploader__error" role="alert">
          {localError || error}
        </p>
      ) : null}
      {cameraOpen ? (
        <BodyCameraGuide
          pose={pose}
          disabled={disabled || uploading}
          onClose={() => setCameraOpen(false)}
          onCapture={(next) => {
            if (value?.preview) URL.revokeObjectURL(value.preview)
            onChange(next)
            setCameraOpen(false)
            setLocalError('')
          }}
        />
      ) : null}
    </div>
  )
}
