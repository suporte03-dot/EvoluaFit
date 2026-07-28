import { useState } from 'react'
import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'
import ModuleHelpGuide from './ModuleHelpGuide'

const STEPS = [
  {
    id: 'planilha',
    tone: 'green',
    icon: '📝',
    step: '01',
    title: 'Criar planilha',
    desc: 'Defina objetivo, nível e dias.',
    cta: 'Montar planilha',
  },
  {
    id: 'treinos',
    tone: 'orange',
    icon: '▶️',
    step: '02',
    title: 'Iniciar treino',
    desc: 'Série a série com carga e descanso.',
    cta: 'Ver meus treinos',
  },
  {
    id: 'coach-ia',
    tone: 'purple',
    icon: '✦',
    step: '03',
    title: 'Coach IA',
    desc: 'Sugestões com base na sua rotina.',
    cta: 'Abrir Coach IA',
  },
  {
    id: 'desempenho',
    tone: 'blue',
    icon: '📈',
    step: '04',
    title: 'Evolução',
    desc: 'Frequência, volume e recordes.',
    cta: 'Ver evolução',
  },
]

export default function HowItWorks() {
  const [flowOpen, setFlowOpen] = useState(false)

  return (
    <section
      id="ajuda"
      className="how-it-works how-it-works--compact how-it-works--help"
      aria-labelledby="how-it-works-title"
    >
      <div className="container">
        <div className="how-it-works__intro">
          <SectionTitle
            id="how-it-works-title"
            tag="Ajuda"
            title="Central de ajuda"
            subtitle={
              <>
                <span className="copy-desktop">
                  Entenda cada módulo do EvoluaFit e saiba o que fazer em seguida.
                </span>
                <span className="copy-mobile">Explicações rápidas dos módulos.</span>
              </>
            }
          />
        </div>

        <ModuleHelpGuide />

        <div className="module-help__flow">
          <button
            type="button"
            className={`disclose-toggle${flowOpen ? ' is-open' : ''}`}
            onClick={() => setFlowOpen((o) => !o)}
            aria-expanded={flowOpen}
          >
            <span>{flowOpen ? 'Ocultar fluxo rápido' : 'Ver fluxo rápido'}</span>
            <span aria-hidden="true">{flowOpen ? '▲' : '▼'}</span>
          </button>

          {flowOpen && (
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
                Conteúdo informativo. Respeite seus limites. Em caso de dor, interrompa e procure
                orientação profissional.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
