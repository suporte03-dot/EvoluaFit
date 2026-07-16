import { useEffect, useMemo, useState } from 'react'
import { equipmentTypes as defaultEquipment, levelTypes as defaultLevels, exerciseTypes as defaultTypes } from '../data/exercisesData'
import { GDT_FILTER_GROUPS, matchesGdtChip, countExercisesByChip, muscleGroupLabel } from '../data/exerciseMediaMap'
import { normalizeMuscleGroup } from '../utils/exerciseValidation'
import { useFitness } from '../context/FitnessContext'
import { useExercises } from '../hooks/useExercises'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'
import ExerciseDetailModal from './ExerciseDetailModal'

const INITIAL_VISIBLE = 6
const LOAD_MORE_STEP = 6

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

/** Grupos oficiais da biblioteca (sem "Todos") */
const LIBRARY_GROUPS = GDT_FILTER_GROUPS.flatMap((section) =>
  section.chips.filter((chip) => chip.id !== 'Todos').map((chip) => ({
    ...chip,
    sectionId: section.id,
    sectionLabel: section.label,
  })),
)

function groupExercisesByMuscle(list) {
  const map = new Map()
  for (const ex of list) {
    const key = normalizeMuscleGroup(ex.muscleGroup || ex.category || 'Funcional')
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(ex)
  }
  return map
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
  const [openGroupId, setOpenGroupId] = useState(null)
  const [visibleByGroup, setVisibleByGroup] = useState({})

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

  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return exercises.filter((ex) => {
      const muscleGroup = ex.muscleGroup || ex.category || ''
      const matchSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        muscleGroup.toLowerCase().includes(q) ||
        (ex.equipment || '').toLowerCase().includes(q)
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      const matchType = type === 'Todos' || ex.type === type
      return matchSearch && matchEquip && matchLevel && matchType
    })
  }, [exercises, search, equipment, level, type])

  const filtered = useMemo(() => {
    if (chip === 'Todos') return baseFiltered
    return baseFiltered.filter((ex) => matchesGdtChip(chip, ex.category || ex.muscleGroup))
  }, [baseFiltered, chip])

  const grouped = useMemo(() => groupExercisesByMuscle(filtered), [filtered])

  const visibleSections = useMemo(() => {
    return GDT_FILTER_GROUPS.map((section) => {
      const groups = section.chips
        .filter((c) => c.id !== 'Todos')
        .map((c) => ({
          id: c.id,
          label: c.label,
          exercises: grouped.get(c.id) || [],
          totalInCatalog: chipCounts[c.id] ?? 0,
        }))
        .filter((g) => {
          if (chip !== 'Todos' && chip !== g.id) return false
          // Com busca/filtros ativos, esconde grupos vazios; no estado inicial mostra todos com catálogo
          if (search || equipment !== 'Todos' || level !== 'Todos' || type !== 'Todos' || chip !== 'Todos') {
            return g.exercises.length > 0
          }
          return g.totalInCatalog > 0
        })
      return { ...section, groups }
    }).filter((section) => section.groups.length > 0)
  }, [grouped, chip, chipCounts, search, equipment, level, type])

  // Abre automaticamente o grupo do chip ou o primeiro com resultados na busca
  useEffect(() => {
    if (chip !== 'Todos') {
      setOpenGroupId(chip)
      setVisibleByGroup((prev) => ({ ...prev, [chip]: prev[chip] || INITIAL_VISIBLE }))
      return
    }
    if (search.trim()) {
      const firstWithResults = LIBRARY_GROUPS.find((g) => (grouped.get(g.id) || []).length > 0)
      if (firstWithResults) {
        setOpenGroupId(firstWithResults.id)
        setVisibleByGroup((prev) => ({
          ...prev,
          [firstWithResults.id]: prev[firstWithResults.id] || INITIAL_VISIBLE,
        }))
      }
    }
  }, [chip, search, grouped])

  const toggleGroup = (groupId) => {
    setOpenGroupId((current) => {
      const next = current === groupId ? null : groupId
      if (next) {
        setVisibleByGroup((prev) => ({ ...prev, [next]: prev[next] || INITIAL_VISIBLE }))
      }
      return next
    })
    if (chip !== 'Todos' && chip !== groupId) {
      setChip('Todos')
    }
  }

  const handleChipClick = (id) => {
    setChip(id)
    if (id === 'Todos') {
      setOpenGroupId(null)
      return
    }
    setOpenGroupId(id)
    setVisibleByGroup((prev) => ({ ...prev, [id]: prev[id] || INITIAL_VISIBLE }))
  }

  const showMore = (groupId, total) => {
    setVisibleByGroup((prev) => ({
      ...prev,
      [groupId]: Math.min((prev[groupId] || INITIAL_VISIBLE) + LOAD_MORE_STEP, total),
    }))
  }

  const showLess = (groupId) => {
    setVisibleByGroup((prev) => ({ ...prev, [groupId]: INITIAL_VISIBLE }))
  }

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
        onClick={() => handleChipClick(item.id)}
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
          subtitle="Escolha um grupo muscular para explorar. Abra só o que precisa — mais limpo e organizado."
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
              {chip !== 'Todos' ? ` em ${muscleGroupLabel(chip)}` : ''}
              {' · '}
              toque em um grupo para expandir
            </p>

            <div className="library-accordion" role="list">
              {visibleSections.map((section) => (
                <div key={section.id} className="library-accordion__section">
                  <p className="library-accordion__section-title">{section.label}</p>
                  <div className="library-accordion__list">
                    {section.groups.map((group) => {
                      const isOpen = openGroupId === group.id
                      const total = group.exercises.length
                      const visible = Math.min(visibleByGroup[group.id] || INITIAL_VISIBLE, total || INITIAL_VISIBLE)
                      const shown = group.exercises.slice(0, visible)
                      const remaining = Math.max(0, total - visible)

                      return (
                        <div
                          key={group.id}
                          className={`library-acc-item${isOpen ? ' is-open' : ''}`}
                          role="listitem"
                        >
                          <button
                            type="button"
                            className="library-acc-item__header"
                            aria-expanded={isOpen}
                            aria-controls={`library-panel-${group.id}`}
                            id={`library-trigger-${group.id}`}
                            onClick={() => toggleGroup(group.id)}
                          >
                            <span className="library-acc-item__title">{group.label}</span>
                            <span className="library-acc-item__count">
                              {total} {total === 1 ? 'exercício' : 'exercícios'}
                            </span>
                            <span className="library-acc-item__chevron" aria-hidden="true" />
                          </button>

                          <div
                            id={`library-panel-${group.id}`}
                            role="region"
                            aria-labelledby={`library-trigger-${group.id}`}
                            className={`library-acc-item__panel${isOpen ? ' is-open' : ''}`}
                            hidden={!isOpen}
                          >
                            {total === 0 ? (
                              <p className="library-acc-item__empty">Nenhum exercício neste grupo com os filtros atuais.</p>
                            ) : (
                              <>
                                <div className="gdt-exercise-grid gdt-exercise-grid--accordion">
                                  {shown.map((ex) => (
                                    <ExerciseCard
                                      key={ex.id}
                                      exercise={ex}
                                      onAdd={addExerciseToPlan}
                                      onClick={setSelectedExercise}
                                      variant="gdt"
                                    />
                                  ))}
                                </div>

                                <div className="library-acc-item__footer">
                                  {remaining > 0 && (
                                    <button
                                      type="button"
                                      className="btn btn--ghost library-acc-more"
                                      onClick={() => showMore(group.id, total)}
                                    >
                                      Ver mais ({remaining} restantes)
                                    </button>
                                  )}
                                  {visible > INITIAL_VISIBLE && (
                                    <button
                                      type="button"
                                      className="btn btn--ghost library-acc-less"
                                      onClick={() => showLess(group.id)}
                                    >
                                      Ver menos
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
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
