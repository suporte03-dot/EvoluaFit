import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cancelSpeech,
  getSpeechRecognitionCtor,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  loadTtsPreference,
  saveTtsPreference,
  speakText,
  toSpokenAnswer,
} from '../utils/coachVoice'

/**
 * Voice conversation for Coach IA (hands-busy / gym).
 * Mic permission is requested only when startListening() runs.
 */
export default function useCoachVoice({ onTranscript, enabled = true } = {}) {
  const [voiceState, setVoiceState] = useState('idle') // idle | listening | processing
  const [ttsEnabled, setTtsEnabled] = useState(() => loadTtsPreference())
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const onTranscriptRef = useRef(onTranscript)
  const intentionalStopRef = useRef(false)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const supported = isSpeechRecognitionSupported()
  const ttsSupported = isSpeechSynthesisSupported()

  const stopListening = useCallback(() => {
    intentionalStopRef.current = true
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
    setVoiceState((s) => (s === 'listening' ? 'idle' : s))
    setInterimText('')
  }, [])

  const startListening = useCallback(() => {
    if (!enabled || !supported) {
      setError('unsupported')
      return
    }

    cancelSpeech()
    setError(null)
    intentionalStopRef.current = false

    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('unsupported')
      return
    }

    // Stop any previous instance
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
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setVoiceState('listening')
      setInterimText('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result[0]?.transcript || ''
        if (result.isFinal) finalText += transcript
        else interim += transcript
      }
      if (interim) setInterimText(interim)
      if (finalText.trim()) {
        setInterimText('')
        setVoiceState('processing')
        onTranscriptRef.current?.(finalText.trim())
      }
    }

    recognition.onerror = (event) => {
      const code = event?.error || 'error'
      if (code === 'aborted' || code === 'no-speech') {
        setVoiceState('idle')
        setInterimText('')
        if (code === 'no-speech') setError('no-speech')
        return
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('permission')
      } else {
        setError('error')
      }
      setVoiceState('idle')
      setInterimText('')
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setVoiceState((s) => {
        if (intentionalStopRef.current) return 'idle'
        if (s === 'listening') return 'idle'
        return s
      })
    }

    recognitionRef.current = recognition
    try {
      recognition.start() // mic permission prompted here, not on page load
    } catch {
      setError('error')
      setVoiceState('idle')
    }
  }, [enabled, supported])

  const toggleListening = useCallback(() => {
    if (voiceState === 'listening') {
      stopListening()
      return
    }
    if (voiceState === 'processing') return
    startListening()
  }, [voiceState, startListening, stopListening])

  const setSpeakReplies = useCallback((on) => {
    setTtsEnabled(on)
    saveTtsPreference(on)
    if (!on) cancelSpeech()
  }, [])

  const speakCoachReply = useCallback(
    async (result) => {
      if (!ttsEnabled || !ttsSupported) return false
      const spoken = toSpokenAnswer(result)
      if (!spoken) return false
      return speakText(spoken)
    },
    [ttsEnabled, ttsSupported],
  )

  const markIdle = useCallback(() => {
    setVoiceState('idle')
  }, [])

  const markProcessing = useCallback(() => {
    setVoiceState('processing')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      cancelSpeech()
    }
  }, [])

  // Esc cancela escuta
  useEffect(() => {
    if (voiceState !== 'listening') return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        stopListening()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [voiceState, stopListening])

  return {
    voiceState,
    interimText,
    error,
    supported,
    ttsSupported,
    ttsEnabled,
    setSpeakReplies,
    startListening,
    stopListening,
    toggleListening,
    speakCoachReply,
    markIdle,
    markProcessing,
    clearError: () => setError(null),
  }
}
