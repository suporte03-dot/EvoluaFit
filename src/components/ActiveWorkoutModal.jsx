import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import {
  buildCompletionPayload,
  completeSetOnExercise,
  createSessionExercises,
  getSessionProgress,
  inferWorkoutType,
  parseRestFromExercise,
  restoreSessionExercises,
} from '../utils/workoutSession'
import {
  clearActiveSession,
  loadActiveSession,
  saveActiveSession,
} from '../utils/progressStorage'
import { appendExerciseToList, replaceExerciseInList } from '../utils/exerciseSubstitution'
import { summarizeDayVolume } from '../utils/workoutGenerator'
import DayVolumeSummary from './DayVolumeSummary'
import ExerciseSessionCard from './ExerciseSessionCard'
import ExerciseSubstitutionModal from './ExerciseSubstitutionModal'
import Modal from './Modal'
import RestTimer from './RestTimer'
import WorkoutProgressBar from './WorkoutProgressBar'
import WorkoutSummaryModal from './WorkoutSummaryModal'

const SAFETY_NOTE =
  'Priorize técnica e recuperação. Pare se sentir dor aguda e consulte um profissional se o desconforto persistir.'

function persistableExercises(list) {
  return (list || []).map((ex) => ({
    exerciseId: ex.exerciseId,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    sets: ex.sets,
    reps: ex.reps,
    restSeconds: ex.restSeconds,
    load: ex.load || '',
    movementType: ex.movementType,
    movementRoleLabel: ex.movementRoleLabel,
  }))
}

export default function ActiveWorkoutModal() {
  const {
    activeWorkout,
    setActiveWorkout,
    completeWorkout,
    updateWorkout,
    showToast,
    profile,
  } = useFitness()

  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState(-1)
  const [listOpen, setListOpen] = useState(false)
  const [sessionExercises, setSessionExercises] = useState([])
  const [drafts, setDrafts] = useState({})
  const [restTimer, setRestTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [substituteIndex, setSubstituteIndex] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [restDoneToast, setRestDoneToast] = useState(false)

  const isAdvanced = profile?.level === 'Avançado'
  const muscleOptions = useMemo(() => {
    const fromWorkout = activeWorkout?.muscleGroups || []
    const fromExercises = (sessionExercises.length ? sessionExercises : activeWorkout?.exercises || [])
      .map((ex) => ex.muscleGroup)
      .filter(Boolean)
    return [...new Set([...fromWorkout, ...fromExercises].filter(Boolean))]
  }, [activeWorkout, sessionExercises])

  const startTimeRef = useRef(Date.now())
  const pausedMsRef = useRef(0)
  const pauseStartedRef = useRef(null)
  const restoredRef = useRef(false)

  const isOpen = Boolean(activeWorkout) && !showSummary
  const workoutType = activeWorkout ? inferWorkoutType(activeWorkout) : ''
  const progress = getSessionProgress(sessionExercises)

  const persistSession = useCallback(
    (overrides = {}) => {
      if (!activeWorkout) return
      saveActiveSession({
        workoutId: activeWorkout.id,
        workoutName: activeWorkout.name,
        startedAt: startTimeRef.current,
        pausedMs: pausedMsRef.current,
        exerciseIndex,
        expandedIndex,
        sessionExercises,
        sessionNotes,
        restRemaining: restTimer,
        timerActive,
        drafts,
        ...overrides,
      })
    },
    [activeWorkout, exerciseIndex, expandedIndex, sessionExercises, sessionNotes, restTimer, timerActive, drafts],
  )

  // Init / restore session when workout starts
  useEffect(() => {
    if (!activeWorkout) {
      restoredRef.current = false
      return
    }

    const saved = loadActiveSession()
    const canRestore =
      saved &&
      saved.workoutId === activeWorkout.id &&
      Array.isArray(saved.sessionExercises) &&
      saved.sessionExercises.length > 0 &&
      !restoredRef.current

    if (canRestore) {
      restoredRef.current = true
      const restored = restoreSessionExercises(saved.sessionExercises)
      setSessionExercises(restored)
      setExerciseIndex(saved.exerciseIndex ?? 0)
      setExpandedIndex(saved.expandedIndex ?? -1)
      setListOpen(false)
      setSessionNotes(saved.sessionNotes || '')
      setDrafts(saved.drafts || {})
      startTimeRef.current = saved.startedAt || Date.now()
      pausedMsRef.current = saved.pausedMs || 0
      if (saved.timerActive && saved.restRemaining > 0) {
        setRestTimer(saved.restRemaining)
        setTimerActive(true)
      } else {
        setRestTimer(0)
        setTimerActive(false)
      }
      setIsPaused(false)
      setShowSummary(false)
      setPendingPayload(null)
      showToast('Sessão anterior restaurada.', 'info')
      return
    }

    restoredRef.current = true
    const exs = createSessionExercises(activeWorkout)
    setExerciseIndex(0)
    setExpandedIndex(0)
    setListOpen(false)
    setSessionExercises(exs)
    setDrafts({})
    setRestTimer(0)
    setTimerActive(false)
    setIsPaused(false)
    setSessionNotes('')
    setShowSummary(false)
    setPendingPayload(null)
    startTimeRef.current = Date.now()
    pausedMsRef.current = 0
    pauseStartedRef.current = null
    saveActiveSession({
      workoutId: activeWorkout.id,
      workoutName: activeWorkout.name,
      startedAt: startTimeRef.current,
      pausedMs: 0,
      exerciseIndex: 0,
      expandedIndex: 0,
      sessionExercises: exs,
      sessionNotes: '',
      restRemaining: 0,
      timerActive: false,
      drafts: {},
    })
  }, [activeWorkout?.id])

  // Autosave session
  useEffect(() => {
    if (!activeWorkout || showSummary) return
    if (!sessionExercises.length) return
    persistSession()
  }, [sessionExercises, exerciseIndex, expandedIndex, sessionNotes, restTimer, timerActive, drafts, activeWorkout, showSummary, persistSession])

  // Rest countdown
  useEffect(() => {
    if (!timerActive || restTimer <= 0 || isPaused) return undefined
    const interval = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          setTimerActive(false)
          setRestDoneToast(true)
          showToast('Descanso concluído. Próxima série pronta.', 'info')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, restTimer, isPaused, showToast])

  useEffect(() => {
    if (!restDoneToast) return undefined
    const t = setTimeout(() => setRestDoneToast(false), 2800)
    return () => clearTimeout(t)
  }, [restDoneToast])

  const handleClose = () => {
    if (window.confirm('Deseja sair do treino? O progresso desta sessão ficará salvo para continuar depois.')) {
      persistSession()
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

  const handleCompleteSet = (exIndex, setNumber, draft) => {
    if (!draft?.reps || isPaused) return

    const updated = sessionExercises.map((ex, i) => {
      if (i !== exIndex) return ex
      return completeSetOnExercise(ex, setNumber, {
        weight: draft.weight,
        reps: draft.reps,
      })
    })

    setSessionExercises(updated)

    const ex = updated[exIndex]
    const stillMore = (ex.completedSets || 0) < (ex.targetSets || ex.sets || 3)
    if (stillMore) {
      setRestTimer(parseRestFromExercise(ex))
      setTimerActive(true)
    }

    setExerciseIndex(getSessionProgress(updated).currentExerciseIndex)
    setExpandedIndex(getSessionProgress(updated).currentExerciseIndex)
    setDrafts((d) => ({
      ...d,
      [exIndex]: { weight: draft.weight, reps: '' },
    }))
  }

  const openSummary = (forcePartial = false) => {
    const pausedExtra = pauseStartedRef.current ? Date.now() - pauseStartedRef.current : 0
    const payload = buildCompletionPayload(
      activeWorkout,
      sessionExercises,
      startTimeRef.current,
      sessionNotes,
      pausedMsRef.current + pausedExtra,
    )
    if (forcePartial) payload.partial = true
    setPendingPayload(payload)
    setShowSummary(true)
  }

  const confirmFinish = () => {
    if (!pendingPayload || !activeWorkout) return
    completeWorkout(activeWorkout.id, pendingPayload)
    clearActiveSession()
    setShowSummary(false)
    setPendingPayload(null)
  }

  const handleSummaryClose = () => {
    setShowSummary(false)
    setPendingPayload(null)
  }

  const syncWorkoutExercises = (nextExercises) => {
    const clean = persistableExercises(nextExercises)
    const volumeSummary = summarizeDayVolume(
      clean,
      activeWorkout?.workoutType || activeWorkout?.name || '',
    ).text
    if (activeWorkout?.id) {
      updateWorkout(activeWorkout.id, { exercises: clean, volumeSummary })
    }
    setActiveWorkout((prev) => (prev ? { ...prev, exercises: clean, volumeSummary } : prev))
  }

  const handleSubstitute = (catalogEx) => {
    if (substituteIndex == null) return
    const nextExercises = replaceExerciseInList(sessionExercises, substituteIndex, catalogEx, true)
    setSessionExercises(nextExercises)
    setDrafts((d) => ({ ...d, [substituteIndex]: { weight: '', reps: '' } }))
    syncWorkoutExercises(nextExercises)
    setSubstituteIndex(null)
    showToast('Exercício substituído com sucesso!')
  }

  const handleAddExercise = (catalogEx) => {
    const nextExercises = appendExerciseToList(sessionExercises, catalogEx, { sets: 3, reps: '8-12' })
    setSessionExercises(nextExercises)
    syncWorkoutExercises(nextExercises)
    setShowAdd(false)
    setExpandedIndex(nextExercises.length - 1)
    showToast('Exercício adicionado ao treino!')
  }

  const skipRest = () => {
    setTimerActive(false)
    setRestTimer(0)
    setRestDoneToast(true)
    showToast('Descanso concluído. Próxima série pronta.', 'info')
  }

  const adjustRest = (delta) => {
    setRestTimer((t) => Math.max(0, t + delta))
  }

  if (!activeWorkout) return null

  const current = sessionExercises[exerciseIndex] || sessionExercises[expandedIndex]

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Treino em andamento"
        size="lg"
        className="active-workout-modal"
      >
        <div className={`workout-session workout-session--active ${isPaused ? 'workout-session--paused' : ''}`}>
          <div className="workout-session__topbar">
            <WorkoutProgressBar
              percent={progress.percent}
              completedSets={progress.completedSets}
              totalSets={progress.totalSets}
              currentExercise={current?.name || progress.currentExerciseName}
            />
            <div className="workout-session__top-actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={togglePause}>
                {isPaused ? 'Retomar' : 'Pausar'}
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => openSummary(false)}
                disabled={isPaused || progress.completedSets === 0}
              >
                Finalizar treino
              </button>
            </div>
          </div>

          <div className="workout-session__header">
            <div className="workout-session__meta">
              <h3 className="workout-session__name">{activeWorkout.name}</h3>
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

          {current && (
            <p className="workout-session__now">
              Agora: <strong>{current.name}</strong>
              {current.muscleGroup ? ` · ${current.muscleGroup}` : ''}
            </p>
          )}

          {timerActive && restTimer > 0 && (
            <RestTimer
              className="rest-timer--lg"
              seconds={restTimer}
              onSkip={skipRest}
              onAdjust={adjustRest}
              isPaused={isPaused}
              soundEnabled={false}
            />
          )}
          {restDoneToast && (
            <div className="rest-timer rest-timer--done rest-timer--lg" role="status">
              <div className="rest-timer__info">
                <span className="rest-timer__label">Pronto</span>
                <strong className="rest-timer__time">✓</strong>
              </div>
              <p className="rest-timer__done-msg">Descanso concluído. Próxima série pronta.</p>
            </div>
          )}

          {!listOpen && current && (
            <ExerciseSessionCard
              key={`focus-${current.exerciseId || current.name}-${exerciseIndex}`}
              exercise={current}
              index={exerciseIndex}
              isCurrent
              expanded={expandedIndex === exerciseIndex || expandedIndex < 0}
              onToggle={() =>
                setExpandedIndex((cur) => (cur === exerciseIndex || cur < 0 ? -2 : exerciseIndex))
              }
              draft={drafts[exerciseIndex] || { weight: '', reps: '' }}
              onDraftChange={(d) => setDrafts((prev) => ({ ...prev, [exerciseIndex]: d }))}
              onCompleteSet={(setNumber, draft) => handleCompleteSet(exerciseIndex, setNumber, draft)}
              onSubstitute={() => setSubstituteIndex(exerciseIndex)}
              disabled={isPaused}
            />
          )}

          <div className="workout-session__list-wrap">
            <button
              type="button"
              className={`disclose-toggle${listOpen ? ' is-open' : ''}`}
              onClick={() => setListOpen((o) => !o)}
              aria-expanded={listOpen}
            >
              <span>
                {listOpen
                  ? 'Ocultar lista'
                  : `Lista de exercícios (${sessionExercises.length})`}
              </span>
              <span aria-hidden="true">{listOpen ? '▲' : '▼'}</span>
            </button>

            {listOpen && (
              <div className="workout-session__exercise-list">
                {sessionExercises.map((ex, i) => (
                  <ExerciseSessionCard
                    key={`${ex.exerciseId || ex.name}-${i}`}
                    exercise={ex}
                    index={i}
                    isCurrent={i === exerciseIndex}
                    expanded={expandedIndex === i}
                    onToggle={() => {
                      setExerciseIndex(i)
                      setExpandedIndex((cur) => (cur === i ? -1 : i))
                    }}
                    draft={drafts[i] || { weight: '', reps: '' }}
                    onDraftChange={(d) => setDrafts((prev) => ({ ...prev, [i]: d }))}
                    onCompleteSet={(setNumber, draft) => handleCompleteSet(i, setNumber, draft)}
                    onSubstitute={() => setSubstituteIndex(i)}
                    disabled={isPaused}
                  />
                ))}
              </div>
            )}
          </div>

          {!sessionExercises.length && (
            <p className="empty-text">Este treino não possui exercícios cadastrados.</p>
          )}

          <DayVolumeSummary
            exercises={sessionExercises}
            dayType={workoutType || activeWorkout?.workoutType}
            volumeSummary={activeWorkout?.volumeSummary}
          />

          {isAdvanced && (
            <div className="workout-session__add-row">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setShowAdd(true)}
                disabled={isPaused}
              >
                Adicionar exercício
              </button>
            </div>
          )}

          <label className="form-field workout-session__notes">
            <span>Observações da sessão</span>
            <textarea
              rows={2}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Como foi o treino hoje?"
              disabled={isPaused}
            />
          </label>

          <p className="safety-note">{SAFETY_NOTE}</p>
        </div>
      </Modal>

      <WorkoutSummaryModal
        isOpen={showSummary}
        onClose={handleSummaryClose}
        onConfirm={confirmFinish}
        sessionData={pendingPayload}
        workoutName={activeWorkout.name}
      />

      <ExerciseSubstitutionModal
        isOpen={substituteIndex != null}
        onClose={() => setSubstituteIndex(null)}
        currentExercise={substituteIndex != null ? sessionExercises[substituteIndex] : null}
        onSelect={handleSubstitute}
      />

      <ExerciseSubstitutionModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        mode="add"
        muscleGroupOptions={muscleOptions.length ? muscleOptions : ['Peitoral', 'Ombros', 'Tríceps']}
        defaultMuscleGroup={muscleOptions[0] || 'Peitoral'}
        excludeIds={sessionExercises.map((ex) => ex.exerciseId).filter(Boolean)}
        onSelect={handleAddExercise}
      />
    </>
  )
}
