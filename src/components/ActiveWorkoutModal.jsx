import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useWorkoutSession } from '../context/WorkoutSessionContext'
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
    markWorkoutInProgress,
    refreshPendingSession,
    showToast,
    profile,
  } = useFitness()

  const {
    activeSession,
    startSession,
    saveSet,
    completeSession,
    cancelSession,
    conflictSession,
    setConflictSession,
    savingSetKey,
    syncPending,
    savingSession,
    sessionError,
  } = useWorkoutSession()

  const [setSaveStatus, setSetSaveStatus] = useState('')
  const [remoteReady, setRemoteReady] = useState(false)
  const [perceivedEffort, setPerceivedEffort] = useState('')
  const remoteStartRef = useRef(false)

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
  const [elapsedSec, setElapsedSec] = useState(0)
  const [loadNudgeShown, setLoadNudgeShown] = useState(false)

  const isAdvanced = profile?.level === 'Avançado'
  const canAddExercise = isAdvanced || sessionExercises.length === 0
  const markedPartialRef = useRef(false)
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
      markedPartialRef.current = false
      setLoadNudgeShown(false)
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

  useEffect(() => {
    if (!activeWorkout?.id) {
      remoteStartRef.current = false
      setRemoteReady(false)
      setPerceivedEffort('')
      return undefined
    }
    if (remoteStartRef.current) return undefined
    remoteStartRef.current = true

    let cancelled = false
    ;(async () => {
      const result = await startSession(activeWorkout)
      if (cancelled) return
      if (result?.error?.code === 'ACTIVE_SESSION_EXISTS') {
        setRemoteReady(false)
        return
      }
      if (result?.error) {
        showToast(result.error.message || 'Sessão na nuvem indisponível. Continuando localmente.', 'info')
      }
      setRemoteReady(true)
    })()

    return () => {
      cancelled = true
    }
  }, [activeWorkout?.id, activeWorkout, startSession, showToast])

  // Autosave session
  useEffect(() => {
    if (!activeWorkout || showSummary) return
    if (!sessionExercises.length) return
    persistSession()
  }, [sessionExercises, exerciseIndex, expandedIndex, sessionNotes, restTimer, timerActive, drafts, activeWorkout, showSummary, persistSession])

  // Elapsed session clock
  useEffect(() => {
    if (!activeWorkout || showSummary) return undefined
    const tick = () => {
      const pausedExtra = pauseStartedRef.current ? Date.now() - pauseStartedRef.current : 0
      const ms = Date.now() - startTimeRef.current - pausedMsRef.current - (isPaused ? pausedExtra : 0)
      setElapsedSec(Math.max(0, Math.floor(ms / 1000)))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeWorkout, showSummary, isPaused])

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
      window.setTimeout(() => refreshPendingSession?.(), 0)
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

    if (activeWorkout?.id && !markedPartialRef.current && activeWorkout.status !== 'Realizado') {
      markedPartialRef.current = true
      markWorkoutInProgress(activeWorkout.id)
    }

    const updated = sessionExercises.map((ex, i) => {
      if (i !== exIndex) return ex
      return completeSetOnExercise(ex, setNumber, {
        weight: draft.weight,
        reps: draft.reps,
      })
    })

    setSessionExercises(updated)

    const completedSets = getSessionProgress(updated).completedSets
    if (!loadNudgeShown && completedSets >= 2 && !String(draft.weight || '').trim()) {
      setLoadNudgeShown(true)
      showToast('Dica: registrar cargas alimenta sua evolução de volume.', 'info')
    }

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

    const exAfter = updated[exIndex]
    setSetSaveStatus('saving')
    saveSet({
      exerciseId: exAfter?.exerciseId || exAfter?.name,
      exercise_key: exAfter?.exerciseId || exAfter?.name || ('ex-' + exIndex),
      exercise_name: exAfter?.name || 'Exercício',
      exercise_order: exIndex,
      set_number: setNumber,
      planned_reps: exAfter?.reps || null,
      reps: draft.reps,
      weight: draft.weight,
      completed: true,
    }).then((result) => {
      if (result?.pending) {
        setSetSaveStatus('pending')
        showToast('Sincronização pendente', 'info')
      } else if (result?.error) {
        setSetSaveStatus('error')
      } else {
        setSetSaveStatus('saved')
        window.setTimeout(() => setSetSaveStatus(''), 1600)
      }
    })
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

  const confirmFinish = async () => {
    if (!pendingPayload || !activeWorkout) return
    const pausedExtra = pauseStartedRef.current ? Date.now() - pauseStartedRef.current : 0
    const durationSeconds = Math.max(
      0,
      Math.floor((Date.now() - startTimeRef.current - pausedMsRef.current - pausedExtra) / 1000),
    )

    for (let exIndex = 0; exIndex < sessionExercises.length; exIndex += 1) {
      const ex = sessionExercises[exIndex]
      for (const slot of ex.setSlots || []) {
        if (!slot?.completed) continue
        await saveSet({
          exercise_key: ex.exerciseId || ex.name || ('ex-' + exIndex),
          exercise_name: ex.name || 'Exercício',
          exercise_order: exIndex,
          set_number: slot.setNumber,
          planned_reps: ex.reps || null,
          reps: slot.reps,
          weight: slot.weight ?? slot.load,
          completed: true,
        })
      }
    }

    await completeSession({
      duration_seconds: durationSeconds,
      perceived_effort: perceivedEffort ? Number(perceivedEffort) : null,
      notes: pendingPayload.notes || sessionNotes || null,
      completed_at: pendingPayload.completedAt || new Date().toISOString(),
    })

    completeWorkout(activeWorkout.id, {
      ...pendingPayload,
      perceivedEffort: perceivedEffort ? Number(perceivedEffort) : null,
    })
    clearActiveSession()
    setShowSummary(false)
    setPendingPayload(null)
    setPerceivedEffort('')
    remoteStartRef.current = false
  }

  const handleCancelRemoteSession = async () => {
    const result = await cancelSession()
    if (result?.error?.code === 'ABORTED') return
    if (result?.error) {
      showToast(result.error.message || 'Não foi possível cancelar.', 'error')
      return
    }
    clearActiveSession()
    setActiveWorkout(null)
    remoteStartRef.current = false
    showToast('Treino cancelado.', 'info')
  }

  const handleConflictContinue = () => {
    const session = conflictSession
    setConflictSession(null)
    const snap = session?.workout_snapshot
    if (!snap) {
      showToast('Não foi possível continuar a sessão anterior.', 'error')
      setActiveWorkout(null)
      return
    }
    remoteStartRef.current = true
    setRemoteReady(true)
    setActiveWorkout({
      id: snap.id,
      name: snap.name || session.workout_name || 'Treino',
      exercises: snap.exercises || [],
      muscleGroups: snap.muscleGroups || [],
      planId: snap.planId,
      dayNumber: snap.dayNumber,
      estimatedMinutes: snap.estimatedMinutes,
      workoutType: snap.workoutType,
      status: 'Parcial',
    })
  }

  const handleConflictCancelPrevious = async () => {
    if (!conflictSession?.id) return
    const result = await cancelSession(conflictSession.id)
    if (result?.error?.code === 'ABORTED') return
    setConflictSession(null)
    if (activeWorkout) {
      remoteStartRef.current = false
      const retry = await startSession(activeWorkout, { force: true })
      if (retry?.error) {
        showToast(retry.error.message || 'Não foi possível iniciar.', 'error')
      } else {
        setRemoteReady(true)
        remoteStartRef.current = true
      }
    }
  }

  const handleSummaryClose = () => {
    if (
      !window.confirm(
        'Fechar sem salvar? O progresso da sessão continua disponível para retomar, mas este resumo não será gravado no histórico.',
      )
    ) {
      return
    }
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
  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:${String(elapsedSec % 60).padStart(2, '0')}`

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title=""
        size="lg"
        className="active-workout-modal active-workout-modal--focus"
      >
        <div className={`workout-session workout-session--active workout-session--focus ${isPaused ? 'workout-session--paused' : ''}`}>
          <header className="workout-session__session-header">
            <div className="workout-session__session-titles">
              <p className="workout-session__eyebrow">Modo foco</p>
              <h3 className="workout-session__name">{activeWorkout.name}</h3>
              <div className="workout-session__session-meta">
                <span className="workout-session__elapsed" aria-label={`Tempo decorrido ${elapsedLabel}`}>
                  {elapsedLabel}
                </span>
                <span className="workout-session__type">{workoutType}</span>
                <span>
                  {progress.completedSets}/{progress.totalSets} séries · {progress.percent}%
                </span>
              </div>
            </div>
            <button type="button" className="btn btn--ghost btn--sm workout-session__exit" onClick={handleClose}>
              Sair
            </button>
          </header>

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
              {progress.completedSets > 0 && progress.percent < 100 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => openSummary(true)}
                  disabled={isPaused}
                >
                  Salvar parcial
                </button>
              )}
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

          {isPaused && (
            <span className="workout-session__pause-badge" role="status">
              Treino pausado
            </span>
          )}

          <div className="workout-session__sync" role="status" aria-live="polite">
            {savingSession || setSaveStatus === 'saving' || savingSetKey ? (
              <span>Salvando...</span>
            ) : syncPending || setSaveStatus === 'pending' ? (
              <span className="workout-session__sync--pending">Sincronização pendente</span>
            ) : setSaveStatus === 'saved' ? (
              <span className="workout-session__sync--ok">Salvo</span>
            ) : sessionError ? (
              <span className="workout-session__sync--err">{sessionError}</span>
            ) : activeSession?.id ? (
              <span className="workout-session__sync--ok">Salvo</span>
            ) : activeSession?.client_id ? (
              <span className="workout-session__sync--pending">Sincronização pendente</span>
            ) : null}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={handleCancelRemoteSession}
              disabled={savingSession}
            >
              Cancelar treino
            </button>
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
              expanded={expandedIndex === exerciseIndex || expandedIndex === -1}
              onToggle={() =>
                setExpandedIndex((cur) =>
                  cur === exerciseIndex || cur === -1 ? -2 : exerciseIndex,
                )
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
            <div className="workout-session__empty">
              <p className="empty-text">Este treino não possui exercícios cadastrados.</p>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setShowAdd(true)}
                disabled={isPaused}
              >
                Adicionar exercício
              </button>
            </div>
          )}

          <DayVolumeSummary
            exercises={sessionExercises}
            dayType={workoutType || activeWorkout?.workoutType}
            volumeSummary={activeWorkout?.volumeSummary}
          />

          {canAddExercise && sessionExercises.length > 0 && (
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
        perceivedEffort={perceivedEffort}
        onPerceivedEffortChange={setPerceivedEffort}
      />

      <Modal
        isOpen={Boolean(conflictSession)}
        onClose={() => {
          setConflictSession(null)
          setActiveWorkout(null)
          remoteStartRef.current = false
        }}
        title="Treino em andamento"
        size="sm"
      >
        <div className="session-conflict">
          <p>
            Já existe uma sessão ativa
            {conflictSession?.workout_name ? `: ${conflictSession.workout_name}` : ''}.
          </p>
          <div className="session-conflict__actions">
            <button type="button" className="btn btn--primary" onClick={handleConflictContinue}>
              Continuar treino
            </button>
            <button type="button" className="btn btn--danger" onClick={handleConflictCancelPrevious}>
              Cancelar treino anterior
            </button>
          </div>
        </div>
      </Modal>

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
