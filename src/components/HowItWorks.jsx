import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'

const STEPS = [
  {
    id: 'planilha',
    tone: 'green',
    icon: '📝',
    step: '01',
    title: 'Criar planilha',
    desc: 'Responda seu objetivo, nível e dias por semana. Geramos uma divisão equilibrada e ajustável.',
    cta: 'Montar planilha',
  },
  {
    id: 'treinos',
    tone: 'orange',
    icon: '▶️',
    step: '02',
    title: 'Iniciar treino',
    desc: 'Execute série a série com carga, repetições, descanso e cronômetro. Tudo salvo no seu dispositivo.',
    cta: 'Ver meus treinos',
  },
  {
    id: 'coach-ia',
    tone: 'purple',
    icon: '✦',
    step: '03',
    title: 'Coach IA',
    desc: 'Peça o que treinar hoje, monte ou ajuste treinos com sugestões baseadas na sua rotina.',
    cta: 'Abrir Coach IA',
  },
  {
    id: 'exercicios',
    tone: 'cyan',
    icon: '💪',
    step: '04',
    title: 'Exercícios',
    desc: 'Explore por grupo muscular, veja demonstrações e adicione movimentos à sua planilha.',
    cta: 'Explorar exercícios',
  },
  {
    id: 'desempenho',
    tone: 'blue',
    icon: '📈',
    step: '05',
    title: 'Desempenho',
    desc: 'Acompanhe frequência, volume e sequência mês a mês, com indicadores claros e honestos.',
    cta: 'Ver desempenho',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-it-works-title">
      <div className="container">
        <SectionTitle
          id="how-it-works-title"
          tag="Como funciona"
          title="Da planilha ao progresso, em 5 passos"
          subtitle="Um fluxo simples e informativo para organizar sua rotina com equilíbrio — sem promessas de resultado rápido."
        />

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
      </div>
    </section>
  )
}
