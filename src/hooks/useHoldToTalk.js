import { useCallback, useEffect, useRef, useState } from 'react'
import { cancelSpeech, getSpeechRecognitionCtor, isSpeechRecognitionSupported } from '../utils/coachVoice'

/**
 * Hold-to-talk for gym noise: listen only while the button is pressed.
 * Mic permission is requested on first press, not on mount.
 */
export default function useHoldToTalk({ onTranscript, enabled = true } = {}) {
  const [voiceState, setVoiceState] = useState('idle')
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const finalsRef = useRef('')
  const onTranscriptRef = useRef(onTranscript)
  const holdingRef = useRef(false)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const supported = isSpeechRecognitionSupported()

  const stop = useCallback((flush) => {
    holdingRef.current = false
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    }
    const text = (finalsRef.current || '').trim()
    finalsRef.current = ''
    recognitionRef.current = null
    setInterimText('')
    if (flush && text) {
      setVoiceState('processing')
      onTranscriptRef.current?.(text)
      return
    }
    setVoiceState('idle')
  }, [])

  const start = useCallback(() => {
    if (!enabled || !supported) {
      setError('unsupported')
      return
    }

    cancelSpeech()
    setError(null)
    holdingRef.current = true
    finalsRef.current = ''

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('unsupported')
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }

    const recognition = new Ctor()
    recognition.lang = 'pt-BR'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      if (holdingRef.current) setVoiceState('listening')
    }

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0]?.transcript || ''
        if (result.isFinal) finalsRef.current = `${finalsRef.current} ${transcript}`.trim()
        else interim += transcript
      }
      if (interim) setInterimText(interim)
    }

    recognition.onerror = (event) => {
      const code = event?.error || 'error'
      if (code === 'aborted' || code === 'no-speech') {
        if (!holdingRef.current) setVoiceState('idle')
        if (code === 'no-speech') setError('no-speech')
        return
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') setError('permission')
      else setError('error')
      holdingRef.current = false
      setVoiceState('idle')
    }

    recognition.onend = () => {
      recognitionRef.current = null
      if (holdingRef.current) {
        try {
          recognition.start()
          recognitionRef.current = recognition
        } catch {
          holdingRef.current = false
          setVoiceState('idle')
        }
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      setError('error')
      setVoiceState('idle')
      holdingRef.current = false
    }
  }, [enabled, supported])

  const onPressStart = useCallback(
    (event) => {
      event.preventDefault()
      if (voiceState === 'processing') return
      try {
        event.currentTarget?.setPointerCapture?.(event.pointerId)
      } catch {
        /* ignore */
      }
      start()
    },
    [start, voiceState],
  )

  const onPressEnd = useCallback(
    (event) => {
      event.preventDefault()
      if (!holdingRef.current && voiceState !== 'listening') return
      const leftover = (finalsRef.current || interimText || '').trim()
      if (!finalsRef.current && leftover) finalsRef.current = leftover
      stop(true)
    },
    [interimText, stop, voiceState],
  )

  const markIdle = useCallback(() => setVoiceState('idle'), [])

  useEffect(() => {
    return () => {
      holdingRef.current = false
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      cancelSpeech()
    }
  }, [])

  return {
    voiceState,
    interimText,
    error,
    supported,
    onPressStart,
    onPressEnd,
    markIdle,
    clearError: () => setError(null),
  }
}
