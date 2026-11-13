import { ONBOARDING_STEPS } from '../../data/bodyEvolution'

export default function BodyOnboarding({ onStart }) {
  return (
    <section className="body-intro" aria-labelledby="body-intro-title">
      <p className="body-evo-kicker">Espelho Evolutivo</p>
      <h1 id="body-intro-title">Veja sua evolução de um jeito diferente.</h1>
      <p className="body-intro__lead">
        Registre seu corpo hoje, acompanhe suas mudanças e visualize seus objetivos ao longo da
        jornada.
      </p>

      <ol className="body-intro__steps">
        {ONBOARDING_STEPS.map((step, index) => (
          <li key={step.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn--primary body-evo-cta" onClick={onStart}>
        Começar meu espelho
      </button>
    </section>
  )
}
