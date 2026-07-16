import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { getExerciseCache } from '../data/exerciseCache'
import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'
import {
  askCoach,
  adjustWorkoutPlan,
  clearCoachMessages,
  COACH_ACTIONS,
  createHomeWorkoutSuggestion,
  createRecoverySuggestion,
  createShortWorkoutSuggestion,
  EMPTY_EXAMPLES,
  explainExercise,
  generateVariation,
  generateWorkoutSuggestion,
  getCoachSummary,
  getTodaySuggestion,
  loadCoachMessages,
  QUICK_CHIPS,
  saveCoachExchange,
  saveCoachSuggestionToPlan,
} from '../services/coachService'

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDateLabel(iso) {
  if (!iso) return 'Sem registro'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return 'Sem registro'
  }
}

function renderAnswer(text) {
  return String(text || '')
    .split('\n')
    .map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return <br key={i} />
      if (trimmed === '---') return <hr key={i} className="coach-ia__divider" />
      if (trimmed.startsWith('## ')) {
        return (
          <h4 key={i} className="coach-ia__answer-heading">
            {trimmed.replace(/^##\s*/, '')}
          </h4>
        )
      }
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g)
      return (
        <p key={i} className="coach-ia__answer-line">
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              part
            ),
          )}
        </p>
      )
    })
}

const ACTION_LABELS = {
  [COACH_ACTIONS.SAVE]: 'Salvar na planilha',
  [COACH_ACTIONS.START]: 'Iniciar treino',
  [COACH_ACTIONS.RELATED]: 'Ver exercícios relacionados',
  [COACH_ACTIONS.VARIATION]: 'Gerar variação',
  [COACH_ACTIONS.COPY]: 'Copiar sugestão',
}

export default function CoachIA() {
  const {
    profile,
    workouts,
    history,
    performance,
    goals,
    showToast,
    savePlan,
    addPlanWorkouts,
    addWorkoutToPlan,
    addExerciseToPlan,
    startWorkout,
  } = useFitness()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => loadCoachMessages())
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const context = useMemo(
    () => ({ profile, workouts, history, performance, goals }),
    [profile, workouts, history, performance, goals],
  )

  const summary = useMemo(() => getCoachSummary(context), [context])

  const exerciseOptions = useMemo(() => {
    const cached = getExerciseCache()
    if (cached?.length) return cached.map((ex) => ({ id: ex.id, name: ex.name }))
    const fromWorkouts = workouts.flatMap((w) => w.exercises || [])
    const seen = new Set()
    return fromWorkouts
      .filter((ex) => {
        if (seen.has(ex.exerciseId)) return false
        seen.add(ex.exerciseId)
        return true
      })
      .map((ex) => ({ id: ex.exerciseId, name: ex.name }))
  }, [workouts])

  const chronological = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const pushExchange = useCallback((question, result) => {
    const { userMsg, coachMsg } = saveCoachExchange(question, result)
    setMessages((prev) => [coachMsg, userMsg, ...prev.filter((m) => m.id !== userMsg.id && m.id !== coachMsg.id)])
    return coachMsg
  }, [])

  const runCoach = useCallback(
    async (question, handler) => {
      const q = String(question || '').trim()
      if (!q || loading) return
      setLoading(true)
      try {
        const result = await handler()
        pushExchange(q, result)
      } catch {
        showToast('Não foi possível obter resposta do Coach. Tente novamente.', 'error')
      } finally {
        setLoading(false)
      }
    },
    [loading, pushExchange, showToast],
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    setInput('')
    runCoach(question, () => askCoach(question, context))
  }

  const fillAndAsk = (prompt, handler) => {
    setInput(prompt)
    runCoach(prompt, handler)
  }

  const handleChip = (chip) => {
    switch (chip.id) {
      case 'hoje':
        fillAndAsk(chip.prompt, () => getTodaySuggestion(context))
        break
      case 'montar':
        fillAndAsk(chip.prompt, () => generateWorkoutSuggestion(context))
        break
      case 'ajustar':
        fillAndAsk(chip.prompt, () => adjustWorkoutPlan(context, 'trocar'))
        break
      case 'explicar':
        setInput(chip.prompt)
        setShowExercisePicker(true)
        inputRef.current?.focus()
        break
      case 'rapido30':
        fillAndAsk(chip.prompt, () => createShortWorkoutSuggestion(context, 30))
        break
      case 'casa':
        fillAndAsk(chip.prompt, () => createHomeWorkoutSuggestion(context))
        break
      case 'descanso':
        fillAndAsk(chip.prompt, () => createRecoverySuggestion(context))
        break
      default:
        fillAndAsk(chip.prompt, () => askCoach(chip.prompt, context))
    }
  }

  const handleExplainExercise = () => {
    if (!selectedExerciseId) {
      showToast('Selecione um exercício.', 'info')
      return
    }
    setShowExercisePicker(false)
    const ex = exerciseOptions.find((e) => e.id === selectedExerciseId)
    const question = `Explicar exercício: ${ex?.name || selectedExerciseId}`
    setInput('')
    runCoach(question, () => explainExercise(selectedExerciseId, context))
  }

  const handleClear = () => {
    clearCoachMessages()
    setMessages([])
    showToast('Conversa limpa.', 'info')
  }

  const applySuggestion = useCallback(
    (suggestion, mode = 'save') => {
      const payload = saveCoachSuggestionToPlan(suggestion)
      if (!payload) {
        showToast('Nenhuma sugestão para aplicar.', 'info')
        return
      }

      if (payload.kind === 'plan') {
        savePlan(payload.plan)
        addPlanWorkouts(payload.workouts)
        if (mode === 'start' && payload.sampleWorkout) {
          addWorkoutToPlan(payload.sampleWorkout)
          startWorkout(payload.sampleWorkout)
        }
        return
      }

      if (payload.kind === 'workout') {
        addWorkoutToPlan(payload.workout)
        if (mode === 'start') {
          startWorkout(payload.workout)
        }
        return
      }

      if (payload.kind === 'exercise') {
        addExerciseToPlan(payload.exercise)
      }
    },
    [addExerciseToPlan, addPlanWorkouts, addWorkoutToPlan, savePlan, showToast, startWorkout],
  )

  const openRelatedExercises = (muscleGroup) => {
    const group = muscleGroup || summary.recommendedGroup || 'Todos'
    window.dispatchEvent(
      new CustomEvent('evoluafit:filter-exercises', {
        detail: { group },
      }),
    )
    scrollToSection('exercicios')
    showToast(`Filtrando exercícios: ${group}`, 'info')
  }

  const handleMessageAction = async (msg, action) => {
    const suggestion = msg.suggestion
    const workout = msg.relatedWorkout || suggestion?.data || suggestion?.sampleWorkout

    switch (action) {
      case COACH_ACTIONS.SAVE:
        applySuggestion(suggestion || (workout ? { type: 'workout', data: workout } : null), 'save')
        break
      case COACH_ACTIONS.START: {
        const startSuggestion =
          suggestion?.type === 'plan'
            ? { type: 'workout', data: suggestion.sampleWorkout || workout }
            : suggestion || (workout ? { type: 'workout', data: workout } : null)
        if (!startSuggestion?.data && !workout) {
          showToast('Nenhum treino sugerido para iniciar.', 'info')
          return
        }
        applySuggestion(
          startSuggestion?.data ? startSuggestion : { type: 'workout', data: workout },
          'start',
        )
        break
      }
      case COACH_ACTIONS.RELATED:
        openRelatedExercises(msg.relatedMuscleGroup || workout?.muscleGroups?.[0])
        break
      case COACH_ACTIONS.VARIATION:
        await runCoach('Gerar variação do treino sugerido', () =>
          generateVariation(context, workout),
        )
        break
      case COACH_ACTIONS.COPY: {
        const text = msg.content || ''
        try {
          await navigator.clipboard.writeText(text)
          showToast('Sugestão copiada!', 'success')
        } catch {
          showToast('Não foi possível copiar.', 'error')
        }
        break
      }
      default:
        break
    }
  }

  return (
    <section id="coach-ia" className="section section--alt coach-ia">
      <div className="container">
        <div className="coach-ia__header">
          <SectionTitle
            tag="Assistente de treino"
            title="Coach IA"
            subtitle="Sugestões inteligentes a partir da sua rotina, objetivo e histórico — tudo local, sem login e sem chave de API no app."
          />
          <span className="coach-ia__badge-pill">Assistente de treino</span>
        </div>

        <div className="coach-ia__summary" aria-label="Resumo inteligente">
          <article className="coach-ia__summary-card coach-ia__summary-card--next">
            <span className="coach-ia__summary-label">Próxima sugestão</span>
            <strong>{summary.nextSuggestion}</strong>
          </article>
          <article className="coach-ia__summary-card">
            <span className="coach-ia__summary-label">Último treino considerado</span>
            <strong>
              {summary.lastWorkout
                ? `${summary.lastWorkout.name} · ${formatDateLabel(summary.lastWorkout.date)}`
                : 'Nenhum ainda'}
            </strong>
          </article>
          <article className="coach-ia__summary-card coach-ia__summary-card--group">
            <span className="coach-ia__summary-label">Grupo recomendado</span>
            <strong>{summary.recommendedGroup}</strong>
          </article>
          <article className="coach-ia__summary-card coach-ia__summary-card--care">
            <span className="coach-ia__summary-label">Atenção / segurança</span>
            <strong>{summary.attention}</strong>
          </article>
        </div>

        <div className="coach-ia__main glass-card">
          <div className="coach-ia__hero">
            <span className="coach-ia__badge" aria-hidden="true">
              ✦
            </span>
            <div>
              <p className="coach-ia__hero-title">Pergunte ao Coach IA</p>
              <p>
                Use os atalhos ou descreva seu dia. As respostas usam seus treinos salvos, planilhas,
                histórico e perfil — com linguagem segura e realista.
              </p>
            </div>
          </div>

          <div className="coach-ia__chips" role="list" aria-label="Atalhos rápidos">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="listitem"
                className="coach-ia__chip"
                onClick={() => handleChip(chip)}
                disabled={loading}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form className="coach-ia__form" onSubmit={handleSubmit}>
            <label htmlFor="coach-question" className="sr-only">
              Pergunte ao Coach IA sobre seu treino
            </label>
            <textarea
              ref={inputRef}
              id="coach-question"
              className="coach-ia__input"
              rows={3}
              placeholder="Pergunte ao Coach IA sobre seu treino..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <div className="coach-ia__form-actions">
              <button type="submit" className="btn btn--primary coach-ia__btn-send" disabled={loading || !input.trim()}>
                {loading ? 'Analisando…' : 'Enviar'}
              </button>
              {messages.length > 0 && (
                <button type="button" className="btn btn--ghost coach-ia__btn-clear" onClick={handleClear}>
                  Limpar conversa
                </button>
              )}
            </div>
          </form>

          {showExercisePicker && (
            <div className="coach-ia__picker glass-card">
              <h4>Escolha um exercício</h4>
              <select
                className="coach-ia__select"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
              >
                <option value="">Selecione…</option>
                {exerciseOptions.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
              <div className="coach-ia__picker-actions">
                <button type="button" className="btn btn--primary btn--sm" onClick={handleExplainExercise}>
                  Explicar
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowExercisePicker(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="coach-ia__chat" aria-live="polite">
            {chronological.length === 0 && !loading && (
              <div className="coach-ia__empty">
                <div className="coach-ia__empty-icon" aria-hidden="true">
                  ✦
                </div>
                <h3 className="coach-ia__empty-title">Como posso ajudar seu treino hoje?</h3>
                <p className="coach-ia__empty-desc">
                  Escolha um exemplo ou digite sua pergunta. As sugestões são locais e baseadas nos
                  seus dados salvos neste dispositivo.
                </p>
                <div className="coach-ia__empty-examples">
                  {EMPTY_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      className="coach-ia__example-card"
                      onClick={() =>
                        fillAndAsk(ex.prompt, () => askCoach(ex.prompt, context))
                      }
                      disabled={loading}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chronological.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="coach-ia__message coach-ia__message--user">
                  <div className="coach-ia__bubble-wrap">
                    <div className="coach-ia__bubble">{msg.content}</div>
                    <time className="coach-ia__time" dateTime={msg.createdAt}>
                      {formatTime(msg.createdAt)}
                    </time>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="coach-ia__message coach-ia__message--coach">
                  <span className="coach-ia__avatar" aria-hidden="true">
                    ✦
                  </span>
                  <div className="coach-ia__bubble-wrap coach-ia__bubble-wrap--coach">
                    <div className="coach-ia__bubble coach-ia__bubble--answer">
                      {msg.blocks?.title && (
                        <div className="coach-ia__block-meta">
                          <span className="coach-ia__block-title">{msg.blocks.title}</span>
                        </div>
                      )}
                      {renderAnswer(msg.content)}
                      {msg.blocks?.workout?.exercises?.length > 0 && (
                        <div className="coach-ia__workout-card">
                          <div className="coach-ia__workout-card-head">
                            <strong>{msg.blocks.workout.name}</strong>
                            <span>~{msg.blocks.workout.estimatedMinutes || 40} min</span>
                          </div>
                          <ul className="coach-ia__workout-list">
                            {msg.blocks.workout.exercises.map((ex, idx) => (
                              <li key={`${ex.exerciseId || ex.name}-${idx}`}>
                                <span>{ex.name}</span>
                                <span>
                                  {ex.sets}×{ex.reps}
                                  {ex.restSeconds ? ` · ${ex.restSeconds}s` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <time className="coach-ia__time" dateTime={msg.createdAt}>
                      Coach · {formatTime(msg.createdAt)}
                    </time>
                    {Array.isArray(msg.actions) && msg.actions.length > 0 && (
                      <div className="coach-ia__msg-actions">
                        {msg.actions.map((action) => (
                          <button
                            key={`${msg.id}-${action}`}
                            type="button"
                            className={`coach-ia__msg-action ${
                              action === COACH_ACTIONS.START || action === COACH_ACTIONS.SAVE
                                ? 'coach-ia__msg-action--primary'
                                : ''
                            }`}
                            onClick={() => handleMessageAction(msg, action)}
                            disabled={loading}
                          >
                            {ACTION_LABELS[action] || action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className="coach-ia__message coach-ia__message--coach coach-ia__message--loading">
                <span className="coach-ia__avatar" aria-hidden="true">
                  ✦
                </span>
                <div className="coach-ia__bubble">
                  <span className="coach-ia__typing">Coach IA está analisando sua rotina</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
