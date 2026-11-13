/**
 * Coach IA voice helpers — Web Speech API (browser) + speechSynthesis.
 * No cloud STT/TTS; áudio não é enviado aos servidores EvoluaFit.
 */

export const VOICE_TTS_STORAGE_KEY = 'evoluafit-coach-tts-enabled'

export function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionCtor())
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

/** Preferência “Ouvir respostas” — default ligado quando TTS existe. */
export function loadTtsPreference() {
  try {
    const raw = localStorage.getItem(VOICE_TTS_STORAGE_KEY)
    if (raw === null) return isSpeechSynthesisSupported()
    return raw === '1' || raw === 'true'
  } catch {
    return isSpeechSynthesisSupported()
  }
}

export function saveTtsPreference(enabled) {
  try {
    localStorage.setItem(VOICE_TTS_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function stripMarkdown(text) {
  return String(text || '')
    .replace(/^---+\s*/gm, '')
    .replace(/^##\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/•\s*/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Resposta curta e objetiva para TTS (academia / mãos ocupadas).
 * Mantém o texto completo na bolha; só o áudio é condensado.
 */
export function toSpokenAnswer(result) {
  if (!result) return ''

  const title = result.blocks?.title || ''
  const reason = result.blocks?.reason || ''
  const workout = result.blocks?.workout || result.relatedWorkout
  const care = Array.isArray(result.blocks?.careNotes) ? result.blocks.careNotes[0] : ''

  const parts = []
  if (title) parts.push(title)
  if (reason) parts.push(reason)
  if (workout?.name) {
    const mins = workout.estimatedMinutes || workout.estimatedDuration || 40
    parts.push(`Sugestão: ${workout.name}, cerca de ${mins} minutos.`)
  } else if (care) {
    parts.push(care)
  }

  let spoken = parts.filter(Boolean).join('. ')
  if (!spoken) {
    spoken = stripMarkdown(result.answer)
    // Remove rodapé longo de segurança do áudio
    spoken = spoken.replace(/Este plano é informativo[\s\S]*$/i, '').trim()
  }

  spoken = spoken.replace(/\s+/g, ' ').trim()
  if (spoken.length > 280) {
    spoken = `${spoken.slice(0, 277).replace(/[,:;.\s]+$/, '')}…`
  }
  return spoken
}

export function cancelSpeech() {
  if (!isSpeechSynthesisSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

/**
 * Fala texto em pt-BR. Retorna Promise que resolve ao terminar (ou falhar).
 */
export function speakText(text, { lang = 'pt-BR', rate = 1.05 } = {}) {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || !text) {
      resolve(false)
      return
    }
    cancelSpeech()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = rate
    utter.onend = () => resolve(true)
    utter.onerror = () => resolve(false)

    // Preferir voz pt-BR quando disponível
    try {
      const voices = window.speechSynthesis.getVoices?.() || []
      const pt = voices.find((v) => /^pt(-BR)?/i.test(v.lang)) || voices.find((v) => /pt/i.test(v.lang))
      if (pt) utter.voice = pt
    } catch {
      /* ignore */
    }

    window.speechSynthesis.speak(utter)
  })
}
