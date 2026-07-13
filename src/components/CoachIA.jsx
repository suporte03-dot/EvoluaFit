import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { getExerciseCache } from '../data/exerciseCache'
import SectionTitle from './SectionTitle'
import {
  askCoach,
  adjustWorkoutPlan,
  clearCoachMessages,
  explainExercise,
  generateWorkoutPlan,
  getTodaySuggestion,
  loadCoachMessages,
  planToWorkouts,
  QUICK_PROMPTS,
  saveCoachMessage,
} from '../services/coachService'

const QUICK_QUESTIONS = [
  'Tenho 30 minutos hoje, o que posso treinar?',
  'Quero treinar em casa com halteres.',
  'O que posso fazer quando estou cansado?',
  'Quero trocar um exercício da minha planilha.',
  'Como organizar treino Push, Pull e Legs?',
  'Qual grupo muscular posso treinar hoje?',
]

const QUICK_ACTIONS = [
  { id: 'plan', label: 'Montar treino', icon: '🏋️' },
  { id: 'today', label: 'O que treinar hoje?', icon: '📅' },
  { id: 'adjust', label: 'Ajustar minha planilha', icon: '⚙️' },
  { id: 'explain', label: 'Explicar exercício', icon: '📖' },
]

function renderAnswer(text) {
  return text.split('\n').map((line, i) => {
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

export default function CoachIA() {
  const { profile, workouts, history, performance, showToast, savePlan, addPlanWorkouts, addWorkoutToPlan } =
    useFitness()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => loadCoachMessages())
  const [lastSuggestion, setLastSuggestion] = useState(null)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const chatEndRef = useRef(null)

  const context = useMemo(
    () => ({ profile, workouts, history, performance }),
    [profile, workouts, history, performance],
  )

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const pushResponse = useCallback((question, result) => {
    const entry = saveCoachMessage(question, result.answer)
    setMessages((prev) => [entry, ...prev.filter((m) => m.id !== entry.id)])
    setLastSuggestion(result.suggestion || null)
  }, [])

  const runCoach = useCallback(
    async (question, handler) => {
      if (loading) return
      setLoading(true)
      setLastSuggestion(null)
      try {
        const result = await handler()
        pushResponse(question, result)
      } catch {
        showToast('Não foi possível obter resposta do Coach. Tente novamente.', 'error')
      } finally {
        setLoading(false)
      }
    },
    [loading, pushResponse, showToast],
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    setInput('')
    runCoach(question, () => askCoach(question, context))
  }

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'plan':
        runCoach(QUICK_PROMPTS.montarTreino, () => generateWorkoutPlan(context))
        break
      case 'today':
        runCoach(QUICK_PROMPTS.hoje, () => getTodaySuggestion(context))
        break
      case 'adjust':
        runCoach(QUICK_PROMPTS.ajustar, () => adjustWorkoutPlan(context, 'trocar'))
        break
      case 'explain':
        setShowExercisePicker(true)
        break
      default:
        break
    }
  }

  const handleExplainExercise = () => {
    if (!selectedExerciseId) {
      showToast('Selecione um exercício.', 'info')
      return
    }
    setShowExercisePicker(false)
    const ex = exerciseOptions.find((e) => e.id === selectedExerciseId)
    runCoach(`Explique o exercício ${ex?.name || ''}`, () => explainExercise(selectedExerciseId, context))
  }

  const handleClear = () => {
    clearCoachMessages()
    setMessages([])
    setLastSuggestion(null)
    showToast('Conversa limpa.', 'info')
  }

  const handleSaveSuggestion = () => {
    if (!lastSuggestion) {
      showToast('Nenhuma sugestão para salvar.', 'info')
      return
    }

    if (lastSuggestion.type === 'plan') {
      savePlan(lastSuggestion.data)
      addPlanWorkouts(planToWorkouts(lastSuggestion.data))
      return
    }

    if (lastSuggestion.type === 'workout') {
      addWorkoutToPlan(lastSuggestion.data)
      return
    }

    if (lastSuggestion.type === 'exercise') {
      addWorkoutToPlan({
        id: `coach-ex-${Date.now()}`,
        name: `Treino — ${lastSuggestion.data.category}`,
        date: new Date().toISOString().split('T')[0],
        muscleGroups: [lastSuggestion.data.category],
        status: 'Pendente',
        estimatedMinutes: 40,
        exercises: [
          {
            exerciseId: lastSuggestion.data.id,
            name: lastSuggestion.data.name,
            muscleGroup: lastSuggestion.data.category,
            sets: 3,
            reps: lastSuggestion.data.reps,
            restSeconds: 60,
            load: '',
          },
        ],
        createdAt: new Date().toISOString(),
      })
    }
  }

  return (
    <section id="coach-ia" className="section section--alt coach-ia">
      <div className="container">
        <SectionTitle
          tag="Inteligência"
          title="Coach IA"
          subtitle="Treinos inteligentes com base na sua rotina, objetivo e histórico."
        />

        <div className="coach-ia__layout">
          <div className="coach-ia__main glass-card">
            <div className="coach-ia__hero">
              <span className="coach-ia__badge" aria-hidden="true">
                ✦
              </span>
              <p>Faça uma pergunta ou use os atalhos abaixo para receber orientação personalizada.</p>
            </div>

            <form className="coach-ia__form" onSubmit={handleSubmit}>
              <label htmlFor="coach-question" className="sr-only">
                Pergunta para o Coach IA
              </label>
              <textarea
                id="coach-question"
                className="coach-ia__input"
                rows={3}
                placeholder="Ex.: Tenho pouco tempo hoje, o que posso treinar?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <div className="coach-ia__form-actions">
                <button type="submit" className="btn btn--primary" disabled={loading || !input.trim()}>
                  {loading ? 'Analisando…' : 'Perguntar'}
                </button>
                {lastSuggestion && (
                  <button type="button" className="btn btn--ghost" onClick={handleSaveSuggestion}>
                    Salvar sugestão na planilha
                  </button>
                )}
                {messages.length > 0 && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={handleClear}>
                    Limpar conversa
                  </button>
                )}
              </div>
            </form>

            <div className="coach-ia__actions">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="coach-ia__action-btn"
                  onClick={() => handleQuickAction(action.id)}
                  disabled={loading}
                >
                  <span aria-hidden="true">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>

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
              {loading && (
                <div className="coach-ia__message coach-ia__message--coach coach-ia__message--loading">
                  <span className="coach-ia__avatar">🤖</span>
                  <div className="coach-ia__bubble">
                    <span className="coach-ia__typing">Coach IA está pensando</span>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="coach-ia__exchange">
                  <div className="coach-ia__message coach-ia__message--user">
                    <div className="coach-ia__bubble">{msg.question}</div>
                  </div>
                  <div className="coach-ia__message coach-ia__message--coach">
                    <span className="coach-ia__avatar" aria-hidden="true">
                      🤖
                    </span>
                    <div className="coach-ia__bubble coach-ia__bubble--answer">{renderAnswer(msg.answer)}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <aside className="coach-ia__sidebar">
            <h3 className="coach-ia__sidebar-title">Perguntas rápidas</h3>
            <div className="coach-ia__quick-list">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="coach-ia__quick-card"
                  onClick={() => runCoach(q, () => askCoach(q, context))}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
