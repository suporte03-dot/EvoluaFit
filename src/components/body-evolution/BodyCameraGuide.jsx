import { useEffect, useRef, useState } from 'react'

const POSE_HINT = {
  front: 'Alinhe ombros e quadril na silhueta frontal',
  side: 'Fique de perfil, braços relaxados',
  back: 'Costas para a câmera, postura ereta',
}

export default function BodyCameraGuide({
  pose = 'front',
  onCapture,
  onClose,
  disabled = false,
}) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      setError('')
      setReady(false)
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Este aparelho não permite câmera no navegador. Use “Escolher foto”.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch {
        setError('Não foi possível abrir a câmera. Verifique a permissão ou escolha uma foto.')
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const capture = async () => {
    const video = videoRef.current
    if (!video || !ready || disabled) return
    const canvas = document.createElement('canvas')
    const w = video.videoWidth || 720
    const h = video.videoHeight || 960
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) return
    const file = new File([blob], `espelho-${pose}-${Date.now()}.jpg`, { type: 'image/jpeg' })
    const preview = URL.createObjectURL(blob)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCapture?.({ file, preview })
  }

  return (
    <div className="body-camera" role="dialog" aria-modal="true" aria-label="Câmera com silhueta-guia">
      <div className="body-camera__frame">
        <video ref={videoRef} playsInline muted autoPlay className="body-camera__video" />
        <svg className="body-camera__guide" viewBox="0 0 200 360" aria-hidden="true">
          {pose === 'side' ? (
            <path
              d="M108 40 C118 40,124 52,122 64 C120 74,112 78,108 86 C116 100,122 130,118 160 C114 190,110 210,112 230 C116 260,118 290,114 320 C108 330,100 330,96 320 C92 290,94 260,90 230 C88 210,84 190,88 160 C92 130,98 100,108 86 C102 78,96 70,96 60 C96 48,100 40,108 40 Z"
              fill="none"
              stroke="rgba(248,250,252,0.85)"
              strokeWidth="2"
              strokeDasharray="6 5"
            />
          ) : (
            <g fill="none" stroke="rgba(248,250,252,0.85)" strokeWidth="2" strokeDasharray="6 5">
              <ellipse cx="100" cy="48" rx="22" ry="24" />
              <path d="M78 78 C90 70,110 70,122 78 C130 110,128 150,118 190 C110 210,90 210,82 190 C72 150,70 110,78 78 Z" />
              <path d="M78 190 C90 188,96 260,92 320" />
              <path d="M122 190 C110 188,104 260,108 320" />
              <path d="M78 90 C60 100,52 140,54 170" />
              <path d="M122 90 C140 100,148 140,146 170" />
            </g>
          )}
        </svg>
      </div>
      <p className="body-camera__hint">{POSE_HINT[pose] || POSE_HINT.front}</p>
      {error ? (
        <p className="body-camera__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="body-camera__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={capture}
          disabled={!ready || disabled || Boolean(error)}
        >
          Capturar foto
        </button>
      </div>
    </div>
  )
}
