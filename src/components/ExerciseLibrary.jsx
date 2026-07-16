import { useEffect, useMemo, useState } from 'react'
import { equipmentTypes as defaultEquipment, levelTypes as defaultLevels, exerciseTypes as defaultTypes } from '../data/exercisesData'
import { GDT_FILTER_GROUPS, matchesGdtChip, countExercisesByChip, muscleGroupLabel } from '../data/exerciseMediaMap'
import { useFitness } from '../context/FitnessContext'
import { useExercises } from '../hooks/useExercises'
import SectionTitle from './SectionTitle'
import ExerciseCard from './ExerciseCard'
import ExerciseDetailModal from './ExerciseDetailModal'

const GROUP_META = {
  Peitoral: {
    icon: 'PT',
    tone: 'peito',
    description: 'Supinos, crucifixos e variações para movimentos de empurrar.',
  },
  Costas: {
    icon: 'CO',
    tone: 'costas',
    description: 'Remadas, puxadas e movimentos para força posterior.',
  },
  Pernas: {
    icon: 'PR',
    tone: 'pernas',
    description: 'Agachamentos, presses e variações para membros inferiores.',
  },
  Glúteos: {
    icon: 'GL',
    tone: 'gluteos',
    description: 'Hip thrust, ponte e ativação de glúteos com controle.',
  },
  Ombros: {
    icon: 'OM',
    tone: 'ombros',
    description: 'Desenvolvimento, elevações e estabilidade dos ombros.',
  },
  Bíceps: {
    icon: 'BI',
    tone: 'biceps',
    description: 'Roscas e variações para flexão de cotovelo.',
  },
  Tríceps: {
    icon: 'TR',
    tone: 'triceps',
    description: 'Extensões e empurrões para a parte posterior do braço.',
  },
  Antebraço: {
    icon: 'AN',
    tone: 'antebraco',
    description: 'Força de pegada, punho e estabilidade do antebraço.',
  },
  Trapézio: {
    icon: 'TP',
    tone: 'trapezio',
    description: 'Encolhimentos e face pulls para trapézio e postura.',
  },
  Lombar: {
    icon: 'LO',
    tone: 'lombar',
    description: 'Extensões e estabilização da região lombar.',
  },
  Abdômen: {
    icon: 'AB',
    tone: 'abdomen',
    description: 'Core, prancha e estabilidade do tronco.',
  },
  Panturrilha: {
    icon: 'PA',
    tone: 'panturrilha',
    description: 'Elevações e variações para panturrilha.',
  },
  Cardio: {
    icon: 'CA',
    tone: 'cardio',
    description: 'Esteira, bike e opções de condicionamento aeróbico.',
  },
  Mobilidade: {
    icon: 'MO',
    tone: 'mobilidade',
    description: 'Mobilidade articular para aquecer e recuperar melhor.',
  },
  Funcional: {
    icon: 'FU',
    tone: 'funcional',
    description: 'Movimentos integrais para coordenação e força prática.',
  },
  Alongamento: {
    icon: 'AL',
    tone: 'alongamento',
    description: 'Alongamentos para flexibilidade e relaxamento muscular.',
  },
}

const SECTION_ORDER = GDT_FILTER_GROUPS.map((section) => ({
  ...section,
  groups: section.chips.filter((c) => c.id !== 'Todos'),
}))

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

function usePageSize() {
  const [pageSize, setPageSize] = useState(12)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setPageSize(mq.matches ? 6 : 12)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return pageSize
}

export default function ExerciseLibrary() {
  const { addExerciseToPlan } = useFitness()
  const { exercises, loading } = useExercises()
  const pageSize = usePageSize()

  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [equipment, setEquipment] = useState('Todos')
  const [level, setLevel] = useState('Todos')
  const [type, setType] = useState('Todos')
  const [filterGroup, setFilterGroup] = useState('Todos')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [visibleCount, setVisibleCount] = useState(12)

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

  const activeFilterCount = [equipment, level, type, filterGroup].filter((v) => v !== 'Todos').length
  const searchQuery = search.trim().toLowerCase()
  const isSearchMode = searchQuery.length > 0
  const showGroups = !selectedGroup && !isSearchMode

  const chipCounts = useMemo(() => {
    const map = {}
    for (const section of SECTION_ORDER) {
      for (const item of section.groups) {
        map[item.id] = countExercisesByChip(exercises, item.id)
      }
    }
    return map
  }, [exercises])

  const verifiedCount = useMemo(
    () => exercises.filter((ex) => ex.hasVerifiedMedia && !ex.mediaPending).length,
    [exercises],
  )

  const advancedFiltered = useMemo(() => {
    return exercises.filter((ex) => {
      const muscleGroup = ex.muscleGroup || ex.category || ''
      const matchEquip = equipment === 'Todos' || ex.equipment === equipment
      const matchLevel = level === 'Todos' || ex.level === level
      const matchType = type === 'Todos' || ex.type === type
      const matchGroup = filterGroup === 'Todos' || matchesGdtChip(filterGroup, muscleGroup)
      return matchEquip && matchLevel && matchType && matchGroup
    })
  }, [exercises, equipment, level, type, filterGroup])

  const resultList = useMemo(() => {
    let list = advancedFiltered

    if (isSearchMode) {
      list = list.filter((ex) => {
        const muscleGroup = ex.muscleGroup || ex.category || ''
        return (
          ex.name.toLowerCase().includes(searchQuery) ||
          muscleGroup.toLowerCase().includes(searchQuery) ||
          (ex.equipment || '').toLowerCase().includes(searchQuery) ||
          (ex.type || '').toLowerCase().includes(searchQuery)
        )
      })
    } else if (selectedGroup) {
      list = list.filter((ex) => matchesGdtChip(selectedGroup, ex.category || ex.muscleGroup))
    }

    return list
  }, [advancedFiltered, isSearchMode, searchQuery, selectedGroup])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [selectedGroup, searchQuery, equipment, level, type, filterGroup, pageSize])

  // Coach IA → “Ver exercícios relacionados”
  useEffect(() => {
    const onFilter = (event) => {
      const group = event?.detail?.group
      if (!group || group === 'Todos') {
        setSelectedGroup(null)
        setFilterGroup('Todos')
        return
      }
      setSearch('')
      setSelectedGroup(group)
      setFilterGroup(group)
    }
    window.addEventListener('evoluafit:filter-exercises', onFilter)
    return () => window.removeEventListener('evoluafit:filter-exercises', onFilter)
  }, [])

  const shownExercises = resultList.slice(0, visibleCount)
  const remaining = Math.max(0, resultList.length - visibleCount)

  const clearFilters = () => {
    setSearch('')
    setSelectedGroup(null)
    setEquipment('Todos')
    setLevel('Todos')
    setType('Todos')
    setFilterGroup('Todos')
    setFiltersOpen(false)
  }

  const openGroup = (groupId) => {
    setSelectedGroup(groupId)
    setSearch('')
    setVisibleCount(pageSize)
    if (typeof window !== 'undefined') {
      document.getElementById('library-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const backToGroups = () => {
    setSelectedGroup(null)
    setSearch('')
  }

  const applyAdvancedFilters = () => {
    if (filterGroup !== 'Todos') {
      setSelectedGroup(filterGroup)
      setSearch('')
    }
    setFiltersOpen(false)
  }

  const resultsTitle = isSearchMode
    ? 'Resultados da busca'
    : selectedGroup
      ? `Exercícios de ${muscleGroupLabel(selectedGroup)}`
      : 'Exercícios'

  return (
    <section id="exercicios" className="section section--alt exercise-library--gdt exercise-library--browse">
      <div className="container">
        <SectionTitle
          tag="Biblioteca"
          title="Biblioteca de Exercícios"
          subtitle="Escolha um grupo muscular para visualizar exercícios, instruções e cuidados de execução."
        />

        <div className="library-stats">
          <span className="library-stats__item">
            {loading ? '…' : exercises.length} exercícios cadastrados
          </span>
          <span className="library-stats__sep" aria-hidden="true">
            ·
          </span>
          <span className="library-stats__item">{verifiedCount} com mídia verificada</span>
          <span className="library-stats__sep" aria-hidden="true">
            ·
          </span>
          <span className="library-stats__item library-stats__item--muted">Conteúdo informativo</span>
        </div>

        <div className="library-control-panel">
          <div className="gdt-library-toolbar">
            <div className="gdt-library-search-wrap">
              <span className="gdt-library-search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar exercício, músculo ou equipamento..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  if (e.target.value.trim()) setSelectedGroup(null)
                }}
                className="search-input gdt-library-search"
                aria-label="Pesquisar exercícios"
              />
            </div>
            <button
              type="button"
              className={`gdt-library-filters-btn${filtersOpen ? ' is-open' : ''}`}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
            >
              <span className="gdt-library-filters-btn__label">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="gdt-library-filters-count">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {filtersOpen && (
          <>
            <button
              type="button"
              className="mobile-filter-backdrop"
              onClick={() => setFiltersOpen(false)}
              aria-label="Fechar filtros"
            />
            <aside className="library-filter-drawer glass-card" aria-label="Filtros avançados">
              <div className="library-filter-drawer__header">
                <span>Filtros avançados</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFiltersOpen(false)}>
                  Fechar
                </button>
              </div>

              <label className="library-filter-field">
                <span>Grupo muscular</span>
                <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {SECTION_ORDER.flatMap((s) => s.groups).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="library-filter-field">
                <span>Tipo de treino</span>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {exerciseTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="library-filter-field">
                <span>Equipamento</span>
                <select value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {equipmentTypes.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </label>

              <label className="library-filter-field">
                <span>Nível</span>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {levelTypes.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>

              <div className="library-filter-drawer__actions">
                <button type="button" className="btn btn--ghost" onClick={clearFilters}>
                  Limpar filtros
                </button>
                <button type="button" className="btn btn--primary" onClick={applyAdvancedFilters}>
                  Aplicar
                </button>
              </div>
            </aside>
          </>
        )}

        {loading ? (
          <p className="library-loading" aria-live="polite">
            Carregando exercícios...
          </p>
        ) : (
          <>
            {showGroups && (
              <div className="muscle-browse">
                {SECTION_ORDER.map((section) => (
                  <div key={section.id} className="muscle-browse__section">
                    <div className="muscle-browse__section-head">
                      <h3 className="muscle-browse__section-title">{section.label}</h3>
                    </div>
                    <div className="muscle-group-grid">
                      {section.groups.map((group) => {
                        const meta = GROUP_META[group.id] || {
                          icon: group.label.slice(0, 2).toUpperCase(),
                          tone: 'default',
                          description: `Exercícios de ${group.label}.`,
                        }
                        const count = chipCounts[group.id] ?? 0
                        return (
                          <button
                            key={group.id}
                            type="button"
                            className={`muscle-group-card muscle-group-card--${meta.tone}`}
                            onClick={() => openGroup(group.id)}
                          >
                            <span className="muscle-group-card__accent" aria-hidden="true" />
                            <span className="muscle-group-card__icon" aria-hidden="true">
                              {meta.icon}
                            </span>
                            <span className="muscle-group-card__body">
                              <span className="muscle-group-card__top">
                                <span className="muscle-group-card__name">{group.label}</span>
                                <span className="muscle-group-card__count">{count}</span>
                              </span>
                              <span className="muscle-group-card__desc">{meta.description}</span>
                              <span className="muscle-group-card__cta">Ver exercícios →</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(selectedGroup || isSearchMode) && (
              <div id="library-results" className="library-results-panel">
                <div className="library-results-panel__header">
                  <div>
                    {(selectedGroup || isSearchMode) && (
                      <button type="button" className="library-back-btn" onClick={backToGroups}>
                        ← Voltar para grupos
                      </button>
                    )}
                    <h3 className="library-results-panel__title">{resultsTitle}</h3>
                    <p className="library-results-panel__meta">
                      {resultList.length}{' '}
                      {resultList.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
                    </p>
                  </div>
                </div>

                {resultList.length === 0 ? (
                  <div className="library-empty">
                    <p>Nenhum exercício encontrado.</p>
                    <button type="button" className="btn btn--primary" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="gdt-exercise-grid">
                      {shownExercises.map((ex) => (
                        <ExerciseCard
                          key={ex.id}
                          exercise={ex}
                          onAdd={addExerciseToPlan}
                          onClick={setSelectedExercise}
                          variant="gdt"
                        />
                      ))}
                    </div>

                    {remaining > 0 && (
                      <div className="library-load-more">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => setVisibleCount((n) => n + pageSize)}
                        >
                          Ver mais exercícios ({remaining} restantes)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
