import { useEffect, useRef, useState } from 'react'
import { formatLoad } from '../../utils/liveWorkout/loadSuggestion.js'
import { parseVoiceAlternatives } from '../../utils/liveWorkout/voiceParser.js'
import { sharePlainText, whatsappSetLogMessage } from '../../utils/shareWorkout.js'

function getRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const ERROR_COPY = {
  'not-allowed': 'Permita o microfone nas configurações do navegador para registrar por voz.',
  'service-not-allowed': 'Registro por voz indisponível neste navegador.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale, por exemplo: "10 repetições com 40 quilos".',
  'audio-capture': 'Microfone não encontrado.',
  network: 'O reconhecimento de voz precisa de internet neste aparelho.',
}

function MicIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

/**
 * Microfone para registrar a série falando ("8 com 22,5"). Nada é salvo sem confirmação.
 * Some quando o navegador não oferece Web Speech API.
 */
export default function VoiceSetButton({
  currentWeight,
  setLabel,
  exerciseName = '',
  onApply,
  onApplyAndSave,
  disabled = false,
}) {
  const [Recognition] = useState(getRecognition)
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const recRef = useRef(null)

  useEffect(
    () => () => {
      recRef.current?.abort?.()
      recRef.current = null
    },
    [],
  )

  if (!Recognition) return null

  const start = () => {
    if (phase === 'listening') {
      recRef.current?.stop?.()
      return
    }
    setError('')
    setResult(null)
    let rec
    try {
      rec = new Recognition()
    } catch {
      setError(ERROR_COPY['service-not-allowed'])
      return
    }
    rec.lang = 'pt-BR'
    rec.interimResults = false
    rec.continuous = false
    rec.maxAlternatives = 4
    let heard = false
    rec.onresult = (event) => {
      heard = true
      const alternatives = [...(event.results?.[0] || [])].map((alt) => alt.transcript)
      const parsed = parseVoiceAlternatives(alternatives)
      if (parsed) {
        setResult(parsed)
        setPhase('confirm')
      } else {
        setError(`Não entendi "${alternatives[0] || ''}". Tente: "10 repetições com 40 quilos".`)
        setPhase('idle')
      }
    }
    rec.onerror = (event) => {
      heard = true
      if (event.error !== 'aborted') setError(ERROR_COPY[event.error] || 'Não foi possível ouvir agora. Tente de novo.')
      setPhase('idle')
    }
    rec.onend = () => {
      recRef.current = null
      if (!heard) setPhase('idle')
    }
    recRef.current = rec
    try {
      rec.start()
      setPhase('listening')
    } catch {
      setError('Não foi possível iniciar o microfone.')
      setPhase('idle')
    }
  }

  const values = result ? { weight: result.load ?? currentWeight, reps: result.reps } : null
  const close = () => {
    setResult(null)
    setPhase('idle')
  }

  return (
    <div className="live-voice">
      <button
        type="button"
        className={`live-voice__mic${phase === 'listening' ? ' is-listening' : ''}`}
        onClick={start}
        disabled={disabled}
        aria-pressed={phase === 'listening'}
        aria-label={phase === 'listening' ? 'Parar de ouvir' : `Registrar ${setLabel} por voz`}
      >
        <MicIcon />
        <span>{phase === 'listening' ? 'Ouvindo... fale a série' : 'Registrar por voz'}</span>
      </button>

      {error ? (
        <p className="live-voice__error" role="alert">
          {error}
        </p>
      ) : null}

      {phase === 'confirm' && values ? (
        <div className="live-voice__confirm" role="group" aria-label="Confirmar série ditada">
          <p className="live-voice__heard">
            Entendi: <strong>{values.reps != null ? `${values.reps} reps` : 'reps mantidas'}</strong>
            {' · '}
            <strong>{formatLoad(values.weight)} kg</strong>
            {result.load == null ? <span className="live-voice__muted"> (carga mantida)</span> : null}
          </p>
          <p className="live-voice__transcript">"{result.transcript}"</p>
          <div className="live-voice__actions">
            {values.reps != null ? (
              <button
                type="button"
                className="live-btn live-btn--primary"
                onClick={() => {
                  close()
                  onApplyAndSave?.(values)
                }}
              >
                Salvar {setLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="live-btn live-btn--ghost"
              onClick={() => {
                close()
                onApply?.(values)
              }}
            >
              Só preencher
            </button>
            <button
              type="button"
              className="live-btn live-btn--ghost"
              onClick={() =>
                sharePlainText(
                  whatsappSetLogMessage({
                    exerciseName,
                    reps: values.reps,
                    weightKg: values.weight,
                  }),
                )
              }
            >
              Registrar no WhatsApp
            </button>
            <button type="button" className="live-link" onClick={close}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
