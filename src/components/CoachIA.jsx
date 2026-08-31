import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { getExerciseCache } from '../data/exerciseCache'
import { scrollToSection } from '../utils/scrollToSection'
import { formatDateShort } from '../utils/dateFormat'
import useCoachVoice from '../hooks/useCoachVoice'
import { cancelSpeech } from '../utils/coachVoice'
import {
  IconBolt,
  IconCalendar,
  IconChart,
  IconDumbbell,
  IconFlame,
  IconShield,
  IconSpark,
  IconTrend,
} from './dashboard/icons'
import coachOrbUrl from '../assets/coach/coach-ai-orb.svg'
import {
  askCoach,
  adjustWorkoutPlan,
  clearCoachMessages,
  COACH_ACTIONS,
  createHomeWorkoutSuggestion,
  createRecoverySuggestion,
  createShortWorkoutSuggestion,
  explainExercise,
  generateVariation,
  generateWorkoutSuggestion,
  getCoachSummary,
  getContextualRecommendations,
  getTodaySuggestion,
  loadCoachMessages,
  EMPTY_EXAMPLES,
  QUICK_CHIPS,
  saveCoachExchange,
  saveCoachSuggestionToPlan,
} from '../services/coachService'
import { getBodyCoachSummary } from '../services/bodyEvolutionService'

const COACH_STYLE_ID = 'evoluafit-coach-page-css'
const COACH_PAGE_CSS = `
.coach-page{--coach-page-gap:.85rem}
.coach-page .container{display:flex;flex-direction:column;gap:var(--coach-page-gap);max-width:1100px}
.coach-page__section-title{margin:0 0 .55rem;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted)}
.coach-page__notices{margin:0;padding:.75rem .95rem;border-radius:12px;border:1px solid rgba(148,163,184,.22);background:rgba(8,18,35,.55)}
.coach-page__notices>summary{cursor:pointer;font-weight:700;font-size:.86rem;color:#e2e8f0;list-style:none}
.coach-page__notices>summary::-webkit-details-marker{display:none}
.coach-page__notices[open]>summary{margin-bottom:.75rem}
.coach-page__notices .coach-notice{margin-top:.55rem}
.coach-ia__empty-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}
.coach-ia__picker-empty{display:grid;gap:.75rem}
.coach-ia__picker-empty p{margin:0;color:rgba(186,198,216,.95);font-size:.9rem;line-height:1.45}
.coach-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(140px,.85fr);align-items:center;gap:1rem;min-height:200px;padding:1.75rem 1.85rem;border-radius:var(--radius,16px);border:1px solid rgba(255,90,61,.28);background:linear-gradient(115deg,#070a0f 0%,#121923 48%,#070a0f 100%);box-shadow:inset 0 1px 0 rgba(255,138,106,.08),0 18px 40px rgba(0,0,0,.28);overflow:hidden}
.coach-hero__copy{position:relative;z-index:2;max-width:36rem}
.coach-hero__label{margin:0 0 .45rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3578ff}
.coach-hero__title{margin:0 0 .65rem;font-size:clamp(1.85rem,3.2vw,2.55rem);font-weight:800;letter-spacing:-.02em;line-height:1.1;color:#f8fafc}
.coach-hero__subtitle{margin:0;max-width:34ch;font-size:.95rem;line-height:1.55;color:rgba(186,198,214,.92)}
.coach-hero__art{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;min-height:160px}
.coach-hero__fade{position:absolute;inset:0 auto 0 -40%;width:55%;background:linear-gradient(90deg,#121923 0%,transparent 100%);pointer-events:none;z-index:2}
.coach-orb{position:relative;width:min(100%,220px);aspect-ratio:1;display:grid;place-items:center}
.coach-orb__img{position:relative;z-index:2;width:100%;height:auto;filter:drop-shadow(0 0 22px rgba(255,90,61,.35));animation:coachOrbFloat 6.5s ease-in-out infinite}
.coach-orb__glow{position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle,rgba(255,90,61,.35) 0%,transparent 70%);filter:blur(8px);animation:coachOrbPulse 4.5s ease-in-out infinite}
.coach-orb__pulse{position:absolute;inset:8%;border-radius:50%;border:1px solid rgba(255,138,106,.22);animation:coachOrbRing 5s ease-out infinite}
.coach-orb__particle{position:absolute;width:5px;height:5px;border-radius:50%;background:#ff8a6a;box-shadow:0 0 10px rgba(255,138,106,.8);z-index:3;animation:coachParticle 5.5s ease-in-out infinite}
.coach-orb__particle--1{top:18%;right:22%}
.coach-orb__particle--2{bottom:24%;left:18%;width:3px;height:3px;animation-delay:1.2s}
.coach-orb__particle--3{top:42%;right:8%;width:4px;height:4px;animation-delay:2.4s}
@keyframes coachOrbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes coachOrbPulse{0%,100%{opacity:.55;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
@keyframes coachOrbRing{0%{opacity:.55;transform:scale(.92)}70%,100%{opacity:0;transform:scale(1.12)}}
@keyframes coachParticle{0%,100%{transform:translate(0,0);opacity:.45}50%{transform:translate(-6px,-8px);opacity:1}}
.coach-context{margin:0}
.coach-context__chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.55rem}
.coach-context__chip{display:inline-flex;align-items:center;gap:.45rem;min-height:2.5rem;max-width:100%;padding:.5rem .85rem;border-radius:12px;border:1px solid rgba(167,139,250,.32);background:linear-gradient(160deg,rgba(76,29,149,.45),rgba(15,10,30,.85));color:rgba(226,232,240,.95);font-size:.8rem;line-height:1.35;transition:border-color .15s ease,transform .15s ease}
.coach-context__chip:hover{border-color:rgba(167,139,250,.55);transform:translateY(-1px)}
.coach-context__icon{display:inline-flex;color:#c4b5fd;flex-shrink:0}
.coach-context__text{min-width:0;overflow-wrap:anywhere}
.coach-context__k{font-weight:700;color:#ddd6fe}
.coach-notice{display:flex;align-items:flex-start;gap:.65rem;width:100%;margin:0;padding:.75rem .95rem;border-radius:12px;box-sizing:border-box}
.coach-notice__icon{display:inline-flex;flex-shrink:0;margin-top:.1rem}
.coach-notice__text{margin:0;font-size:.86rem;line-height:1.45;color:rgba(226,232,240,.92)}
.coach-notice--safety{border:1px solid rgba(249,115,22,.55);background:linear-gradient(135deg,rgba(124,45,18,.28),rgba(15,23,42,.75))}
.coach-notice--safety .coach-notice__icon{color:#fb923c}
.coach-notice--privacy{border:1px solid rgba(255,90,61,.4);background:linear-gradient(135deg,rgba(8,47,73,.45),rgba(8,18,35,.85))}
.coach-notice--privacy .coach-notice__icon{color:#ff8a6a}
.coach-notice--privacy .coach-notice__text{color:rgba(148,183,204,.95)}
.coach-recs-panel{margin:.15rem 0 .35rem}
.coach-recs-panel__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem;align-items:stretch}
.coach-rec{display:flex;flex-direction:column;gap:.7rem;height:100%;padding:1.15rem 1.2rem;border-radius:14px;border:1px solid rgba(255,90,61,.18);background:linear-gradient(165deg,rgba(12,28,48,.95) 0%,rgba(6,14,28,.98) 100%);box-shadow:0 0 0 1px rgba(255,90,61,.04),0 12px 28px rgba(0,0,0,.22);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.coach-rec:hover{transform:translateY(-2px);border-color:rgba(255,90,61,.35);box-shadow:0 0 24px rgba(255,90,61,.08),0 14px 32px rgba(0,0,0,.28)}
.coach-rec.is-applied{opacity:.72}
.coach-rec__head{display:flex;align-items:flex-start;gap:.65rem}
.coach-rec__icon{display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:10px;border:1px solid rgba(255,90,61,.28);background:rgba(255,90,61,.08);color:#ff8a6a;flex-shrink:0}
.coach-rec__title{margin:.15rem 0 0;font-size:1.05rem;font-weight:750;line-height:1.3;color:#f1f5f9}
.coach-rec__block{display:grid;gap:.2rem}
.coach-rec__k{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(148,163,184,.95)}
.coach-rec__body{margin:0;font-size:.88rem;line-height:1.45;color:rgba(203,213,225,.95)}
.coach-rec__actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:auto;padding-top:.25rem}
.coach-rec__btn{min-height:2.5rem;padding:.5rem 1rem;border-radius:10px;font:inherit;font-size:.86rem;font-weight:750;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,background .15s ease,border-color .15s ease}
.coach-rec__btn:focus-visible{outline:2px solid rgba(255,90,61,.7);outline-offset:2px}
.coach-rec__btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
.coach-rec__btn--apply{border:none;background:linear-gradient(135deg,#00e58f 0%,#00d9ff 100%);color:#04101f;box-shadow:0 6px 18px rgba(0,229,143,.2)}
.coach-rec__btn--apply:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,90,61,.28)}
.coach-rec__btn--ignore{border:1px solid rgba(148,163,184,.35);background:rgba(8,18,35,.75);color:#f8fafc}
.coach-rec__btn--ignore:hover:not(:disabled){border-color:rgba(148,163,184,.55);background:rgba(30,41,59,.85)}
.coach-recs-empty{padding:1.1rem 1.15rem;border-radius:14px;border:1px dashed rgba(148,163,184,.35);background:rgba(8,18,35,.45)}
.coach-recs-empty p{margin:0 0 .75rem;color:var(--text-secondary,#94a3b8);font-size:.9rem;line-height:1.45}
.coach-recs-empty__actions{display:flex;flex-wrap:wrap;gap:.5rem}
.coach-page .coach-ia__main{margin-top:.35rem}
@media (max-width:900px){.coach-hero{grid-template-columns:1fr;padding:1.35rem 1.25rem 1.5rem;min-height:0}.coach-hero__art{order:-1;min-height:140px}.coach-hero__fade{display:none}.coach-orb{width:min(160px,48vw)}.coach-recs-panel__grid{grid-template-columns:1fr}}
@media (max-width:640px){.coach-page{--coach-page-gap:.7rem}.coach-hero{padding:1.15rem 1rem 1.25rem}.coach-hero__subtitle{max-width:none;font-size:.9rem}.coach-context__chips{flex-direction:column;align-items:stretch}.coach-context__chip{width:100%;box-sizing:border-box}.coach-notice{padding:.65rem .8rem}.coach-notice__text{font-size:.82rem}.coach-rec__actions{flex-direction:column}.coach-rec__btn{width:100%;min-height:48px}.coach-page .coach-context__chips{flex-wrap:wrap;overflow-x:visible}}
@media (prefers-reduced-motion:reduce){.coach-orb__img,.coach-orb__glow,.coach-orb__pulse,.coach-orb__particle,.coach-rec,.coach-context__chip,.coach-rec__btn{animation:none!important;transition:none!important}.coach-rec:hover,.coach-context__chip:hover,.coach-rec__btn--apply:hover:not(:disabled){transform:none}}
`

function ensureCoachPageStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(COACH_STYLE_ID)) return
  const el = document.createElement('style')
  el.id = COACH_STYLE_ID
  el.textContent = COACH_PAGE_CSS
  document.head.appendChild(el)
}

function IconTarget({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function CoachOrb({ className = '', size = 200 }) {
  return (
    <div className={`coach-orb ${className}`.trim()} aria-hidden="true">
      <span className="coach-orb__glow" />
      <span className="coach-orb__pulse" />
      <img
        src={coachOrbUrl}
        alt=""
        className="coach-orb__img"
        width={size}
        height={size}
        decoding="async"
      />
      <span className="coach-orb__particle coach-orb__particle--1" />
      <span className="coach-orb__particle coach-orb__particle--2" />
      <span className="coach-orb__particle coach-orb__particle--3" />
    </div>
  )
}

function CoachHero() {
  return (
    <header className="coach-hero">
      <div className="coach-hero__copy">
        <p className="coach-hero__label">Assistente da planilha</p>
        <h2 className="coach-hero__title">Coach</h2>
        <p className="coach-hero__subtitle">
          Sugestões com base no que está neste aparelho e na sua planilha — sem modelo externo.
        </p>
      </div>
      <div className="coach-hero__art">
        <div className="coach-hero__fade" aria-hidden="true" />
        <CoachOrb size={220} />
      </div>
    </header>
  )
}

function formatLastWorkout(lastWorkout) {
  if (!lastWorkout) return 'Nenhum treino recente registrado.'
  const name = lastWorkout.name || 'Treino anterior'
  const date = lastWorkout.date ? formatDateShort(lastWorkout.date) : null
  return date ? `${name} · ${date}` : name
}

function CoachContextChips({ summary, profile }) {
  const objective = profile?.objective || summary?.objective
  const level = profile?.level || summary?.level
  const chips = [
    {
      id: 'level',
      Icon: IconTrend,
      label: 'Nível',
      value: level || 'Ainda não definido — complete o perfil',
    },
    {
      id: 'goal',
      Icon: IconTarget,
      label: 'Objetivo',
      value: objective || 'Defina um objetivo para personalizar as sugestões',
    },
    {
      id: 'last',
      Icon: IconCalendar,
      label: 'Último treino',
      value: formatLastWorkout(summary?.lastWorkout),
    },
    {
      id: 'week',
      Icon: IconDumbbell,
      label: 'Treinos recentes',
      value:
        summary?.weeklyWorkouts > 0
          ? `${summary.weeklyWorkouts} esta semana`
          : 'Nenhum treino nesta semana ainda',
    },
    {
      id: 'streak',
      Icon: IconFlame,
      label: 'Sequência',
      value:
        summary?.streak > 0
          ? `${summary.streak} ${summary.streak === 1 ? 'dia' : 'dias'} seguidos`
          : 'Comece hoje para acender a sequência',
    },
    {
      id: 'suggestion',
      Icon: IconBolt,
      label: 'Sugestão agora',
      value: summary?.nextSuggestion || 'Monte uma planilha para receber uma sugestão',
    },
  ]

  return (
    <section className="coach-context" aria-label="O que seu Coach sabe sobre você">
      <h3 className="coach-page__section-title">O que seu Coach sabe sobre você</h3>
      <p className="coach-context__lead">
        Essas informações entram em cada resposta. Nada fica escondido.
      </p>
      <ul className="coach-context__chips">
        {chips.map(({ id, Icon, label, value }) => (
          <li key={id} className="coach-context__chip">
            <span className="coach-context__icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <span className="coach-context__text">
              <span className="coach-context__k">{label}:</span> {value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CoachSafetyNotice() {
  return (
    <aside className="coach-notice coach-notice--safety" role="note">
      <span className="coach-notice__icon" aria-hidden="true">
        <IconFlame size={18} />
      </span>
      <p className="coach-notice__text">
        Respeite limites, aqueça bem e pare se sentir dor. Progresso consistente vale mais que
        intensidade excessiva.
      </p>
    </aside>
  )
}

function CoachPrivacyNotice({ voiceSupported = true }) {
  const text = voiceSupported
    ? 'Voz: reconhecimento pelo navegador — áudio não enviado aos nossos servidores.'
    : 'Voz indisponível neste navegador. Você pode continuar digitando; nada de áudio é enviado aos servidores EvoluaFit.'

  return (
    <aside className="coach-notice coach-notice--privacy" role="note">
      <span className="coach-notice__icon" aria-hidden="true">
        <IconShield size={18} />
      </span>
      <p className="coach-notice__text">{text}</p>
    </aside>
  )
}

function pickRecIcon(rec) {
  const id = rec?.id || ''
  if (id.includes('return') || id.includes('week')) return IconTrend
  if (id.includes('volume') || id.includes('recovery')) return IconChart
  if (id.includes('start') || id.includes('plan')) return IconSpark
  return IconDumbbell
}

function CoachRecommendationCard({ rec, applying, applied, onApply, onIgnore, disabled }) {
  const Icon = pickRecIcon(rec)
  return (
    <article className={`coach-rec${applied ? ' is-applied' : ''}`}>
      <div className="coach-rec__head">
        <span className="coach-rec__icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <h4 className="coach-rec__title">{rec.title}</h4>
      </div>
      <div className="coach-rec__block">
        <span className="coach-rec__k">Por quê</span>
        <p className="coach-rec__body">{rec.reason}</p>
      </div>
      <div className="coach-rec__block">
        <span className="coach-rec__k">Impacto</span>
        <p className="coach-rec__body">{rec.impact}</p>
      </div>
      <div className="coach-rec__actions">
        <button
          type="button"
          className="coach-rec__btn coach-rec__btn--apply"
          onClick={() => onApply?.(rec)}
          disabled={disabled || applying || applied}
          aria-busy={applying || undefined}
        >
          {applied ? 'Aplicado' : applying ? 'Aplicando…' : 'Aplicar'}
        </button>
        <button
          type="button"
          className="coach-rec__btn coach-rec__btn--ignore"
          onClick={() => onIgnore?.(rec)}
          disabled={disabled || applying || applied}
        >
          Ignorar
        </button>
      </div>
    </article>
  )
}

function CoachRecommendations({
  recommendations = [],
  applyingId = null,
  appliedIds,
  onApply,
  onIgnore,
  disabled = false,
}) {
  const applied = appliedIds instanceof Set ? appliedIds : new Set()

  return (
    <section className="coach-recs-panel" aria-label="Recomendações do Coach">
      <h3 className="coach-page__section-title">Recomendações com base no seu histórico</h3>
      {recommendations.length === 0 ? (
        <div className="coach-recs-empty" role="status">
          <p>
            Seu histórico ainda não possui dados suficientes para recomendações personalizadas.
          </p>
          <div className="coach-recs-empty__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => scrollToSection('treinos')}>
              Ver treinos
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => scrollToSection('planilha')}>
              Criar planilha
            </button>
          </div>
        </div>
      ) : (
        <div className="coach-recs-panel__grid">
          {recommendations.map((rec) => (
            <CoachRecommendationCard
              key={rec.id}
              rec={rec}
              applying={applyingId === rec.id}
              applied={applied.has(rec.id)}
              onApply={onApply}
              onIgnore={onIgnore}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </section>
  )
}

ensureCoachPageStyles()

const MAIN_CHIP_IDS = ['hoje', 'montar', 'explicar', 'ajustar']

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
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
  const { user } = useAuth()
  const { profile: cloudProfile } = useProfile()
  const [bodyEvolution, setBodyEvolution] = useState(null)

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => loadCoachMessages())
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [ignoredRecs, setIgnoredRecs] = useState(() => new Set())
  const [applyingId, setApplyingId] = useState(null)
  const [appliedIds, setAppliedIds] = useState(() => new Set())
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (!user?.id) {
      setBodyEvolution(null)
      return undefined
    }
    let active = true
    getBodyCoachSummary(user.id).then(({ data }) => {
      if (active) setBodyEvolution(data)
    })
    return () => {
      active = false
    }
  }, [user?.id])

  const coachProfile = useMemo(
    () => ({
      ...profile,
      name: cloudProfile?.full_name || profile?.name,
      objective: cloudProfile?.goal || profile?.objective,
      level: cloudProfile?.level || profile?.level,
    }),
    [profile, cloudProfile],
  )

  const context = useMemo(
    () => ({ profile: coachProfile, workouts, history, performance, goals, bodyEvolution }),
    [coachProfile, workouts, history, performance, goals, bodyEvolution],
  )

  const summary = useMemo(() => getCoachSummary(context), [context])
  const recommendations = useMemo(
    () => getContextualRecommendations(context).filter((c) => !ignoredRecs.has(c.id)),
    [context, ignoredRecs],
  )

  const mainChips = useMemo(
    () => QUICK_CHIPS.filter((c) => MAIN_CHIP_IDS.includes(c.id)),
    [],
  )
  const extraChips = useMemo(
    () => QUICK_CHIPS.filter((c) => !MAIN_CHIP_IDS.includes(c.id)),
    [],
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

  const chronological = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, [messages])

  useEffect(() => {
    ensureCoachPageStyles()
  }, [])

  useEffect(() => {
    const end = chatEndRef.current
    if (!end) return
    const panel = end.closest('.coach-ia__chat')
    if (panel) {
      panel.scrollTop = panel.scrollHeight
      return
    }
    end.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, loading])

  const pushExchange = useCallback((question, result) => {
    const { userMsg, coachMsg } = saveCoachExchange(question, result)
    setMessages((prev) => [coachMsg, userMsg, ...prev.filter((m) => m.id !== userMsg.id && m.id !== coachMsg.id)])
    return coachMsg
  }, [])

  const speakCoachReplyRef = useRef(null)
  const markIdleRef = useRef(null)

  const runCoach = useCallback(
    async (question, handler) => {
      const q = String(question || '').trim()
      if (!q || loadingRef.current) return
      loadingRef.current = true
      setLoading(true)
      try {
        const result = await handler()
        pushExchange(q, result)
        loadingRef.current = false
        setLoading(false)
        markIdleRef.current?.()
        void speakCoachReplyRef.current?.(result)
      } catch {
        showToast('Não foi possível obter resposta do Coach. Tente novamente.', 'error')
        loadingRef.current = false
        setLoading(false)
        markIdleRef.current?.()
      }
    },
    [pushExchange, showToast],
  )

  const handleVoiceTranscript = useCallback(
    (transcript) => {
      const q = String(transcript || '').trim()
      if (!q) {
        markIdleRef.current?.()
        return
      }
      setInput(q)
      runCoach(q, () => askCoach(q, context))
      setInput('')
    },
    [context, runCoach],
  )

  const {
    voiceState,
    interimText,
    error: voiceError,
    supported: voiceSupported,
    ttsSupported,
    ttsEnabled,
    setSpeakReplies,
    toggleListening,
    stopListening,
    speakCoachReply,
    markIdle,
    clearError: clearVoiceError,
  } = useCoachVoice({ onTranscript: handleVoiceTranscript })

  speakCoachReplyRef.current = speakCoachReply
  markIdleRef.current = markIdle

  const handleSubmit = (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question) return
    setInput('')
    stopListening()
    runCoach(question, () => askCoach(question, context))
  }

  const voiceStatusLabel =
    voiceState === 'listening'
      ? 'Ouvindo… fale agora'
      : voiceState === 'processing'
        ? 'Processando sua pergunta…'
        : voiceSupported
          ? 'Toque no microfone para perguntar por voz'
          : 'Voz indisponível neste navegador — use o teclado'

  const voiceErrorMessage =
    voiceError === 'unsupported'
      ? 'Este navegador não oferece reconhecimento de fala. Continue digitando.'
      : voiceError === 'permission'
        ? 'Permissão de microfone negada. Ative nas configurações do navegador ou digite.'
        : voiceError === 'no-speech'
          ? 'Não captamos fala. Toque no microfone e tente de novo.'
          : voiceError === 'error'
            ? 'Falha no reconhecimento. Tente de novo ou digite.'
            : null

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
    stopListening()
    cancelSpeech()
    clearCoachMessages()
    setMessages([])
    showToast('Conversa limpa.', 'info')
  }

  const applySuggestion = useCallback(
    (suggestion, mode = 'save') => {
      const payload = saveCoachSuggestionToPlan(suggestion)
      if (!payload) {
        showToast('Nenhuma sugestão para aplicar.', 'info')
        return false
      }

      if (payload.kind === 'plan') {
        savePlan(payload.plan)
        addPlanWorkouts(payload.workouts)
        if (mode === 'start' && payload.sampleWorkout) {
          addWorkoutToPlan(payload.sampleWorkout)
          startWorkout(payload.sampleWorkout)
        }
        showToast('Sugestão aplicada à planilha.', 'success')
        return true
      }

      if (payload.kind === 'workout') {
        addWorkoutToPlan(payload.workout)
        if (mode === 'start') {
          startWorkout(payload.workout)
        }
        showToast(mode === 'start' ? 'Treino iniciado.' : 'Treino adicionado à planilha.', 'success')
        return true
      }

      if (payload.kind === 'exercise') {
        addExerciseToPlan(payload.exercise)
        showToast('Exercício adicionado.', 'success')
        return true
      }

      return false
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

  const handleApplyRecommendation = (rec) => {
    if (!rec || applyingId) return

    if (rec.suggestion) {
      if (
        !window.confirm(
          'Aplicar esta sugestão à sua planilha? Nada é alterado sem a sua confirmação.',
        )
      ) {
        return
      }
      setApplyingId(rec.id)
      try {
        const ok = applySuggestion(
          rec.suggestion,
          rec.action === 'start_workout' ? 'start' : 'save',
        )
        if (ok) {
          setAppliedIds((prev) => new Set([...prev, rec.id]))
          setIgnoredRecs((prev) => new Set([...prev, rec.id]))
        }
      } finally {
        setApplyingId(null)
      }
      return
    }

    if (rec.action === 'plan') {
      scrollToSection('planilha')
      return
    }
    if (rec.action === 'short') {
      fillAndAsk(QUICK_CHIPS.find((c) => c.id === 'rapido30')?.prompt || 'Treino rápido', () =>
        createShortWorkoutSuggestion(context, 30),
      )
      return
    }
    if (rec.action === 'recovery') {
      fillAndAsk(QUICK_CHIPS.find((c) => c.id === 'descanso')?.prompt || 'Descanso', () =>
        createRecoverySuggestion(context),
      )
      return
    }
    if (rec.action === 'adjust') {
      fillAndAsk(QUICK_CHIPS.find((c) => c.id === 'ajustar')?.prompt || 'Ajustar', () =>
        adjustWorkoutPlan(context, 'trocar'),
      )
    }
  }

  const handleIgnoreRecommendation = (rec) => {
    if (!rec) return
    setIgnoredRecs((prev) => new Set([...prev, rec.id]))
    showToast('Recomendação ignorada.', 'info')
  }

  return (
    <section id="coach-ia" className="section section--alt coach-ia coach-page">
      <div className="container">
        <CoachHero />

        <div className="coach-ia__main glass-card">
          <form className="coach-ia__form" onSubmit={handleSubmit}>
            <label htmlFor="coach-question" className="sr-only">
              Pergunte ao Coach sobre seu treino
            </label>
            <div className="coach-ia__input-row">
              <textarea
                ref={inputRef}
                id="coach-question"
                className="coach-ia__input"
                rows={2}
                placeholder={
                  voiceState === 'listening'
                    ? 'Ouvindo… diga, por exemplo: o que treino hoje?'
                    : 'Ex.: Monte um treino de costas de 40 min · ou use o microfone'
                }
                value={interimText && voiceState === 'listening' ? interimText : input}
                onChange={(e) => {
                  if (voiceState === 'listening') stopListening()
                  setInput(e.target.value)
                }}
                disabled={loading || voiceState === 'processing'}
                aria-describedby="coach-voice-status"
              />
              <button
                type="button"
                className={`coach-ia__mic${voiceState === 'listening' ? ' is-listening' : ''}${
                  voiceState === 'processing' ? ' is-processing' : ''
                }${!voiceSupported ? ' is-unsupported' : ''}`}
                onClick={toggleListening}
                disabled={loading || voiceState === 'processing' || !voiceSupported}
                aria-label={
                  voiceState === 'listening'
                    ? 'Parar de ouvir'
                    : voiceSupported
                      ? 'Falar com o Coach'
                      : 'Reconhecimento de voz indisponível'
                }
                aria-pressed={voiceState === 'listening'}
                title={
                  voiceSupported
                    ? 'Modo voz — microfone só é pedido ao tocar'
                    : 'Navegador sem reconhecimento de fala'
                }
              >
                {voiceState === 'listening' ? (
                  <span className="coach-ia__mic-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                ) : voiceState === 'processing' ? (
                  <span className="coach-ia__mic-spin" aria-hidden="true" />
                ) : (
                  <span className="coach-ia__mic-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            <div className="coach-ia__voice-bar" aria-live="polite">
              <p id="coach-voice-status" className="coach-ia__voice-status">
                {voiceStatusLabel}
              </p>
              <div className="coach-ia__voice-toggles">
                {ttsSupported && (
                  <label className="coach-ia__tts-toggle">
                    <input
                      type="checkbox"
                      checked={ttsEnabled}
                      onChange={(e) => setSpeakReplies(e.target.checked)}
                    />
                    <span>Ouvir respostas</span>
                  </label>
                )}
              </div>
            </div>
            {voiceErrorMessage && (
              <p className="coach-ia__voice-error" role="status">
                {voiceErrorMessage}{' '}
                <button type="button" className="coach-ia__voice-error-dismiss" onClick={clearVoiceError}>
                  Entendi
                </button>
              </p>
            )}

            <div className="coach-ia__form-actions">
              <button
                type="submit"
                className="btn btn--primary coach-ia__btn-send"
                disabled={loading || !input.trim()}
              >
                {loading ? 'Analisando…' : 'Perguntar'}
              </button>
              {messages.length > 0 && (
                <button type="button" className="btn btn--ghost coach-ia__btn-clear" onClick={handleClear}>
                  Limpar conversa
                </button>
              )}
            </div>
          </form>

          <div className="coach-ia__main-actions" role="list" aria-label="Ações principais">
            {mainChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="listitem"
                className="coach-ia__main-btn"
                onClick={() => handleChip(chip)}
                disabled={loading}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="coach-ia__more">
            <button
              type="button"
              className={`disclose-toggle disclose-toggle--inline${moreOpen ? ' is-open' : ''}`}
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="coach-more-chips"
            >
              <span>{moreOpen ? 'Ocultar sugestões' : 'Mais sugestões'}</span>
              <span aria-hidden="true">{moreOpen ? '▲' : '▼'}</span>
            </button>
            {moreOpen && (
              <div id="coach-more-chips" className="coach-ia__chips" role="list">
                {extraChips.map((chip) => (
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
            )}
          </div>

          {showExercisePicker && (
            <div className="coach-ia__picker glass-card">
              <h4>Escolha um exercício</h4>
              {exerciseOptions.length === 0 ? (
                <div className="coach-ia__picker-empty">
                  <p>Nenhum exercício disponível ainda. Abra a Biblioteca para explorar o catálogo.</p>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      setShowExercisePicker(false)
                      scrollToSection('exercicios')
                    }}
                  >
                    Ir para Biblioteca
                  </button>
                </div>
              ) : (
                <>
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
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={handleExplainExercise}
                      disabled={!selectedExerciseId}
                    >
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
                </>
              )}
            </div>
          )}

          <div className="coach-ia__chat" aria-live="polite">
            {chronological.length === 0 && !loading && (
              <div className="coach-ia__empty coach-ia__empty--example">
                <p className="coach-ia__empty-title">Comece por aqui</p>
                <p className="coach-ia__empty-desc">
                  Toque em um atalho ou digite/fale sua pergunta. As respostas usam sua planilha e
                  histórico neste aparelho.
                </p>
                <div className="coach-ia__empty-actions" role="list">
                  {EMPTY_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      role="listitem"
                      className="coach-ia__chip"
                      disabled={loading}
                      onClick={() => {
                        const chip = QUICK_CHIPS.find((c) => c.prompt === ex.prompt) || {
                          id: ex.label,
                          label: ex.label,
                          prompt: ex.prompt,
                        }
                        handleChip(chip)
                      }}
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
                    <div className="coach-ia__bubble coach-ia__bubble--answer coach-ia__answer-card">
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
                  <span className="coach-ia__typing">Consultando sua planilha…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        <details className="coach-page__notices">
          <summary>Avisos de segurança e privacidade</summary>
          <CoachSafetyNotice />
          <CoachPrivacyNotice voiceSupported={voiceSupported} />
        </details>

        <CoachContextChips summary={summary} profile={coachProfile} />
        <CoachRecommendations
          recommendations={recommendations.slice(0, 2)}
          applyingId={applyingId}
          appliedIds={appliedIds}
          onApply={handleApplyRecommendation}
          onIgnore={handleIgnoreRecommendation}
          disabled={loading}
        />
      </div>
    </section>
  )
}
