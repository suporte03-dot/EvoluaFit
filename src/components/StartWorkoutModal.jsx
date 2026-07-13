import { useEffect, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import {
  buildCompletionPayload,
  createSessionExercises,
  getExerciseProgressLabel,
  getSetProgressLabel,
  getTargetSets,
  inferWorkoutType,
  isExerciseComplete,
} from '../utils/workoutSession'
import ExerciseMedia from './ExerciseMedia'
import Modal from './Modal'
import RestTimer from './RestTimer'
import WorkoutSummaryModal from './WorkoutSummaryModal'

const SAFETY_MESSAGES = [
  'Pare imediatamente se sentir dor aguda. Consulte um profissional em caso de desconforto persistente.',
  'Mantenha a técnica correta — carga excessiva compromete a execução e aumenta risco de lesão.',
  'Hidrate-se durante o treino e respeite os intervalos de descanso.',
]

export default function StartWorkoutModal() {
  const { activeWorkout, setActiveWorkout, completeWorkout } = useFitness()

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [sessionExercises, setSessionExercises] = useState([])
  const [currentSet, setCurrentSet] = useState({ load: '', reps: '' })
  const [restTimer, setRestTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)

  const startTimeRef = useRef(Date.now())
  const pausedMsRef = useRef(0)
  const pauseStartedRef = useRef(null)

  const isOpen = Boolean(activeWorkout) && !showSummary
  const exercises = sessionExercises.length ? sessionExercises : activeWorkout?.exercises || []
  const current = exercises[exerciseIndex]
  const targetSets = current ? getTargetSets(current) : 3
  const completedSets = current?.setsLog?.length || 0
  const allSetsDone = current ? isExerciseComplete(current) : false
  const isLast = exerciseIndex >= exercises.length - 1
  const workoutType = activeWorkout ? inferWorkoutType(activeWorkout) : ''

  useEffect(() => {
    if (!activeWorkout) return
    const exs = createSessionExercises(activeWorkout)
    setExerciseIndex(0)
    setSessionExercises(exs)
    setCurrentSet({ load: exs[0]?.load || '', reps: '' })
    setRestTimer(0)
    setTimerActive(false)
    setIsPaused(false)
    setSessionNotes('')
    setShowSummary(false)
    setPendingPayload(null)
    startTimeRef.current = Date.now()
    pausedMsRef.current = 0
    pauseStartedRef.current = null
  }, [activeWorkout?.id])

  useEffect(() => {
    if (!timerActive || restTimer <= 0 || isPaused) return undefined
    const interval = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          setTimerActive(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, restTimer, isPaused])

  const handleClose = () => {
    if (window.confirm('Deseja sair do treino? O progresso desta sessão será perdido.')) {
      setActiveWorkout(null)
    }
  }

  const togglePause = () => {
    if (isPaused) {
      if (pauseStartedRef.current) {
        pausedMsRef.current += Date.now() - pauseStartedRef.current
        pauseStartedRef.current = null
      }
      setIsPaused(false)
    } else {
      pauseStartedRef.current = Date.now()
      setIsPaused(true)
    }
  }

  const completeSet = () => {
    if (!current || !currentSet.reps) return

    const newSet = { load: currentSet.load, reps: currentSet.reps, done: true }
    const updatedLog = [...(current.setsLog || []), newSet]

    setSessionExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              completedSets: updatedLog.length,
              load: newSet.load || ex.load,
              setsLog: updatedLog,
            }
          : ex,
      ),
    )

    if (updatedLog.length < targetSets) {
      setRestTimer(current.restSeconds || 60)
      setTimerActive(true)
      setCurrentSet({ load: newSet.load, reps: '' })
    }
  }

  const goToPreviousExercise = () => {
    if (exerciseIndex <= 0) return
    const prevIdx = exerciseIndex - 1
    const prev = exercises[prevIdx]
    setExerciseIndex(prevIdx)
    setCurrentSet({
      load: prev.setsLog?.length ? prev.setsLog[prev.setsLog.length - 1].load : prev.load || '',
      reps: '',
    })
    setTimerActive(false)
    setRestTimer(0)
  }

  const nextExercise = () => {
    if (exerciseIndex >= exercises.length - 1) return
    const nextIdx = exerciseIndex + 1
    const next = exercises[nextIdx]
    setExerciseIndex(nextIdx)
    setCurrentSet({ load: next?.load || '', reps: '' })
    setTimerActive(false)
    setRestTimer(0)
  }

  const updateExerciseNotes = (notes) => {
    setSessionExercises((prev) =>
      prev.map((ex, i) => (i === exerciseIndex ? { ...ex, notes } : ex)),
    )
  }

  const openSummary = () => {
    const pausedExtra = pauseStartedRef.current ? Date.now() - pauseStartedRef.current : 0
    const payload = buildCompletionPayload(
      activeWorkout,
      sessionExercises,
      startTimeRef.current,
      sessionNotes,
      pausedMsRef.current + pausedExtra,
    )
    setPendingPayload(payload)
    setShowSummary(true)
  }

  const confirmFinish = () => {
    if (!pendingPayload || !activeWorkout) return
    completeWorkout(activeWorkout.id, pendingPayload)
    setShowSummary(false)
    setPendingPayload(null)
  }

  const handleSummaryClose = () => {
    setShowSummary(false)
    setPendingPayload(null)
  }

  const skipRest = () => {
    setTimerActive(false)
    setRestTimer(0)
  }

  const adjustRest = (delta) => {
    setRestTimer((t) => Math.max(0, t + delta))
  }

  if (!activeWorkout) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={activeWorkout.name} size="lg" className="active-workout-modal">
        {current ? (
          <div className={`workout-session ${isPaused ? 'workout-session--paused' : ''}`}>
            <div className="workout-session__header">
              <div className="workout-session__meta">
                <span className="workout-session__type">{workoutType}</span>
                <div className="workout-session__muscles">
                  {activeWorkout.muscleGroups?.map((g) => (
                    <span key={g} className="muscle-tag muscle-tag--sm">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              {isPaused && (
                <span className="workout-session__pause-badge" role="status">
                  Treino pausado
                </span>
              )}
            </div>

            <div className="workout-session__progress">
              <span>{getExerciseProgressLabel(exerciseIndex, exercises.length)}</span>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${((exerciseIndex + 1) / exercises.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="workout-session__exercise workout-session__media">
              <ExerciseMedia exercise={current} aspectRatio="16/9" compact={false} lazy={false} />
              <h3>{current.name}</h3>
              <p>
                {current.muscleGroup} · Meta: {targetSets}x {current.reps} · Descanso {current.restSeconds || 60}s
              </p>
            </div>

            {!allSetsDone && (
              <div className="workout-session__sets workout-session__set-form">
                <p className="workout-session__set-label">{getSetProgressLabel(completedSets, targetSets)}</p>
                <div className="form-grid form-grid--2">
                  <label className="form-field">
                    <span>Carga</span>
                    <input
                      value={currentSet.load}
                      onChange={(e) => setCurrentSet((s) => ({ ...s, load: e.target.value }))}
                      placeholder="ex: 20kg"
                      disabled={isPaused}
                    />
                  </label>
                  <label className="form-field">
                    <span>Repetições</span>
                    <input
                      value={currentSet.reps}
                      onChange={(e) => setCurrentSet((s) => ({ ...s, reps: e.target.value }))}
                      placeholder="ex: 12"
                      disabled={isPaused}
                      inputMode="numeric"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn--primary workout-session__complete-set"
                  onClick={completeSet}
                  disabled={!currentSet.reps || isPaused}
                >
                  Concluir série
                </button>
              </div>
            )}

            {timerActive && restTimer > 0 && (
              <RestTimer
                seconds={restTimer}
                onSkip={skipRest}
                onAdjust={adjustRest}
                isPaused={isPaused}
              />
            )}

            {completedSets > 0 && (
              <ul className="sets-log">
                {current.setsLog.map((s, i) => (
                  <li key={i}>
                    Série {i + 1}: {s.load || '—'} × {s.reps} reps
                  </li>
                ))}
              </ul>
            )}

            <label className="form-field workout-session__notes">
              <span>Observações do exercício</span>
              <textarea
                rows={2}
                value={current.notes || ''}
                onChange={(e) => updateExerciseNotes(e.target.value)}
                placeholder="Anotações sobre execução, carga ou sensação..."
                disabled={isPaused}
              />
            </label>

            <label className="form-field workout-session__notes">
              <span>Observações gerais da sessão</span>
              <textarea
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Como foi o treino hoje?"
                disabled={isPaused}
              />
            </label>

            <div className="workout-session__toolbar">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={goToPreviousExercise}
                disabled={exerciseIndex === 0 || isPaused}
              >
                ← Exercício anterior
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={togglePause}>
                {isPaused ? 'Retomar' : 'Pausar'}
              </button>
            </div>

            <div className="workout-session__nav">
              {allSetsDone && !isLast && (
                <button type="button" className="btn btn--primary" onClick={nextExercise} disabled={isPaused}>
                  Próximo exercício →
                </button>
              )}
              {allSetsDone && isLast && (
                <button type="button" className="btn btn--primary btn--lg" onClick={openSummary} disabled={isPaused}>
                  Finalizar treino
                </button>
              )}
              {!allSetsDone && completedSets > 0 && !isLast && (
                <button type="button" className="btn btn--ghost" onClick={nextExercise} disabled={isPaused}>
                  Pular para próximo exercício
                </button>
              )}
            </div>

            <p className="safety-note">{SAFETY_MESSAGES[exerciseIndex % SAFETY_MESSAGES.length]}</p>
          </div>
        ) : (
          <p className="empty-text">Este treino não possui exercícios cadastrados.</p>
        )}
      </Modal>

      <WorkoutSummaryModal
        isOpen={showSummary}
        onClose={handleSummaryClose}
        onConfirm={confirmFinish}
        sessionData={pendingPayload}
        workoutName={activeWorkout.name}
      />
    </>
  )
}
