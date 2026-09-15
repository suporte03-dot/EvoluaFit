import { useCallback, useRef, useState } from 'react'
import useHoldToTalk from '../hooks/useHoldToTalk'
import { isSpeechSynthesisSupported, speakText } from '../utils/coachVoice'
import {
  parseFocusVoiceCommand,
  parseYesNo,
  plannedRepsFromExercise,
} from '../utils/voiceIntents'

export default function WorkoutVoiceBar({
  current,
  draft,
  onDraftChange,
  onCompleteSet,
  onSkipRest,
  onStartRest,
  onNextExercise,
  onSkipExercise,
  onPause,
  onResume,
  onFinish,
  onExit,
  onCancel,
  isPaused,
  restActive,
  disabled,
}) {
  const pendingRef = useRef(null)
  const transcriptRef = useRef(null)
  const [status, setStatus] = useState('Segure para falar: série feita, carga, reps, descanso.')
  const speak = isSpeechSynthesisSupported()

  const voice = useHoldToTalk({
    enabled: !disabled,
    onTranscript: (text) => transcriptRef.current?.(text),
  })

  const say = useCallback(
    (text) => {
      setStatus(text)
      if (speak && text) speakText(text, { rate: 1.08 })
    },
    [speak],
  )

  const runCommand = useCallback(
    (command) => {
      const slots = command.slots || {}
      switch (command.type) {
        case 'complete_set': {
          const weight = slots.weight != null ? String(slots.weight) : draft?.weight || ''
          const reps =
            slots.reps != null
              ? String(slots.reps)
              : draft?.reps || plannedRepsFromExercise(current)
          const nextDraft = { ...draft, weight, reps }
          onDraftChange?.(nextDraft)
          const nextOpen = current?.setSlots?.find((s) => !s.completed)
          if (!nextOpen) {
            say('Este exercício já está completo.')
            return
          }
          onCompleteSet?.(nextOpen.setNumber, nextDraft)
          say(
            `Série ${nextOpen.setNumber} registrada${weight ? `, ${weight} quilos` : ''}, ${reps} reps.`,
          )
          return
        }
        case 'set_weight':
          onDraftChange?.({ ...draft, weight: String(slots.weight) })
          say(command.spoken)
          return
        case 'set_reps':
          onDraftChange?.({ ...draft, reps: String(slots.reps) })
          say(command.spoken)
          return
        case 'skip_rest':
          onSkipRest?.()
          say(command.spoken)
          return
        case 'start_rest':
          onStartRest?.()
          say(command.spoken)
          return
        case 'next_exercise':
          onNextExercise?.()
          say(command.spoken)
          return
        case 'skip_exercise':
          onSkipExercise?.()
          say(command.spoken)
          return
        case 'pause':
          if (!isPaused) onPause?.()
          say(command.spoken)
          return
        case 'resume':
          if (isPaused) onResume?.()
          say(command.spoken)
          return
        case 'finish':
          onFinish?.()
          return
        case 'exit':
          onExit?.()
          return
        case 'cancel':
          onCancel?.()
          return
        default:
          say(command.spoken)
      }
    },
    [
      current,
      draft,
      isPaused,
      onCancel,
      onCompleteSet,
      onDraftChange,
      onExit,
      onFinish,
      onNextExercise,
      onPause,
      onResume,
      onSkipExercise,
      onSkipRest,
      onStartRest,
      say,
    ],
  )

  const handleTranscript = useCallback(
    (text) => {
      const pending = pendingRef.current
      if (pending) {
        const answer = parseYesNo(text)
        pendingRef.current = null
        if (answer === true) {
          runCommand({ ...pending, needsConfirm: false })
        } else if (answer === false) {
          say('Cancelado.')
        } else {
          say('Diga sim ou não.')
          pendingRef.current = pending
        }
        return
      }

      const command = parseFocusVoiceCommand(text)
      if (command.needsConfirm) {
        pendingRef.current = command
        say(command.spoken)
        return
      }
      runCommand(command)
    },
    [runCommand, say],
  )

  transcriptRef.current = (text) => {
    handleTranscript(text)
    window.setTimeout(() => voice.markIdle(), 80)
  }

  const errorLabel =
    voice.error === 'unsupported'
      ? 'Este navegador não reconhece fala. Use os botões.'
      : voice.error === 'permission'
        ? 'Permissão de microfone negada.'
        : voice.error === 'no-speech'
          ? 'Não captamos fala. Segure e tente de novo.'
          : voice.error === 'error'
            ? 'Falha no reconhecimento. Tente de novo.'
            : null

  const live =
    voice.voiceState === 'listening'
      ? voice.interimText || 'Ouvindo… solte para registrar.'
      : voice.voiceState === 'processing'
        ? 'Processando…'
        : errorLabel || status

  return (
    <div className="workout-voice">
      <button
        type="button"
        className={`workout-voice__hold${voice.voiceState === 'listening' ? ' is-listening' : ''}${
          !voice.supported ? ' is-unsupported' : ''
        }`}
        disabled={disabled || !voice.supported}
        onPointerDown={voice.onPressStart}
        onPointerUp={voice.onPressEnd}
        onPointerCancel={voice.onPressEnd}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Segure para falar o comando do treino"
      >
        {voice.voiceState === 'listening' ? 'Ouvindo… solte' : 'Segure para falar'}
      </button>
      <p className="workout-voice__status" role="status" aria-live="polite">
        {live}
        {restActive ? ' Descanso em andamento.' : ''}
      </p>
    </div>
  )
}
