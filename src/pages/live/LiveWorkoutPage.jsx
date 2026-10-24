import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFitness } from '../../context/FitnessContext'
import { useWorkoutSession } from '../../context/WorkoutSessionContext'
import { useSync } from '../../context/SyncContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { liveWorkoutPath } from '../../data/dashboardRoutes'
import Toast from '../../components/Toast'
import ExerciseMedia from '../../components/ExerciseMedia'
import { IconInfo } from '../../components/dashboard/icons'
import LiveHeader from '../../components/live/LiveHeader'
import ExerciseSegments from '../../components/live/ExerciseSegments'
import SuggestionCard from '../../components/live/SuggestionCard'
import SetTable from '../../components/live/SetTable'
import Stepper from '../../components/live/Stepper'
import LiveSheet from '../../components/live/LiveSheet'
import RestTimer from '../../components/live/RestTimer'
import PRCelebration from '../../components/live/PRCelebration'
import WorkoutSummary from '../../components/live/WorkoutSummary'
import PreWorkoutCheck, { adaptWorkoutForCheck } from '../../components/PreWorkoutCheck'
import { whyExerciseInWorkout } from '../../utils/exerciseWhy'
import {
  buildCompletionPayload,
  completeSetOnExercise,
  createSessionExercises,
  restoreSessionExercises,
} from '../../utils/workoutSession'
import {
  clearActiveSession,
  loadActiveSession,
  loadProgressHistory,
  saveActiveSession,
} from '../../utils/progressStorage'
import { displayWorkoutName } from '../../utils/trainingIdentity'
import { getWeeklyProgress } from '../../utils/todayWorkout'
import { getDashboardMetrics } from '../../utils/dashboardMetrics'
import { computeEvoluaScore } from '../../utils/evoluaScore'
import { isCompletedSession } from '../../utils/completedSession'
import { buildWeekStrip } from '../../utils/weeklyGoal'
import {
  formatLoad,
  isLowerBodyExercise,
  normalizeBeginnerReps,
  parseRepRange,
  suggestLoad,
} from '../../utils/liveWorkout/loadSuggestion.js'
import {
  bestLoadBySession,
  findRecord,
  isPersonalRecord,
  recordGainPct,
  weeksBetween,
} from '../../utils/liveWorkout/prDetection.js'
import {
  completedSetCount,
  formatClock,
  formatVolumeKg,
  sessionVolume,
  volumeByMuscle,
} from '../../utils/liveWorkout/volume.js'
import {
  extendRest,
  isRestDone,
  resolveRestSeconds,
  startRest,
} from '../../utils/liveWorkout/restTimer.js'
import {
  entriesForExercise,
  lastSessionSets,
  previousForSet,
} from '../../utils/liveWorkout/exerciseHistory.js'
import { loadLiveSettings, saveLiveSettings } from '../../utils/liveWorkout/settings.js'
import { coachRecommendation, nextScoreBand, xpGainForSession } from '../../utils/liveWorkout/sessionSummary.js'
import { renderStoryImage, shareStoryImage } from '../../utils/liveWorkout/storyImage.js'
import '../../styles/live-workout.css'

const REST_OPTIONS = [60, 90, 120, 180]
const UPPER_INCREMENTS = [1, 1.5, 2]

function num(value) {
  const n = parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function exerciseKey(ex, index) {
  return String(ex?.exerciseId || ex?.name || `ex-${index}`)
}

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
    osc.onended = () => ctx.close()
  } catch {
    /* áudio bloqueado pelo navegador */
  }
}

function prepareExercises(workout, level) {
  const normalized = {
    ...workout,
    exercises: (workout?.exercises || []).map((ex) => ({
      ...ex,
      reps: normalizeBeginnerReps(ex.reps, { level, strength: Boolean(ex.strength) }),
    })),
  }
  const originals = normalized.exercises
  return createSessionExercises(normalized).map((ex, i) => ({
    ...ex,
    liveRestSeconds: resolveRestSeconds(originals[i], null) ?? resolveRestSeconds({ rest: ex.rest }, null),
  }))
}

function withSlot(exercise, index, patch) {
  const setSlots = exercise.setSlots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
  const setsLog = setSlots.filter((s) => s.completed)
  return { ...exercise, setSlots, setsLog, completedSets: setsLog.length }
}

function syncCopy({ syncStatus, pendingCount, isLikelyOnline }) {
  if (!isLikelyOnline || syncStatus === 'offline') return { label: 'Offline · salvo no aparelho', tone: 'offline' }
  if (syncStatus === 'syncing') return { label: 'Sincronizando...', tone: 'pending' }
  if (syncStatus === 'error') return { label: 'Sincronização pendente', tone: 'pending' }
  if (pendingCount > 0) return { label: `${pendingCount} pendente${pendingCount === 1 ? '' : 's'}`, tone: 'pending' }
  return { label: 'Tudo sincronizado', tone: 'ok' }
}

export default function LiveWorkoutPage() {
  const { treinoId } = useParams()
  const navigate = useNavigate()
  const {
    activeWorkout,
    setActiveWorkout,
    workouts,
    history,
    profile,
    goals,
    plans,
    generatedPlan,
    performance,
    toasts,
    showToast,
    completeWorkout,
    markWorkoutInProgress,
    resumePendingSession,
  } = useFitness()
  const { activeSession, sessionSets, startSession, saveSet, completeSession, cancelSession, conflictSession, setConflictSession } =
    useWorkoutSession()
  const sync = useSync()

  const [workout, setWorkout] = useState(null)
  const [status, setStatus] = useState('loading')
  const [exercises, setExercises] = useState([])
  const [exIdx, setExIdx] = useState(0)
  const [editingIndex, setEditingIndex] = useState(null)
  const [draft, setDraft] = useState({ weight: 0, reps: 0 })
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [rest, setRest] = useState(null)
  const [prShown, setPrShown] = useState([])
  const [prs, setPrs] = useState([])
  const [activePR, setActivePR] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [settings, setSettings] = useState(loadLiveSettings)
  const [announcement, setAnnouncement] = useState('')
  const [localConflict, setLocalConflict] = useState(null)
  const [summary, setSummary] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [sharing, setSharing] = useState(false)

  const historyRef = useRef([])
  const initRef = useRef(false)
  const remoteStartedRef = useRef(false)
  const forceRemoteRef = useRef(false)
  const hydrateRemoteRef = useRef(false)
  const markedRef = useRef(false)

  useDocumentTitle(workout ? `Ao vivo · ${displayWorkoutName(workout.name)}` : 'Treino ao vivo')

  // Saiu da rota (voltar do navegador, link): libera o treino ativo; o rascunho continua salvo.
  useEffect(
    () => () => {
      setActiveWorkout((prev) => (prev && String(prev.id) === String(treinoId) ? null : prev))
    },
    [setActiveWorkout, treinoId],
  )

  // Resolve o treino da rota: estado global → planilha → rascunho local.
  useEffect(() => {
    if (workout) return
    if (activeWorkout) {
      if (String(activeWorkout.id) !== String(treinoId)) {
        navigate(liveWorkoutPath(activeWorkout.id), { replace: true })
        return
      }
      setWorkout(activeWorkout)
      return
    }
    const found = (workouts || []).find((w) => String(w.id) === String(treinoId))
    if (found) {
      setActiveWorkout(found)
      return
    }
    const saved = loadActiveSession()
    if (saved?.workoutId && String(saved.workoutId) === String(treinoId) && saved.sessionExercises?.length) {
      setActiveWorkout({
        id: saved.workoutId,
        name: saved.workoutName || 'Treino',
        exercises: saved.sessionExercises.map((ex) => ({ ...ex })),
        status: 'Parcial',
      })
      return
    }
    setStatus('missing')
  }, [workout, activeWorkout, workouts, treinoId, navigate, setActiveWorkout])

  const startFresh = useCallback(
    (target) => {
      setExercises(prepareExercises(target, profile?.level))
      setExIdx(0)
      setStartedAt(Date.now())
      setPrShown([])
      setPrs([])
      setRest(null)
      setStatus('ready')
    },
    [profile?.level],
  )

  useEffect(() => {
    if (!workout || initRef.current) return
    initRef.current = true
    historyRef.current = loadProgressHistory()
    const saved = loadActiveSession()
    const sameWorkout = saved?.workoutId && String(saved.workoutId) === String(workout.id)
    if (sameWorkout && saved.sessionExercises?.length) {
      setExercises(restoreSessionExercises(saved.sessionExercises))
      setExIdx(Math.min(saved.exerciseIndex || 0, saved.sessionExercises.length - 1))
      setStartedAt(saved.startedAt || Date.now())
      setPrShown(saved.prShown || [])
      setPrs(saved.prs || [])
      if (saved.rest && !isRestDone(saved.rest)) setRest(saved.rest)
      setStatus('ready')
      return
    }
    const otherHasSets = saved?.workoutId && (saved.sessionExercises || []).some((ex) => ex.completedSets > 0)
    if (otherHasSets) {
      setLocalConflict(saved)
      setStatus('resume-prompt')
      return
    }
    setStatus('prep')
  }, [workout])

  // Sessão na nuvem (com fila offline). Conflito remoto abre o prompt de retomada.
  useEffect(() => {
    if (status !== 'ready' || !workout || remoteStartedRef.current) return
    remoteStartedRef.current = true
    const force = forceRemoteRef.current
    forceRemoteRef.current = false
    startSession(workout, force ? { force: true } : {}).then((result) => {
      if (result?.error?.code === 'ACTIVE_SESSION_EXISTS') return
      if (result?.resumed) hydrateRemoteRef.current = true
      if (result?.error) {
        showToast(result.error.message || 'Sessão na nuvem indisponível. Continuando localmente.', 'info')
      }
    })
  }, [status, workout, startSession, showToast])

  // Sessão retomada de outro aparelho: preenche as séries que já estão na nuvem.
  useEffect(() => {
    if (!hydrateRemoteRef.current || !sessionSets?.length || !exercises.length) return
    hydrateRemoteRef.current = false
    if (completedSetCount(exercises) > 0) return
    setExercises((prev) =>
      prev.map((ex, exOrder) => {
        let next = ex
        sessionSets
          .filter((s) => Number(s.exercise_order) === exOrder && s.completed)
          .forEach((s) => {
            const idx = Number(s.set_number) - 1
            if (idx < 0 || idx >= next.setSlots.length) return
            next = withSlot(next, idx, {
              weight: String(s.weight ?? ''),
              load: String(s.weight ?? ''),
              reps: String(s.repetitions ?? ''),
              completed: true,
              done: true,
              completedAt: s.updated_at || new Date().toISOString(),
              isPR: s.notes === 'Recorde pessoal',
            })
          })
        return next
      }),
    )
  }, [sessionSets, exercises])

  // Relógio: 1 s normalmente, 250 ms durante o descanso para o anel ficar suave.
  useEffect(() => {
    if (status !== 'ready') return undefined
    const id = window.setInterval(() => setNow(Date.now()), rest ? 250 : 1000)
    return () => window.clearInterval(id)
  }, [status, rest])

  // Rascunho local para retomar o treino (mesmo formato lido pelo banner de retomada).
  useEffect(() => {
    if (status !== 'ready' || !workout || !exercises.length) return
    saveActiveSession({
      workoutId: workout.id,
      workoutName: workout.name,
      startedAt,
      pausedMs: 0,
      exerciseIndex: exIdx,
      expandedIndex: exIdx,
      sessionExercises: exercises,
      sessionNotes: '',
      restRemaining: 0,
      timerActive: false,
      drafts: {},
      prShown,
      prs,
      rest,
    })
  }, [status, workout, exercises, exIdx, startedAt, prShown, prs, rest])

  const current = exercises[exIdx] || null
  const slots = current?.setSlots || []
  const activeIndex = slots.findIndex((s) => !s.completed)
  const exerciseDone = Boolean(current) && activeIndex === -1
  const allDone = exercises.length > 0 && exercises.every((ex) => ex.setSlots.every((s) => s.completed))

  const exerciseHistory = useMemo(() => {
    if (!current) return { entries: [], lastSets: [], record: null, repRange: null, suggestion: null }
    const entries = entriesForExercise(historyRef.current, current)
    const lastSets = lastSessionSets(entries)
    const repRange = parseRepRange(current.reps)
    return {
      entries,
      lastSets,
      record: findRecord(entries),
      repRange,
      suggestion: suggestLoad({
        lastSets,
        repRange,
        lowerBody: isLowerBodyExercise(current),
        upperIncrementKg: settings.upperIncrementKg,
      }),
    }
    // Recalcula ao trocar de exercício ou de incremento; séries novas não mudam a sugestão do dia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.exerciseId, current?.name, current?.reps, settings.upperIncrementKg, status])

  // Valores iniciais dos steppers para a série ativa (ou a série em edição).
  useEffect(() => {
    if (!current) return
    if (editingIndex != null) {
      const slot = slots[editingIndex]
      setDraft({ weight: num(slot?.weight), reps: num(slot?.reps) })
      return
    }
    if (activeIndex < 0) return
    const prevInSession = [...slots.slice(0, activeIndex)].reverse().find((s) => s.completed)
    if (prevInSession) {
      setDraft({ weight: num(prevInSession.weight), reps: num(prevInSession.reps) })
      return
    }
    const { suggestion, lastSets, repRange } = exerciseHistory
    const prevHist = previousForSet(lastSets, activeIndex + 1)
    const weight = suggestion?.loadKg ?? prevHist?.weight ?? 0
    const reps = suggestion?.kind === 'increase' ? repRange?.min : prevHist?.reps || repRange?.max
    setDraft({ weight: weight || 0, reps: reps || 10 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIdx, activeIndex, editingIndex, exerciseHistory])

  const finishRest = useCallback(
    (natural) => {
      setRest(null)
      if (natural) {
        navigator.vibrate?.([220, 120, 220])
        if (settings.sound) playBeep()
        setAnnouncement('Descanso concluído. Próxima série pronta.')
      } else {
        setAnnouncement('Descanso encerrado.')
      }
    },
    [settings.sound],
  )

  useEffect(() => {
    if (rest && now >= rest.endsAt) finishRest(true)
  }, [now, rest, finishRest])

  const updateSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveLiveSettings(next)
      return next
    })
  }

  const persistSet = (exercise, order, slot) => {
    saveSet({
      exercise_key: exercise.exerciseId || exercise.name || `ex-${order}`,
      exercise_name: exercise.name || 'Exercício',
      exercise_order: order,
      set_number: slot.setNumber,
      planned_reps: exercise.reps || null,
      reps: slot.reps,
      weight: slot.weight,
      completed: true,
      notes: slot.isPR ? 'Recorde pessoal' : null,
    }).then((result) => {
      if (result?.error && !result.pending) {
        showToast('Série salva no aparelho. Vamos sincronizar quando a conexão voltar.', 'info')
      }
    })
  }

  const nextLabelFor = (exercisesList, index) => {
    const ex = exercisesList[index]
    const nextSetIdx = ex.setSlots.findIndex((s) => !s.completed)
    if (nextSetIdx >= 0) {
      return `Série ${nextSetIdx + 1} · ${formatLoad(draft.weight)} kg × ${draft.reps}`
    }
    const nextEx = exercisesList.find((e, i) => i > index && e.setSlots.some((s) => !s.completed))
    return nextEx ? nextEx.name : ''
  }

  const completeSet = () => {
    if (!current || activeIndex < 0) return
    const weight = num(draft.weight)
    const reps = Math.round(num(draft.reps))
    if (reps <= 0) {
      showToast('Informe as repetições da série.', 'info')
      return
    }

    if (!markedRef.current && workout?.status !== 'Realizado') {
      markedRef.current = true
      markWorkoutInProgress(workout.id)
    }

    const { record, entries } = exerciseHistory
    const sessionSetsDone = slots.filter((s) => s.completed).map((s) => ({ weight: num(s.weight), reps: num(s.reps) }))
    const recordToBeat = record ? findRecord([record, ...sessionSetsDone]) : null
    const isPR = isPersonalRecord({ weight, reps }, recordToBeat)

    const base = completeSetOnExercise(current, activeIndex + 1, { weight: String(weight), reps: String(reps) })
    const updatedExercise = withSlot(base, activeIndex, { isPR })
    const nextExercises = exercises.map((ex, i) => (i === exIdx ? updatedExercise : ex))
    setExercises(nextExercises)
    persistSet(updatedExercise, exIdx, updatedExercise.setSlots[activeIndex])
    setAnnouncement(`Série ${activeIndex + 1} concluída: ${formatLoad(weight)} quilos, ${reps} repetições.`)

    if (isPR) {
      const key = exerciseKey(current, exIdx)
      const pr = {
        key,
        exerciseName: current.name,
        muscleGroup: current.muscleGroup || current.category || '',
        before: { weight: recordToBeat.weight, reps: recordToBeat.reps },
        after: { weight, reps },
        gainPct: recordGainPct(record, { weight }),
        weeks: weeksBetween(record.date),
        series: [...bestLoadBySession(entries, 3), { date: new Date().toISOString().slice(0, 10), weight }],
      }
      setPrs((prev) => [...prev.filter((p) => p.key !== key), pr])
      if (!prShown.includes(key)) {
        setPrShown((prev) => [...prev, key])
        setActivePR(pr)
      }
    }

    const workoutComplete = nextExercises.every((ex) => ex.setSlots.every((s) => s.completed))
    if (!workoutComplete) {
      const seconds = updatedExercise.liveRestSeconds || settings.restSeconds
      setRest(startRest(seconds))
      setNow(Date.now())
    }
  }

  const saveEdit = () => {
    if (editingIndex == null || !current) return
    const weight = num(draft.weight)
    const reps = Math.round(num(draft.reps))
    if (reps <= 0) {
      showToast('Informe as repetições da série.', 'info')
      return
    }
    const { record } = exerciseHistory
    const otherSets = slots
      .filter((s, i) => s.completed && i !== editingIndex)
      .map((s) => ({ weight: num(s.weight), reps: num(s.reps) }))
    const recordToBeat = record ? findRecord([record, ...otherSets]) : null
    const isPR = isPersonalRecord({ weight, reps }, recordToBeat)
    const updatedExercise = withSlot(current, editingIndex, {
      weight: String(weight),
      load: String(weight),
      reps: String(reps),
      isPR,
    })
    setExercises((prev) => prev.map((ex, i) => (i === exIdx ? updatedExercise : ex)))
    persistSet(updatedExercise, exIdx, updatedExercise.setSlots[editingIndex])
    setAnnouncement(`Série ${editingIndex + 1} atualizada.`)
    setEditingIndex(null)
  }

  const goToNextExercise = () => {
    const after = exercises.findIndex((ex, i) => i > exIdx && ex.setSlots.some((s) => !s.completed))
    const any = exercises.findIndex((ex) => ex.setSlots.some((s) => !s.completed))
    const target = after >= 0 ? after : any
    if (target >= 0) {
      setEditingIndex(null)
      setExIdx(target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const leaveToHome = () => {
    setActiveWorkout(null)
    navigate('/app')
  }

  const handleExit = async () => {
    if (completedSetCount(exercises) > 0) {
      setSheet('exit')
      return
    }
    clearActiveSession()
    if (activeSession) await cancelSession(undefined, { skipConfirm: true })
    leaveToHome()
  }

  const discardWorkout = async () => {
    setSheet(null)
    setConfirmDiscard(false)
    setRest(null)
    clearActiveSession()
    if (activeSession) await cancelSession(undefined, { skipConfirm: true })
    showToast('Treino descartado.', 'info')
    leaveToHome()
  }

  const finishWorkout = async () => {
    if (finishing || !workout) return
    const setsDone = completedSetCount(exercises)
    if (!setsDone) {
      showToast('Conclua ao menos uma série para finalizar.', 'info')
      return
    }
    setFinishing(true)
    setSheet(null)
    setRest(null)

    const durationSec = Math.max(1, Math.floor((Date.now() - startedAt) / 1000))
    const volumeKg = sessionVolume(exercises)
    const payload = buildCompletionPayload(workout, exercises, startedAt, '', 0)
    payload.volume = volumeKg
    payload.prCount = prs.length

    const weeklyBefore = getWeeklyProgress({ workouts, history, profile, goals, generatedPlan, plans })
    const isFirstWorkout = !(history || []).some(isCompletedSession)

    try {
      await completeSession({
        duration_seconds: durationSec,
        perceived_effort: null,
        notes: null,
        completed_at: payload.completedAt,
      })
    } catch {
      /* a fila offline já guardou a sessão; segue para o resumo */
    }

    completeWorkout(workout.id, payload)
    clearActiveSession()
    setSummary({
      workoutName: displayWorkoutName(workout.name),
      completedAt: payload.completedAt,
      durationSec,
      volumeKg,
      setsDone,
      setsTotal: exercises.reduce((sum, ex) => sum + ex.setSlots.length, 0),
      prs,
      muscles: volumeByMuscle(exercises),
      isFirstWorkout,
      beforeWeekDone: weeklyBefore.completedCount,
      coachText: coachRecommendation({ exercises, prs }),
    })
    setStatus('summary')
    setFinishing(false)
    window.scrollTo(0, 0)
  }

  const summaryView = useMemo(() => {
    if (!summary) return null
    const weekly = getWeeklyProgress({ workouts, history, profile, goals, generatedPlan, plans })
    const trainedDates = (history || []).filter(isCompletedSession).map((h) => h.completedAt || h.date)
    const weeklyGoalReached =
      weekly.weeklyGoal > 0 && summary.beforeWeekDone < weekly.weeklyGoal && weekly.completedCount >= weekly.weeklyGoal
    return {
      ...summary,
      weekStrip: buildWeekStrip([...trainedDates, summary.completedAt]),
      weekDone: weekly.completedCount,
      weeklyGoal: weekly.weeklyGoal,
      xp: xpGainForSession({
        isFirstWorkout: summary.isFirstWorkout,
        prCount: summary.prs.length,
        weeklyGoalReached,
      }),
    }
  }, [summary, workouts, history, profile, goals, generatedPlan, plans])

  const score = useMemo(() => {
    if (!summary) return null
    return computeEvoluaScore(getDashboardMetrics({ profile, workouts, history, goals, performance, generatedPlan }))
  }, [summary, profile, workouts, history, goals, performance, generatedPlan])

  const shareImage = async (data, text) => {
    setSharing(true)
    try {
      const blob = await renderStoryImage(data)
      const result = await shareStoryImage(blob, { text })
      if (result === 'downloaded') showToast('Imagem salva. É só publicar no seu story.', 'info')
      if (result === 'error') showToast('Não foi possível gerar a imagem agora.', 'error')
    } finally {
      setSharing(false)
    }
  }

  const shareSummary = () => {
    if (!summaryView) return
    const topPR = summaryView.prs[0]
    shareImage(
      {
        kicker: 'Treino concluído',
        title: summaryView.workoutName,
        dateLabel: new Date(summaryView.completedAt).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        }),
        highlight: topPR
          ? {
              kicker: 'Novo recorde pessoal',
              title: topPR.exerciseName,
              value: `${formatLoad(topPR.after.weight)} kg × ${topPR.after.reps}`,
            }
          : null,
        stats: [
          { label: 'Duração', value: formatClock(summaryView.durationSec) },
          { label: 'Volume', value: formatVolumeKg(summaryView.volumeKg) },
          { label: 'Séries', value: String(summaryView.setsDone) },
          { label: 'Recordes', value: String(summaryView.prs.length) },
        ],
      },
      `Treino concluído no EvoluaFit: ${summaryView.workoutName}`,
    )
  }

  const sharePR = (pr) => {
    shareImage(
      {
        kicker: 'Novo recorde pessoal',
        title: pr.exerciseName,
        dateLabel: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
        highlight: {
          kicker: 'Recorde de carga',
          title: pr.exerciseName,
          value: `${formatLoad(pr.after.weight)} kg × ${pr.after.reps}`,
        },
        stats: [
          { label: 'Antes', value: `${formatLoad(pr.before.weight)} kg` },
          { label: 'Agora', value: `${formatLoad(pr.after.weight)} kg` },
          { label: 'Ganho', value: pr.gainPct > 0 ? `+${pr.gainPct}%` : '—' },
          { label: 'Período', value: pr.weeks ? `${pr.weeks} sem` : '—' },
        ],
      },
      `Novo recorde no EvoluaFit: ${pr.exerciseName}`,
    )
  }

  // Prompt "treino em andamento": rascunho local de outro treino ou sessão ativa na nuvem.
  const resumePrompt = localConflict
    ? {
        name: localConflict.workoutName || 'Treino',
        detail: `${(localConflict.sessionExercises || []).reduce((s, ex) => s + (ex.completedSets || 0), 0)} séries registradas`,
        onContinue: () => {
          setLocalConflict(null)
          resumePendingSession()
          navigate(liveWorkoutPath(localConflict.workoutId), { replace: true })
        },
        onDiscard: () => {
          clearActiveSession()
          setLocalConflict(null)
          forceRemoteRef.current = true
          setStatus('prep')
        },
      }
    : conflictSession && status === 'ready'
      ? {
          name: conflictSession.workout_name || 'Treino',
          detail: 'Sessão aberta em outro momento ou aparelho',
          onContinue: () => {
            const snap = conflictSession.workout_snapshot
            setConflictSession(null)
            if (!snap?.id) {
              showToast('Não foi possível abrir a sessão anterior.', 'error')
              return
            }
            setActiveWorkout({
              id: snap.id,
              name: snap.name || conflictSession.workout_name || 'Treino',
              exercises: snap.exercises || [],
              muscleGroups: snap.muscleGroups || [],
              planId: snap.planId,
              dayNumber: snap.dayNumber,
              status: 'Parcial',
            })
            navigate(liveWorkoutPath(snap.id), { replace: true })
          },
          onDiscard: async () => {
            const result = await startSession(workout, { force: true })
            if (result?.error) showToast(result.error.message || 'Não foi possível iniciar.', 'error')
          },
        }
      : null

  if (status === 'missing') {
    return (
      <div className="live-root live-page">
        <div className="live-empty">
          <h1 className="live-empty__title">Treino não encontrado</h1>
          <p className="live-empty__text">Esse treino não está mais na sua planilha. Escolha outro para começar.</p>
          <button type="button" className="live-btn live-btn--primary live-btn--block" onClick={() => navigate('/app')}>
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  if (status === 'summary' && summaryView) {
    return (
      <div className="live-root live-page">
        <WorkoutSummary
          summary={summaryView}
          score={score}
          scoreGap={score ? nextScoreBand(score.value) : null}
          onShare={shareSummary}
          onHome={() => navigate('/app')}
          sharing={sharing}
        />
        <Toast toasts={toasts} />
      </div>
    )
  }

  const elapsedSec = Math.max(0, Math.floor((now - startedAt) / 1000))
  const syncInfo = syncCopy(sync)
  const restSec = current?.liveRestSeconds || settings.restSeconds
  const muscles = current?.muscles?.length ? current.muscles.join(' · ') : current?.muscleGroup || current?.category || ''

  let cta = null
  if (current) {
    if (editingIndex != null) cta = { label: `Salvar série ${editingIndex + 1}`, onClick: saveEdit }
    else if (!exerciseDone) cta = { label: `Concluir série ${activeIndex + 1}`, onClick: completeSet }
    else if (!allDone) cta = { label: 'Próximo exercício →', onClick: goToNextExercise }
    else cta = { label: finishing ? 'Finalizando...' : 'Finalizar treino', onClick: finishWorkout }
  }

  return (
    <div className="live-root live-page">
      <LiveHeader
        elapsedSec={elapsedSec}
        syncLabel={status === 'ready' ? syncInfo.label : ''}
        syncTone={syncInfo.tone}
        onExit={handleExit}
        onMore={() => setSheet('more')}
      />

      {status === 'ready' && exercises.length > 0 ? (
        <ExerciseSegments
          exercises={exercises}
          currentIndex={exIdx}
          onSelect={(index) => {
            setEditingIndex(null)
            setExIdx(index)
          }}
        />
      ) : null}

      <main className="live-main" id="live-main">
        {status === 'loading' || status === 'resume-prompt' ? (
          <p className="live-loading" role="status">
            Preparando seu treino...
          </p>
        ) : null}

        {status === 'prep' && workout ? (
          <div className="live-card live-prep">
            <PreWorkoutCheck
              workout={workout}
              onSkip={() => startFresh(workout)}
              onConfirm={(check) => {
                const adjusted = check.sleep === 'poor' ? { ...check, minutes: Math.min(check.minutes, 45) } : check
                const adapted = adaptWorkoutForCheck(workout, adjusted)
                startFresh(adapted?.exercises?.length ? adapted : workout)
                if (check.sleep === 'poor') showToast('Sono curto: volume um pouco menor hoje.', 'info')
                if (check.pain) showToast('Evitei o grupo com dor nesta sessão.', 'info')
              }}
            />
          </div>
        ) : null}

        {status === 'ready' && !exercises.length ? (
          <div className="live-empty">
            <h1 className="live-empty__title">Treino sem exercícios</h1>
            <p className="live-empty__text">Adicione exercícios na planilha para registrar este treino.</p>
            <button type="button" className="live-btn live-btn--primary live-btn--block" onClick={leaveToHome}>
              Voltar ao início
            </button>
          </div>
        ) : null}

        {status === 'ready' && current ? (
          <>
            <div className="live-media">
              <ExerciseMedia exercise={current} lazy={false} fit="contain" />
              <span className="live-media__badge">
                Exercício {exIdx + 1} de {exercises.length}
              </span>
              <button type="button" className="live-media__tips" onClick={() => setSheet('tips')}>
                <IconInfo size={18} />
                Dicas
              </button>
            </div>

            <section className="live-exercise" aria-labelledby="live-exercise-name">
              <h1 id="live-exercise-name" className="live-exercise__name">
                {current.name}
              </h1>
              {muscles ? <p className="live-exercise__muscles">{muscles}</p> : null}
              <p className="live-exercise__rx">
                {slots.length} {slots.length === 1 ? 'série' : 'séries'}
                {current.reps ? ` · ${current.reps} reps` : ''} · descanso {restSec} s
              </p>
            </section>

            <SuggestionCard suggestion={exerciseHistory.suggestion} />

            <SetTable
              slots={slots}
              lastSets={exerciseHistory.lastSets}
              activeIndex={activeIndex}
              editingIndex={editingIndex}
              draft={draft}
              onEdit={(index) => setEditingIndex(index)}
              onComplete={completeSet}
            />

            {editingIndex != null || activeIndex >= 0 ? (
              <section className="live-card live-steppers" aria-label={editingIndex != null ? `Editando série ${editingIndex + 1}` : `Série ${activeIndex + 1}`}>
                <Stepper
                  id="live-kg"
                  label="Carga"
                  unit="kg"
                  value={draft.weight}
                  step={2.5}
                  decimals={1}
                  max={500}
                  onChange={(weight) => setDraft((d) => ({ ...d, weight }))}
                />
                <Stepper
                  id="live-reps"
                  label="Repetições"
                  value={draft.reps}
                  step={1}
                  min={0}
                  max={100}
                  onChange={(reps) => setDraft((d) => ({ ...d, reps }))}
                />
                {editingIndex != null ? (
                  <button type="button" className="live-link" onClick={() => setEditingIndex(null)}>
                    Cancelar edição
                  </button>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </main>

      {status === 'ready' && cta ? (
        <div className="live-footer">
          <button type="button" className="live-btn live-btn--primary live-btn--block live-btn--lg" onClick={cta.onClick} disabled={finishing}>
            {cta.label}
          </button>
        </div>
      ) : null}

      <p className="live-sr-only" role="status" aria-live="assertive">
        {announcement}
      </p>

      {rest && status === 'ready' && !activePR ? (
        <RestTimer
          rest={rest}
          now={now}
          nextLabel={current ? nextLabelFor(exercises, exIdx) : ''}
          onAdd={(seconds) => setRest((r) => extendRest(r, seconds))}
          onSkip={() => finishRest(false)}
        />
      ) : null}

      {activePR ? (
        <PRCelebration pr={activePR} onShare={() => sharePR(activePR)} onContinue={() => setActivePR(null)} />
      ) : null}

      <LiveSheet open={sheet === 'tips'} title={current ? `Dicas · ${current.name}` : 'Dicas'} onClose={() => setSheet(null)}>
        {current ? <p className="live-sheet__text">{whyExerciseInWorkout(current, workout)}</p> : null}
        {current?.execution?.length ? (
          <>
            <h3 className="live-sheet__h3">Execução</h3>
            <ol className="live-sheet__list">
              {current.execution.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="live-sheet__text">{current?.shortInstruction || 'Movimento controlado, amplitude completa e respiração constante.'}</p>
        )}
        {current?.commonMistakes?.length ? (
          <>
            <h3 className="live-sheet__h3">Evite</h3>
            <ul className="live-sheet__list">
              {current.commonMistakes.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="live-sheet__note">Pare se sentir dor aguda e procure um profissional se o desconforto persistir.</p>
        <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={() => setSheet(null)}>
          Fechar
        </button>
      </LiveSheet>

      <LiveSheet
        open={sheet === 'more'}
        title="Mais opções"
        onClose={() => {
          setSheet(null)
          setConfirmDiscard(false)
        }}
      >
        <fieldset className="live-options">
          <legend>Descanso padrão</legend>
          <p className="live-options__hint">Usado quando o exercício não define descanso.</p>
          <div className="live-chips">
            {REST_OPTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                className={`live-chip${settings.restSeconds === sec ? ' is-active' : ''}`}
                aria-pressed={settings.restSeconds === sec}
                onClick={() => updateSettings({ restSeconds: sec })}
              >
                {sec} s
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="live-options">
          <legend>Aumento para membros superiores</legend>
          <div className="live-chips">
            {UPPER_INCREMENTS.map((kg) => (
              <button
                key={kg}
                type="button"
                className={`live-chip${settings.upperIncrementKg === kg ? ' is-active' : ''}`}
                aria-pressed={settings.upperIncrementKg === kg}
                onClick={() => updateSettings({ upperIncrementKg: kg })}
              >
                +{formatLoad(kg)} kg
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="live-toggle"
          role="switch"
          aria-checked={settings.sound}
          onClick={() => updateSettings({ sound: !settings.sound })}
        >
          <span>Som ao fim do descanso</span>
          <span className={`live-toggle__track${settings.sound ? ' is-on' : ''}`} aria-hidden="true">
            <span />
          </span>
        </button>
        {completedSetCount(exercises) > 0 && !allDone ? (
          <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={finishWorkout}>
            Finalizar agora
          </button>
        ) : null}
        {confirmDiscard ? (
          <div className="live-confirm" role="alert">
            <p>Descartar este treino? As séries desta sessão não entram no histórico.</p>
            <div className="live-confirm__actions">
              <button type="button" className="live-btn live-btn--ghost" onClick={() => setConfirmDiscard(false)}>
                Manter
              </button>
              <button type="button" className="live-btn live-btn--danger" onClick={discardWorkout}>
                Descartar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="live-link live-link--danger" onClick={() => setConfirmDiscard(true)}>
            Descartar treino
          </button>
        )}
      </LiveSheet>

      <LiveSheet open={sheet === 'exit'} title="Sair do treino?" onClose={() => setSheet(null)}>
        <p className="live-sheet__text">Suas séries ficam salvas. Você pode continuar de onde parou pela tela Hoje.</p>
        <div className="live-sheet__actions">
          <button type="button" className="live-btn live-btn--primary live-btn--block" onClick={() => setSheet(null)}>
            Continuar treinando
          </button>
          <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={leaveToHome}>
            Sair e continuar depois
          </button>
        </div>
      </LiveSheet>

      <LiveSheet open={Boolean(resumePrompt)} title="Você tem um treino em andamento. Continuar?" onClose={() => {}} dismissible={false}>
        {resumePrompt ? (
          <>
            <p className="live-sheet__text">
              <strong>{displayWorkoutName(resumePrompt.name)}</strong> · {resumePrompt.detail}
            </p>
            <div className="live-sheet__actions">
              <button type="button" className="live-btn live-btn--primary live-btn--block" onClick={resumePrompt.onContinue}>
                Continuar treino
              </button>
              <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={resumePrompt.onDiscard}>
                Descartar e começar este
              </button>
            </div>
          </>
        ) : null}
      </LiveSheet>

      <Toast toasts={toasts} />
    </div>
  )
}
