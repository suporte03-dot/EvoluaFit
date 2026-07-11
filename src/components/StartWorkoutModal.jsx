import { useEffect, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import Modal from './Modal'

export default function StartWorkoutModal() {
  const { activeWorkout, setActiveWorkout, completeWorkout } = useFitness()
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [sets, setSets] = useState([])
  const [currentSet, setCurrentSet] = useState({ load: '', reps: '', done: false })
  const [restTimer, setRestTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [startTime] = useState(() => Date.now())
  const [sessionExercises, setSessionExercises] = useState([])

  const isOpen = Boolean(activeWorkout)
  const exercises = activeWorkout?.exercises || []
  const current = exercises[exerciseIndex]

  useEffect(() => {
    if (!activeWorkout) return
    const exs = activeWorkout.exercises || []
    setExerciseIndex(0)
    setSets([])
    setCurrentSet({ load: exs[0]?.load || '', reps: '', done: false })
    setSessionExercises(exs.map((ex) => ({ ...ex, completedSets: 0, setsLog: [] })))
    setRestTimer(0)
    setTimerActive(false)
  }, [activeWorkout?.id])

  useEffect(() => {
    if (!timerActive || restTimer <= 0) return undefined
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
  }, [timerActive, restTimer])

  const handleClose = () => setActiveWorkout(null)

  const completeSet = () => {
    const newSet = { ...currentSet, done: true }
    const updatedSets = [...sets, newSet]
    setSets(updatedSets)

    setSessionExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              completedSets: updatedSets.length,
              load: newSet.load || ex.load,
              setsLog: updatedSets,
            }
          : ex,
      ),
    )

    if (updatedSets.length < (current?.sets || 3)) {
      setRestTimer(current?.restSeconds || 60)
      setTimerActive(true)
      setCurrentSet({ load: newSet.load, reps: '', done: false })
    }
  }

  const nextExercise = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((i) => i + 1)
      setSets([])
      const next = exercises[exerciseIndex + 1]
      setCurrentSet({ load: next?.load || '', reps: '', done: false })
    }
  }

  const finalize = () => {
    const durationMinutes = Math.round((Date.now() - startTime) / 60000)
    completeWorkout(activeWorkout.id, {
      name: activeWorkout.name,
      durationMinutes: Math.max(durationMinutes, 1),
      exercises: sessionExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        completedSets: ex.completedSets || sets.length,
        reps: ex.reps,
        load: ex.load || currentSet.load,
      })),
    })
  }

  if (!isOpen || !current) return null

  const allSetsDone = sets.length >= (current.sets || 3)
  const isLast = exerciseIndex === exercises.length - 1

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={activeWorkout.name} size="lg">
      <div className="workout-session">
        <div className="workout-session__progress">
          Exercício {exerciseIndex + 1} de {exercises.length}
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${((exerciseIndex + 1) / exercises.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="workout-session__exercise">
          <h3>{current.name}</h3>
          <p>
            {current.muscleGroup} · Meta: {current.sets}x {current.reps}
          </p>
        </div>

        <div className="workout-session__sets">
          <p>
            Série {sets.length + 1} de {current.sets}
          </p>
          <div className="form-grid form-grid--2">
            <label className="form-field">
              <span>Carga</span>
              <input
                value={currentSet.load}
                onChange={(e) => setCurrentSet((s) => ({ ...s, load: e.target.value }))}
                placeholder="ex: 20kg"
              />
            </label>
            <label className="form-field">
              <span>Repetições</span>
              <input
                value={currentSet.reps}
                onChange={(e) => setCurrentSet((s) => ({ ...s, reps: e.target.value }))}
                placeholder="ex: 12"
              />
            </label>
          </div>
          <button type="button" className="btn btn--primary" onClick={completeSet} disabled={!currentSet.reps}>
            Concluir série
          </button>
        </div>

        {timerActive && restTimer > 0 && (
          <div className="rest-timer">
            <span>Descanso</span>
            <strong>{restTimer}s</strong>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTimerActive(false)}>
              Pular descanso
            </button>
          </div>
        )}

        {sets.length > 0 && (
          <ul className="sets-log">
            {sets.map((s, i) => (
              <li key={i}>
                Série {i + 1}: {s.load || '—'} × {s.reps} reps
              </li>
            ))}
          </ul>
        )}

        <div className="workout-session__nav">
          {allSetsDone && !isLast && (
            <button type="button" className="btn btn--primary" onClick={nextExercise}>
              Próximo exercício →
            </button>
          )}
          {allSetsDone && isLast && (
            <button type="button" className="btn btn--primary btn--lg" onClick={finalize}>
              Finalizar treino
            </button>
          )}
        </div>

        <p className="safety-note">
          Pare imediatamente se sentir dor. Hidrate-se e respeite seus limites.
        </p>
      </div>
    </Modal>
  )
}
