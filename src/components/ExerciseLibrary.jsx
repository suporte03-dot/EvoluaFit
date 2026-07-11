import { useMemo, useState } from 'react'
import { exercises, muscleGroups, equipmentTypes, levelTypes } from '../data/exercisesData'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'

export default function ExerciseLibrary() {
  const { workouts, updateWorkout, addWorkout, showToast } = useFitness()
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('Todos')
  const [equipment, setEquipment] = useState('Todos')
  const [level, setLevel] = useState('Todos')

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase())
      const matchMuscle = muscle === 'Todos' || ex.muscleGroup === muscle
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      return matchSearch && matchMuscle && matchEquip && matchLevel
    })
  }, [search, muscle, equipment, level])

  const handleAdd = (exercise) => {
    const entry = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      restSeconds: exercise.restSeconds,
      load: '',
    }

    const pending = workouts.find((w) => w.status === 'Pendente')

    if (pending) {
      updateWorkout(pending.id, {
        exercises: [...pending.exercises, entry],
        muscleGroups: [...new Set([...(pending.muscleGroups || []), exercise.muscleGroup])],
      })
      showToast(`"${exercise.name}" adicionado ao treino ${pending.name}`)
      return
    }

    addWorkout({
      id: `workout-${Date.now()}`,
      name: `Treino — ${exercise.muscleGroup}`,
      date: new Date().toISOString().split('T')[0],
      muscleGroups: [exercise.muscleGroup],
      status: 'Pendente',
      estimatedMinutes: 45,
      exercises: [entry],
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <section id="exercicios" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Biblioteca"
          title="Exercícios"
          subtitle={`${exercises.length} exercícios com instruções e cuidados de segurança.`}
        />

        <div className="library-filters glass-card">
          <input
            type="search"
            placeholder="Buscar exercício..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="filter-scroll">
            <select value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              <option value="Todos">Grupo muscular</option>
              {muscleGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
              <option value="Todos">Equipamento</option>
              {equipmentTypes.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="Todos">Nível</option>
              {levelTypes.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="exercise-grid">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onAdd={handleAdd} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="empty-text">Nenhum exercício encontrado com esses filtros.</p>
        )}
      </div>
    </section>
  )
}
