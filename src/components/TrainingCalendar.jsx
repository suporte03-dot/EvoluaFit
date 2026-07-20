import { useEffect, useMemo, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { planToWorkouts } from '../utils/workoutGenerator'
import SectionTitle from './SectionTitle'
import Modal from './Modal'
import {
  WEEKDAYS_SHORT,
  WEEKDAYS_FULL,
  addWorkoutToCalendar,
  filterCalendarEntries,
  formatMonthLabel,
  getCalendarSummary,
  getCurrentMonthDays,
  getMobileAgenda,
  getTrainingStatusByDate,
  markRestDay,
  markWorkoutCompleted,
  statusLabel,
  syncPlanToCalendar,
  todayKey,
  updateCalendarNotes,
  updateCalendarWorkout,
  wouldCreateSevenIntenseDays,
} from '../utils/calendarUtils'
import { formatDateLong } from '../utils/dateFormat'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'planned', label: 'Planejados' },
  { id: 'completed', label: 'Realizados' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'rest', label: 'Descanso' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mês' },
]

const WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Mobilidade', 'Core', 'Outro']

const MUSCLE_OPTIONS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Abdômen',
  'Cardio',
  'Mobilidade',
]

const emptyAddForm = (date) => ({
  date: date || todayKey(),
  source: 'quick',
  workoutId: '',
  workoutName: '',
  workoutType: 'Full Body',
  muscleGroups: [],
  duration: 45,
  notes: '',
  exercises: [],
})

function StatusIcon({ status }) {
  const map = {
    completed: '✓',
    planned: '◉',
    pending: '◐',
    partial: '◑',
    rest: '☾',
    missed: '!',
    skipped: '⊘',
  }
  return <span className="cal-status-icon" aria-hidden="true">{map[status] || '·'}</span>
}

export default function TrainingCalendar() {
  const {
    workouts,
    plans,
    generatedPlan,
    profile,
    goals,
    addWorkout,
    replaceWorkouts,
    startWorkout,
    showToast,
  } = useFitness()

  const [current, setCurrent] = useState(() => new Date())
  const [filter, setFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [addForm, setAddForm] = useState(() => emptyAddForm())
  const [noteDraft, setNoteDraft] = useState('')
  const [noteTargetId, setNoteTargetId] = useState(null)
  const [syncConfirm, setSyncConfirm] = useState(false)
  const [safetyHint, setSafetyHint] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)

  const year = current.getFullYear()
  const month = current.getMonth()
  const today = todayKey()

  const filteredWorkouts = useMemo(
    () => filterCalendarEntries(workouts, filter, new Date()),
    [workouts, filter],
  )

  const monthCells = useMemo(
    () => getCurrentMonthDays(year, month, filteredWorkouts, new Date()),
    [year, month, filteredWorkouts],
  )

  const weekGoal = useMemo(() => {
    const fromGoal = goals?.find((g) => g.type === 'weekly_workouts')?.target
    if (fromGoal > 0) return fromGoal
    if (profile?.daysPerWeek > 0) return profile.daysPerWeek
    return null
  }, [goals, profile])

  const summary = useMemo(
    () => getCalendarSummary(workouts, new Date(), { weekGoal }),
    [workouts, weekGoal],
  )
  const mobileAgenda = useMemo(() => getMobileAgenda(workouts, new Date()), [workouts])

  const dayEntries = useMemo(() => {
    if (!selectedDate) return []
    return workouts.filter((w) => w.date === selectedDate)
  }, [workouts, selectedDate])

  const savedWorkouts = useMemo(() => {
    const seen = new Set()
    return workouts.filter((w) => {
      if (w.isRest || w.status === 'Descanso') return false
      if (seen.has(w.name)) return false
      seen.add(w.name)
      return true
    })
  }, [workouts])

  const planSource = generatedPlan || plans?.[0] || null

  useEffect(() => {
    if (summary.intenseStreak >= 6) {
      setSafetyHint(
        'Sequência intensa detectada. Inclua descanso ou mobilidade para recuperar melhor.',
      )
    } else {
      setSafetyHint('')
    }
  }, [summary.intenseStreak])

  const goToday = () => {
    const now = new Date()
    setCurrent(now)
    setSelectedDate(todayKey(now))
  }

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const openDay = (date) => setSelectedDate(date)

  const openAdd = (date) => {
    setEditingId(null)
    setAddForm(emptyAddForm(date || selectedDate || today))
    setShowAdd(true)
  }

  const openEdit = (workout) => {
    setEditingId(workout.id)
    setAddForm({
      date: workout.date,
      source: 'edit',
      workoutId: workout.id,
      workoutName: workout.name,
      workoutType: workout.workoutType || 'Outro',
      muscleGroups: workout.muscleGroups || [],
      duration: workout.estimatedMinutes || 45,
      notes: workout.notes || '',
      exercises: workout.exercises || [],
    })
    setShowAdd(true)
  }

  const toggleMuscle = (group) => {
    setAddForm((prev) => {
      const has = prev.muscleGroups.includes(group)
      return {
        ...prev,
        muscleGroups: has
          ? prev.muscleGroups.filter((g) => g !== group)
          : [...prev.muscleGroups, group],
      }
    })
  }

  const applySavedWorkout = (id) => {
    const w = workouts.find((x) => x.id === id)
    if (!w) return
    setAddForm((prev) => ({
      ...prev,
      source: 'saved',
      workoutId: w.id,
      workoutName: w.name,
      workoutType: w.workoutType || prev.workoutType,
      muscleGroups: w.muscleGroups || [],
      duration: w.estimatedMinutes || 45,
      exercises: (w.exercises || []).map((ex) => ({ ...ex })),
      notes: w.notes || '',
    }))
  }

  const applyPlanDay = (index) => {
    if (!planSource?.schedule?.[index]) return
    const day = planSource.schedule[index]
    setAddForm((prev) => ({
      ...prev,
      source: 'plan',
      workoutName: day.name,
      workoutType: day.name?.split('—')[0]?.trim() || 'Treino',
      muscleGroups: day.focus || [],
      duration: day.estimatedMinutes || 45,
      exercises: (day.exercises || []).map((ex) => ({ ...ex })),
    }))
  }

  const submitAdd = (e) => {
    e.preventDefault()
    if (!addForm.workoutName.trim() && addForm.source !== 'rest') {
      showToast('Informe o nome do treino.', 'info')
      return
    }

    const payload = {
      date: addForm.date,
      workoutName: addForm.workoutName.trim() || 'Treino',
      workoutType: addForm.workoutType,
      muscleGroups: addForm.muscleGroups,
      duration: Number(addForm.duration) || 45,
      notes: addForm.notes,
      exercises: addForm.exercises,
      status: 'planned',
      source: addForm.source,
    }

    if (wouldCreateSevenIntenseDays(workouts, addForm.date, payload)) {
      const ok = window.confirm(
        'Isso completaria 7 dias intensos seguidos. O ideal é incluir descanso ou mobilidade. Deseja continuar mesmo assim?',
      )
      if (!ok) {
        setAddForm((prev) => ({
          ...prev,
          workoutName: 'Mobilidade / Recuperação',
          workoutType: 'Mobilidade',
          muscleGroups: ['Mobilidade'],
          duration: 25,
        }))
        showToast('Sugestão: troque por mobilidade ou descanso.', 'info')
        return
      }
    }

    if (editingId) {
      const next = updateCalendarWorkout(workouts, editingId, {
        date: payload.date,
        workoutName: payload.workoutName,
        workoutType: payload.workoutType,
        muscleGroups: payload.muscleGroups,
        duration: payload.duration,
        notes: payload.notes,
        exercises: payload.exercises,
      })
      replaceWorkouts(next, 'Treino atualizado no calendário.')
    } else {
      const { entry } = addWorkoutToCalendar(workouts, payload)
      addWorkout(entry)
    }

    setShowAdd(false)
    setSelectedDate(addForm.date)
    setEditingId(null)
  }

  const handleStart = (workout) => {
    setSelectedDate(null)
    startWorkout(workout)
  }

  const handleMarkDone = (workout) => {
    const next = markWorkoutCompleted(workouts, workout.id)
    replaceWorkouts(next, 'Treino marcado como realizado!')
  }

  const handleRest = (date) => {
    const { workouts: next } = markRestDay(workouts, date || selectedDate)
    replaceWorkouts(next, 'Dia marcado como descanso.')
    setSelectedDate(date || selectedDate)
  }

  const openNotes = (workout) => {
    setNoteTargetId(workout.id)
    setNoteDraft(workout.notes || '')
  }

  const saveNotes = () => {
    if (!noteTargetId) return
    const next = updateCalendarNotes(workouts, noteTargetId, noteDraft)
    replaceWorkouts(next, 'Observação salva.')
    setNoteTargetId(null)
  }

  const confirmSyncPlan = () => {
    if (!planSource) {
      showToast('Nenhuma planilha disponível. Gere uma na seção Planilha.', 'info')
      setSyncConfirm(false)
      return
    }
    const planWorkouts = planToWorkouts(planSource)
    const { workouts: next, added, safetyWarning } = syncPlanToCalendar(workouts, planWorkouts, {
      overwrite: true,
    })
    replaceWorkouts(next, `${added} treinos enviados ao calendário.`)
    if (safetyWarning) showToast(safetyWarning, 'info')
    setSyncConfirm(false)
  }

  const dayTitle = selectedDate
    ? `${WEEKDAYS_FULL[new Date(`${selectedDate}T12:00:00`).getDay()]}, ${formatDateLong(selectedDate)}`
    : ''

  return (
    <section id="calendario" className="section section--calendar">
      <div className="container">
        <SectionTitle
          tag="Calendário"
          title="Calendário de treinos"
          subtitle="Planeje a rotina e reserve dias de descanso."
        />

        <div className="cal-layout">
          <div className="cal-layout__main">
        <div className="cal-toolbar glass-card">
          <div className="cal-toolbar__month">
            <button type="button" className="btn btn--ghost btn--sm" onClick={prevMonth} aria-label="Mês anterior">
              ←
            </button>
            <h3 className="cal-toolbar__label">{formatMonthLabel(year, month)}</h3>
            <button type="button" className="btn btn--ghost btn--sm" onClick={nextMonth} aria-label="Próximo mês">
              →
            </button>
          </div>
          <div className="cal-toolbar__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={goToday}>
              Hoje
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => openAdd(today)}>
              Adicionar treino
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setSyncConfirm(true)}
              disabled={!planSource}
              title={planSource ? 'Distribuir planilha nos dias do calendário' : 'Gere uma planilha primeiro'}
            >
              Sincronizar planilha
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm cal-toolbar__panel-btn"
              onClick={() => setSummaryOpen(true)}
              aria-expanded={summaryOpen}
            >
              Resumo e filtros
            </button>
          </div>

          <div className="cal-week-progress">
            <div className="cal-week-progress__head">
              <span className="cal-week-progress__label">Progresso da semana</span>
              <strong className="cal-week-progress__value">
                {summary.weekGoal != null
                  ? `${summary.weekCompleted} de ${summary.weekGoal}`
                  : `${summary.weekCompleted} realizados`}
              </strong>
            </div>
            <div
              className="cal-week-progress__bar"
              role="progressbar"
              aria-valuenow={summary.weekCompleted}
              aria-valuemin={0}
              aria-valuemax={summary.weekGoal || Math.max(summary.weekCompleted, 1)}
            >
              <div
                className="cal-week-progress__fill"
                style={{ width: `${summary.weekGoal ? summary.weekPct : summary.weekCompleted > 0 ? 100 : 0}%` }}
              />
            </div>
            <p className="cal-week-progress__hint">
              {summary.weekGoalSource === 'meta'
                ? `Meta semanal: ${summary.weekGoal} treinos (perfil / metas)`
                : summary.weekGoalSource === 'agenda'
                  ? `Baseado nos ${summary.weekGoal} treinos agendados nesta semana`
                  : 'Defina dias/semana no perfil ou agende treinos para ter uma meta clara'}
            </p>
          </div>
        </div>

        {safetyHint && (
          <p className="cal-safety-banner" role="status">
            {safetyHint}
          </p>
        )}

        {/* Desktop monthly grid */}
        <div className="calendar glass-card calendar--desktop cal-grid-wrap">
          <div className="calendar__weekdays">
            {WEEKDAYS_SHORT.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar__grid cal-month-grid">
            {monthCells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="calendar__day calendar__day--empty" />
              const status = cell.status
              return (
                <button
                  key={cell.date}
                  type="button"
                  className={[
                    'calendar__day',
                    'cal-day',
                    status ? `calendar__day--${status} cal-day--${status}` : '',
                    cell.isToday ? 'calendar__day--today cal-day--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => openDay(cell.date)}
                  title={cell.primary?.name || (cell.isRestOnly ? 'Descanso' : undefined)}
                >
                  <span className="cal-day__num">{cell.day}</span>
                  {status && (
                    <span className={`cal-day__badge cal-day__badge--${status} cal-day__badge--compact`}>
                      <StatusIcon status={status} />
                    </span>
                  )}
                  {status && <i className={`cal-day__marker cal-day__marker--${status}`} />}
                </button>
              )
            })}
          </div>

          <div className="calendar__legend cal-legend">
            <span><i className="dot dot--completed" /> Realizado</span>
            <span><i className="dot dot--planned" /> Planejado</span>
            <span><i className="dot dot--pending" /> Pendente</span>
            <span><i className="dot dot--rest" /> Descanso</span>
            <span><i className="dot dot--missed" /> Atrasado</span>
            <span><i className="dot dot--skipped" /> Pulado</span>
          </div>
        </div>

        {/* Mobile organized list */}
        <div className="calendar-list cal-mobile-list">
          <MobileDayBlock
            title="Hoje"
            block={mobileAgenda.today}
            highlight
            onOpen={openDay}
            onStart={handleStart}
            onAdd={openAdd}
          />
          <MobileDayBlock
            title="Amanhã"
            block={mobileAgenda.tomorrow}
            onOpen={openDay}
            onStart={handleStart}
            onAdd={openAdd}
          />
          <div className="cal-mobile-section">
            <h4 className="cal-mobile-section__title">Próximos treinos</h4>
            {mobileAgenda.upcoming.map((block) => (
              <MobileDayBlock
                key={block.date}
                title={block.weekday}
                block={block}
                compact
                onOpen={openDay}
                onStart={handleStart}
                onAdd={openAdd}
              />
            ))}
          </div>
        </div>
          </div>

          {/* Desktop side panel */}
          <aside className="cal-side-panel glass-card cal-side-panel--desktop" aria-label="Resumo e filtros">
            <h3 className="cal-side-panel__title">Resumo do mês</h3>
            {!summary.hasMonthActivity ? (
              <p className="cal-side-panel__empty">
                Nenhum treino neste mês. Adicione um dia ou sincronize sua planilha.
              </p>
            ) : (
              <div className="cal-side-panel__stats">
                <div><span>Planejados</span><strong>{summary.planned}</strong></div>
                <div><span>Realizados</span><strong>{summary.completed}</strong></div>
                <div><span>Descanso</span><strong>{summary.rest}</strong></div>
                <div><span>Pendentes</span><strong>{summary.pending}</strong></div>
                <div><span>Sequência</span><strong>{summary.streak || '—'}</strong></div>
              </div>
            )}
            <p className="cal-side-panel__next">
              <span>Próximo</span>
              <strong>{summary.nextWorkout ? summary.nextWorkout.name : 'Nada agendado'}</strong>
            </p>
            <h4 className="cal-side-panel__filters-title">Filtros</h4>
            <div className="cal-filters cal-filters--stack" role="tablist" aria-label="Filtros do calendário">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  className={`cal-filter-chip ${filter === f.id ? 'cal-filter-chip--active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </aside>
        </div>

        {/* Mobile/tablet: summary + filters as modal */}
        <Modal
          isOpen={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Resumo e filtros"
          size="md"
        >
          <div className="cal-side-panel__stats">
            <div><span>Planejados</span><strong>{summary.planned}</strong></div>
            <div><span>Realizados</span><strong>{summary.completed}</strong></div>
            <div><span>Descanso</span><strong>{summary.rest}</strong></div>
            <div><span>Pendentes</span><strong>{summary.pending}</strong></div>
            <div><span>Sequência</span><strong>{summary.streak || '—'}</strong></div>
          </div>
          <p className="cal-side-panel__next" style={{ margin: '1rem 0' }}>
            <span>Próximo</span>
            <strong>{summary.nextWorkout ? summary.nextWorkout.name : 'Nada agendado'}</strong>
          </p>
          <div className="cal-filters" role="tablist" aria-label="Filtros do calendário">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`cal-filter-chip ${filter === f.id ? 'cal-filter-chip--active' : ''}`}
                onClick={() => {
                  setFilter(f.id)
                  setSummaryOpen(false)
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Modal>
      </div>

      {/* Day detail modal */}
      <Modal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={dayTitle}
        size="lg"
        className="cal-day-modal"
      >
        {dayEntries.length === 0 ? (
          <div className="cal-day-empty">
            <p>Nenhum treino planejado para este dia.</p>
            <div className="cal-day-actions">
              <button type="button" className="btn btn--primary" onClick={() => openAdd(selectedDate)}>
                Adicionar treino
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => handleRest(selectedDate)}>
                Marcar descanso
              </button>
            </div>
          </div>
        ) : (
          <div className="cal-day-detail">
            {dayEntries.map((w) => {
              const st = getTrainingStatusByDate(w, selectedDate)
              return (
                <article key={w.id} className={`cal-day-card cal-day-card--${st}`}>
                  <header className="cal-day-card__head">
                    <div>
                      <h4>{w.name}</h4>
                      <span className={`status-badge status--${st}`}>{statusLabel(st)}</span>
                    </div>
                    <span className="cal-day-card__type">{w.workoutType || 'Treino'}</span>
                  </header>
                  <ul className="cal-day-meta">
                    <li>
                      <strong>Grupos:</strong>{' '}
                      {(w.muscleGroups || []).length ? w.muscleGroups.join(', ') : '—'}
                    </li>
                    <li>
                      <strong>Duração:</strong> {w.estimatedMinutes || 0} min
                    </li>
                    <li>
                      <strong>Exercícios:</strong> {(w.exercises || []).length}
                    </li>
                  </ul>
                  {(w.exercises || []).length > 0 && (
                    <ul className="cal-day-exercises">
                      {w.exercises.slice(0, 8).map((ex, idx) => (
                        <li key={`${w.id}-ex-${idx}`}>
                          {ex.name}
                          {ex.sets ? ` · ${ex.sets}x${ex.reps || ''}` : ''}
                        </li>
                      ))}
                      {w.exercises.length > 8 && (
                        <li className="cal-day-exercises__more">+{w.exercises.length - 8} mais</li>
                      )}
                    </ul>
                  )}
                  {w.notes && <p className="cal-day-notes">{w.notes}</p>}
                  <div className="cal-day-actions">
                    {!w.isRest && st !== 'completed' && (
                      <button type="button" className="btn btn--primary" onClick={() => handleStart(w)}>
                        Iniciar treino
                      </button>
                    )}
                    {!w.isRest && st !== 'completed' && (
                      <button type="button" className="btn btn--ghost" onClick={() => handleMarkDone(w)}>
                        Marcar como realizado
                      </button>
                    )}
                    <button type="button" className="btn btn--ghost" onClick={() => openEdit(w)}>
                      Editar treino
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => openNotes(w)}>
                      Adicionar observação
                    </button>
                    {st !== 'rest' && (
                      <button type="button" className="btn btn--ghost" onClick={() => handleRest(selectedDate)}>
                        Definir como descanso
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
            <div className="cal-day-actions cal-day-actions--footer">
              <button type="button" className="btn btn--ghost" onClick={() => openAdd(selectedDate)}>
                Adicionar outro treino
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / edit modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => {
          setShowAdd(false)
          setEditingId(null)
        }}
        title={editingId ? 'Editar treino' : 'Adicionar treino'}
        size="lg"
      >
        <form className="cal-add-form" onSubmit={submitAdd}>
          <label className="cal-field">
            <span>Data</span>
            <input
              type="date"
              value={addForm.date}
              onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </label>

          {!editingId && (
            <div className="cal-source-tabs">
              <button
                type="button"
                className={addForm.source === 'quick' ? 'is-active' : ''}
                onClick={() => setAddForm((p) => ({ ...p, source: 'quick' }))}
              >
                Criação rápida
              </button>
              <button
                type="button"
                className={addForm.source === 'saved' ? 'is-active' : ''}
                onClick={() => setAddForm((p) => ({ ...p, source: 'saved' }))}
              >
                Treino salvo
              </button>
              <button
                type="button"
                className={addForm.source === 'plan' ? 'is-active' : ''}
                onClick={() => setAddForm((p) => ({ ...p, source: 'plan' }))}
                disabled={!planSource}
              >
                Planilha
              </button>
            </div>
          )}

          {addForm.source === 'saved' && (
            <label className="cal-field">
              <span>Selecionar treino salvo</span>
              <select
                value={addForm.workoutId}
                onChange={(e) => applySavedWorkout(e.target.value)}
              >
                <option value="">Escolha…</option>
                {savedWorkouts.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {addForm.source === 'plan' && planSource?.schedule && (
            <label className="cal-field">
              <span>Dia da planilha</span>
              <select defaultValue="" onChange={(e) => applyPlanDay(Number(e.target.value))}>
                <option value="" disabled>
                  Escolha…
                </option>
                {planSource.schedule.map((day, idx) => (
                  <option key={`${day.day}-${idx}`} value={idx}>
                    {day.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="cal-field">
            <span>Nome do treino</span>
            <input
              type="text"
              value={addForm.workoutName}
              onChange={(e) => setAddForm((p) => ({ ...p, workoutName: e.target.value }))}
              placeholder="Ex.: Push — Peito e Tríceps"
              required
            />
          </label>

          <label className="cal-field">
            <span>Tipo</span>
            <select
              value={addForm.workoutType}
              onChange={(e) => setAddForm((p) => ({ ...p, workoutType: e.target.value }))}
            >
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="cal-field cal-field--muscles">
            <legend>Grupos musculares</legend>
            <div className="cal-muscle-chips">
              {MUSCLE_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`cal-filter-chip ${addForm.muscleGroups.includes(g) ? 'cal-filter-chip--active' : ''}`}
                  onClick={() => toggleMuscle(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="cal-field">
            <span>Duração (min)</span>
            <input
              type="number"
              min={10}
              max={180}
              value={addForm.duration}
              onChange={(e) => setAddForm((p) => ({ ...p, duration: e.target.value }))}
            />
          </label>

          <label className="cal-field">
            <span>Observações</span>
            <textarea
              rows={3}
              value={addForm.notes}
              onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Notas, foco do dia, ajustes…"
            />
          </label>

          <div className="cal-day-actions">
            <button type="submit" className="btn btn--primary">
              {editingId ? 'Salvar alterações' : 'Salvar no calendário'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setShowAdd(false)
                setEditingId(null)
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Notes modal */}
      <Modal
        isOpen={Boolean(noteTargetId)}
        onClose={() => setNoteTargetId(null)}
        title="Observação do treino"
      >
        <label className="cal-field">
          <span>Notas</span>
          <textarea rows={4} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
        </label>
        <div className="cal-day-actions">
          <button type="button" className="btn btn--primary" onClick={saveNotes}>
            Salvar
          </button>
        </div>
      </Modal>

      {/* Sync confirm */}
      <Modal isOpen={syncConfirm} onClose={() => setSyncConfirm(false)} title="Sincronizar planilha">
        <p>
          Isso vai distribuir os treinos da planilha atual nos próximos dias. Entradas não concluídas
          nas datas alvo podem ser substituídas. Treinos já realizados serão mantidos.
        </p>
        {planSource && (
          <p className="cal-sync-plan-name">
            Planilha: <strong>{planSource.name || 'Plano gerado'}</strong> ·{' '}
            {planSource.schedule?.length || 0} dias
          </p>
        )}
        <div className="cal-day-actions">
          <button type="button" className="btn btn--primary" onClick={confirmSyncPlan}>
            Confirmar sincronização
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setSyncConfirm(false)}>
            Cancelar
          </button>
        </div>
      </Modal>
    </section>
  )
}

function MobileDayBlock({ title, block, highlight, compact, onOpen, onStart, onAdd }) {
  const primary = block.primary
  const status = block.status

  return (
    <div
      className={[
        'cal-mobile-card',
        highlight ? 'cal-mobile-card--today' : '',
        compact ? 'cal-mobile-card--compact' : '',
        status ? `cal-mobile-card--${status}` : 'cal-mobile-card--empty',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button type="button" className="cal-mobile-card__main" onClick={() => onOpen(block.date)}>
        <div className="cal-mobile-card__date">
          <span className="cal-mobile-card__title">{title}</span>
          <span className="cal-mobile-card__sub">
            {block.weekday} · {block.date.slice(8)}/{block.date.slice(5, 7)}
          </span>
        </div>
        <div className="cal-mobile-card__info">
          {block.isEmpty ? (
            <span className="cal-mobile-card__empty">Sem treino · toque para planejar</span>
          ) : (
            <>
              <span className="cal-mobile-card__name">{primary?.name}</span>
              <span className={`status-badge status--${status}`}>{statusLabel(status)}</span>
              {primary?.estimatedMinutes > 0 && (
                <span className="cal-mobile-card__meta">{primary.estimatedMinutes} min</span>
              )}
            </>
          )}
        </div>
      </button>
      <div className="cal-mobile-card__actions">
        {!block.isEmpty && primary && !primary.isRest && status !== 'completed' && (
          <button type="button" className="btn btn--primary btn--sm cal-mobile-start" onClick={() => onStart(primary)}>
            Iniciar treino
          </button>
        )}
        {block.isEmpty && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onAdd(block.date)}>
            Adicionar
          </button>
        )}
      </div>
    </div>
  )
}
