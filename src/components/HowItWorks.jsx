import { useState } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'

const STEPS = [
  {
    id: 'planilha',
    tone: 'green',
    icon: '📝',
    step: '01',
    title: 'Criar planilha',
    desc: 'Defina objetivo, nível e dias. Geramos uma divisão equilibrada.',
    cta: 'Montar planilha',
  },
  {
    id: 'treinos',
    tone: 'orange',
    icon: '▶️',
    step: '02',
    title: 'Iniciar treino',
    desc: 'Série a série com carga, descanso e cronômetro no dispositivo.',
    cta: 'Ver meus treinos',
  },
  {
    id: 'coach-ia',
    tone: 'purple',
    icon: '✦',
    step: '03',
    title: 'Coach IA',
    desc: 'Sugestões de treino e ajustes com base na sua rotina.',
    cta: 'Abrir Coach IA',
  },
  {
    id: 'exercicios',
    tone: 'cyan',
    icon: '💪',
    step: '04',
    title: 'Exercícios',
    desc: 'Explore por grupo muscular e adicione à planilha.',
    cta: 'Explorar exercícios',
  },
  {
    id: 'desempenho',
    tone: 'blue',
    icon: '📈',
    step: '05',
    title: 'Desempenho',
    desc: 'Frequência, volume e sequência com indicadores claros.',
    cta: 'Ver desempenho',
  },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <section className="how-it-works how-it-works--compact" aria-labelledby="how-it-works-title">
      <div className="container">
        <div className="how-it-works__intro">
          <SectionTitle
            id="how-it-works-title"
            tag="Como funciona"
            title="Da planilha ao progresso"
            subtitle="Fluxo simples para organizar sua rotina com equilíbrio."
          />
          <button
            type="button"
            className={`disclose-toggle${open ? ' is-open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <span>{open ? 'Ocultar detalhes' : 'Ver mais detalhes'}</span>
            <span aria-hidden="true">{open ? '▲' : '▼'}</span>
          </button>
        </div>

        {open && (
          <>
            <div className="how-it-works__grid">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`hiw-card hiw-card--${s.tone}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="hiw-card__top">
                    <span className="hiw-card__icon" aria-hidden="true">
                      {s.icon}
                    </span>
                    <span className="hiw-card__step" aria-hidden="true">
                      {s.step}
                    </span>
                  </span>
                  <span className="hiw-card__title">{s.title}</span>
                  <span className="hiw-card__desc">{s.desc}</span>
                  <span className="hiw-card__cta">
                    {s.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </button>
              ))}
            </div>

            <p className="hiw-note">
              Este conteúdo é informativo. Respeite seus limites. Em caso de dor, interrompa. Procure
              orientação profissional se tiver lesão ou desconforto.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
