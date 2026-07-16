import { useFitness } from '../context/FitnessContext'
import { scrollToSection } from '../utils/scrollToSection'
import { muscleGroups } from '../data/exercisesData'
import { BRAND } from '../data/siteData'

const STAT_META = {
  week: {
    label: 'Treinos na semana',
    desc: 'Frequência dos últimos 7 dias',
    icon: '📅',
    tone: 'cyan',
    target: 'desempenho',
  },
  monthly: {
    label: 'Desempenho mensal',
    desc: 'Volume e consistência do mês',
    icon: '📈',
    tone: 'green',
    target: 'desempenho',
  },
  muscles: {
    label: 'Grupos musculares',
    desc: 'Diversidade do seu treino',
    icon: '💪',
    tone: 'purple',
    target: 'exercicios',
  },
  next: {
    label: 'Próximo treino',
    desc: 'Sua próxima sessão agendada',
    icon: '⚡',
    tone: 'orange',
    target: 'treinos',
  },
}

export default function Hero() {
  const { performance } = useFitness()

  const stats = [
    {
      key: 'week',
      ...STAT_META.week,
      value: performance.weeklyWorkouts,
      isText: false,
    },
    {
      key: 'monthly',
      ...STAT_META.monthly,
      value: `${performance.monthlyWorkouts} treinos`,
      isText: false,
    },
    {
      key: 'muscles',
      ...STAT_META.muscles,
      value: performance.muscleVolume.length || muscleGroups.length - 1,
      isText: false,
    },
    {
      key: 'next',
      ...STAT_META.next,
      value: performance.nextWorkout?.name?.split('—')[0]?.trim() || 'Definir treino',
      isText: true,
    },
  ]

  return (
    <section id="inicio" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__glow hero__glow--secondary" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__badge">{BRAND.slogan}</span>
          <h1 className="hero__title">
            <span className="hero__brand">
              <span className="hero__title-evolua">Evolua</span>
              <span className="hero__title-fit">Fit</span>
            </span>
            <span className="hero__title-rest">Treinos que geram evolução real</span>
          </h1>
          <p className="hero__subtitle">
            Organize sua rotina, gere planilhas personalizadas, registre seus treinos e acompanhe seu
            desempenho mês a mês.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={() => scrollToSection('planilha')}>
              Criar minha planilha
            </button>
            <button type="button" className="btn btn--ghost btn--lg" onClick={() => scrollToSection('desempenho')}>
              Ver desempenho
            </button>
          </div>
        </div>

        <div className="hero__stats">
          {stats.map((stat, index) => (
            <button
              key={stat.key}
              type="button"
              className={`hero-stat glass-card hero-stat--${stat.tone}`}
              style={{ '--stat-delay': `${index * 60}ms` }}
              onClick={() => scrollToSection(stat.target)}
            >
              <span className="hero-stat__icon" aria-hidden="true">
                {stat.icon}
              </span>
              <span className="hero-stat__body">
                <span className="hero-stat__label">{stat.label}</span>
                <span className={`hero-stat__value ${stat.isText ? 'hero-stat__value--text' : ''}`}>
                  {stat.value}
                </span>
                <span className="hero-stat__desc">{stat.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
