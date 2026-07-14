import { useMemo, useState } from 'react'
import { equipmentTypes as defaultEquipment, levelTypes as defaultLevels, exerciseTypes as defaultTypes } from '../data/exercisesData'
import { GDT_FILTER_GROUPS, matchesGdtChip, countExercisesByChip } from '../data/exerciseMediaMap'
import { useFitness } from '../context/FitnessContext'
import { useExercises } from '../hooks/useExercises'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'
import ExerciseDetailModal from './ExerciseDetailModal'

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export default function ExerciseLibrary() {
  const { addExerciseToPlan } = useFitness()
  const { exercises, loading } = useExercises()
  const [search, setSearch] = useState('')
  const [chip, setChip] = useState('Todos')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [equipment, setEquipment] = useState('Todos')
  const [level, setLevel] = useState('Todos')
  const [type, setType] = useState('Todos')
  const [selectedExercise, setSelectedExercise] = useState(null)

  const exerciseTypes = useMemo(
    () => (exercises.length ? uniqueSorted(exercises.map((ex) => ex.type)) : defaultTypes),
    [exercises],
  )
  const equipmentTypes = useMemo(
    () => (exercises.length ? uniqueSorted(exercises.map((ex) => ex.equipment)) : defaultEquipment),
    [exercises],
  )
  const levelTypes = useMemo(
    () => (exercises.length ? uniqueSorted(exercises.map((ex) => ex.level)) : defaultLevels),
    [exercises],
  )

  const activeFilterCount = [equipment, level, type].filter((v) => v !== 'Todos').length

  const chipCounts = useMemo(() => {
    const map = {}
    for (const group of GDT_FILTER_GROUPS) {
      for (const item of group.chips) {
        map[item.id] = countExercisesByChip(exercises, item.id)
      }
    }
    return map
  }, [exercises])

  const verifiedCount = useMemo(
    () => exercises.filter((ex) => ex.hasVerifiedMedia && !ex.mediaPending).length,
    [exercises],
  )

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = search.toLowerCase()
      const muscleGroup = ex.muscleGroup || ex.category || ''
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(q) ||
        muscleGroup.toLowerCase().includes(q) ||
        (ex.equipment || '').toLowerCase().includes(q)
      const matchChip = matchesGdtChip(chip, ex.category || muscleGroup)
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      const matchType = type === 'Todos' || ex.type === type
      return matchSearch && matchChip && matchEquip && matchLevel && matchType
    })
  }, [exercises, search, chip, equipment, level, type])

  function renderChipButton(item) {
    const count = chipCounts[item.id] ?? 0
    const showCount = item.id !== 'Todos'
    return (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={chip === item.id}
        className={`gdt-chip${chip === item.id ? ' is-active' : ''}`}
        onClick={() => setChip(item.id)}
      >
        {item.label}
        {showCount && <span className="gdt-chip__count">{count}</span>}
      </button>
    )
  }

  return (
    <section id="exercicios" className="section section--alt exercise-library--gdt">
      <div className="container">
        <SectionTitle
          tag="Biblioteca"
          title="Exercícios"
          subtitle="Biblioteca organizada por grupos musculares, com demonstrações coerentes, execução segura e cuidados."
        />
        <p className="gdt-library-subtitle-meta">
          {loading ? 'Carregando…' : `${exercises.length} exercícios · ${verifiedCount} com mídia verificada`}
          {' · '}
          Conteúdo informativo — respeite seus limites.
        </p>

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

        <div className="gdt-filter-groups" aria-label="Grupos musculares">
          {GDT_FILTER_GROUPS.map((group) => (
            <div key={group.id} className="gdt-filter-group">
              <p className="gdt-filter-group__title">{group.label}</p>
              <div className="gdt-library-chips" role="tablist" aria-label={group.label}>
                {group.chips.map(renderChipButton)}
              </div>
            </div>
          ))}
        </div>

        {filtersOpen && (
          <>
            <button
              type="button"
              className="mobile-filter-backdrop"
              onClick={() => setFiltersOpen(false)}
              aria-label="Fechar filtros"
            />
            <div className="library-filters glass-card gdt-library-advanced mobile-filter-sheet">
              <div className="mobile-filter-sheet__header">
                <span className="mobile-filter-sheet__title">Filtros</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFiltersOpen(false)}>
                  Fechar
                </button>
              </div>

              <div className="gdt-filter-groups gdt-filter-groups--sheet">
                {GDT_FILTER_GROUPS.map((group) => (
                  <div key={`sheet-${group.id}`} className="gdt-filter-group">
                    <p className="gdt-filter-group__title">{group.label}</p>
                    <div className="gdt-library-chips gdt-library-chips--wrap">{group.chips.map(renderChipButton)}</div>
                  </div>
                ))}
              </div>

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
              <button type="button" className="btn btn--primary" onClick={() => setFiltersOpen(false)}>
                Aplicar filtros
              </button>
            </div>
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
          </>
        )}

        {loading ? (
          <p className="library-loading" aria-live="polite">
            Carregando exercícios...
          </p>
        ) : (
          <>
            <p className="gdt-library-results">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
              {chip !== 'Todos' ? ` em ${chip}` : ''}
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
              <p className="empty-text">
                {chip !== 'Todos'
                  ? 'Nenhum exercício encontrado para este grupo.'
                  : 'Nenhum exercício encontrado.'}
              </p>
            )}
          </>
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
