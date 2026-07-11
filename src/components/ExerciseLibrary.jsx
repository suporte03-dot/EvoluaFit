import { useMemo, useState } from 'react'
import { exercises, muscleGroups, equipmentTypes, levelTypes, exerciseTypes } from '../data/exercisesData'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'

export default function ExerciseLibrary() {
  const { addExerciseToPlan } = useFitness()
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('Todos')
  const [equipment, setEquipment] = useState('Todos')
  const [level, setLevel] = useState('Todos')
  const [type, setType] = useState('Todos')

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.category.toLowerCase().includes(search.toLowerCase()) ||
        ex.type.toLowerCase().includes(search.toLowerCase())
      const matchMuscle = muscle === 'Todos' || ex.category === muscle
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      const matchType = type === 'Todos' || ex.type === type
      return matchSearch && matchMuscle && matchEquip && matchLevel && matchType
    })
  }, [search, muscle, equipment, level, type])

  return (
    <section id="exercicios" className="section section--alt">
      <div className="container">
        <SectionTitle
          tag="Biblioteca"
          title="Exercícios"
          subtitle={`${exercises.length} exercícios com mídia demonstrativa, instruções e cuidados de segurança.`}
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
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Todos">Tipo de treino</option>
              {exerciseTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <ExerciseCard key={ex.id} exercise={ex} onAdd={addExerciseToPlan} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="empty-text">Nenhum exercício encontrado com esses filtros.</p>
        )}
      </div>
    </section>
  )
}
