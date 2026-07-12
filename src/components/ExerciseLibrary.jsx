import { useMemo, useState } from 'react'
import { exercises, equipmentTypes, levelTypes, exerciseTypes } from '../data/exercisesData'
import { GDT_CATEGORY_CHIPS, matchesGdtChip } from '../data/exerciseMediaMap'
import { useFitness } from '../context/FitnessContext'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'
import ExerciseDetailModal from './ExerciseDetailModal'

export default function ExerciseLibrary() {
  const { addExerciseToPlan } = useFitness()
  const [search, setSearch] = useState('')
  const [chip, setChip] = useState('Todos')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [equipment, setEquipment] = useState('Todos')
  const [level, setLevel] = useState('Todos')
  const [type, setType] = useState('Todos')
  const [selectedExercise, setSelectedExercise] = useState(null)

  const activeFilterCount = [equipment, level, type].filter((v) => v !== 'Todos').length

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        ex.type.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        (ex.muscles || []).some((m) => m.toLowerCase().includes(q))
      const matchChip = matchesGdtChip(chip, ex.category)
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      const matchType = type === 'Todos' || ex.type === type
      return matchSearch && matchChip && matchEquip && matchLevel && matchType
    })
  }, [search, chip, equipment, level, type])

  return (
    <section id="exercicios" className="section section--alt exercise-library--gdt">
      <div className="container">
        <SectionTitle
          tag="Biblioteca"
          title="Exercícios"
          subtitle={`${exercises.length} exercícios com mídia demonstrativa, instruções e cuidados de segurança.`}
        />

        <div className="gdt-library-toolbar">
          <input
            type="search"
            placeholder="Pesquise exercícios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input gdt-library-search"
            aria-label="Pesquisar exercícios"
          />
          <button
            type="button"
            className={`gdt-library-filters-btn${filtersOpen ? ' is-open' : ''}`}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            Filtros
            {activeFilterCount > 0 && (
              <span className="gdt-library-filters-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="gdt-library-chips" role="tablist" aria-label="Grupos musculares">
          {GDT_CATEGORY_CHIPS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={chip === item.id}
              className={`gdt-chip${chip === item.id ? ' is-active' : ''}`}
              onClick={() => setChip(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtersOpen && (
          <div className="library-filters glass-card gdt-library-advanced">
            <div className="filter-scroll">
              <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de treino">
                <option value="Todos">Tipo de treino</option>
                {exerciseTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select value={equipment} onChange={(e) => setEquipment(e.target.value)} aria-label="Equipamento">
                <option value="Todos">Equipamento</option>
                {equipmentTypes.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Nível">
                <option value="Todos">Nível</option>
                {levelTypes.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <p className="gdt-library-results">
          {filtered.length} {filtered.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
        </p>

        <div className="gdt-exercise-grid">
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onAdd={addExerciseToPlan}
              onClick={setSelectedExercise}
              variant="gdt"
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="empty-text">Nenhum exercício encontrado.</p>
        )}

        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={Boolean(selectedExercise)}
          onClose={() => setSelectedExercise(null)}
        />
      </div>
    </section>
  )
}
