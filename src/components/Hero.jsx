import { useFitness } from '../context/FitnessContext'
import { scrollToSection } from '../utils/scrollToSection'
import { muscleGroups } from '../data/exercisesData'

export default function Hero() {
  const { performance } = useFitness()

  const stats = [
    {
      label: 'Treinos na semana',
      value: performance.weeklyWorkouts,
      suffix: '',
      target: 'desempenho',
    },
    {
      label: 'Desempenho mensal',
      value: performance.monthlyWorkouts,
      suffix: ' treinos',
      target: 'desempenho',
    },
    {
      label: 'Grupos musculares',
      value: performance.muscleVolume.length || muscleGroups.length - 1,
      suffix: '',
      target: 'exercicios',
    },
    {
      label: 'Próximo treino',
      value: performance.nextWorkout?.name?.split('—')[0]?.trim() || '—',
      suffix: '',
      target: 'treinos',
      isText: true,
    },
  ]

  return (
    <section id="inicio" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__badge">Plataforma fitness inteligente</span>
          <h1 className="hero__title">Treinos inteligentes para evoluir de verdade</h1>
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
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              className="hero-stat glass-card"
              onClick={() => scrollToSection(stat.target)}
            >
              <span className="hero-stat__label">{stat.label}</span>
              <span className={`hero-stat__value ${stat.isText ? 'hero-stat__value--text' : ''}`}>
                {stat.isText ? stat.value : `${stat.value}${stat.suffix}`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
