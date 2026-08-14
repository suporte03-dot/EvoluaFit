export default function BodyEmptyState({ onCreate }) {
  return (
    <section className="body-evo-card body-empty" aria-labelledby="body-empty-title">
      <p className="body-evo-kicker">Espelho Evolutivo</p>
      <h2 id="body-empty-title">Seu Espelho Evolutivo ainda está vazio.</h2>
      <p>Registre seu corpo hoje e comece a construir sua linha do tempo.</p>
      <button type="button" className="btn btn--primary body-evo-cta" onClick={onCreate}>
        Criar primeiro registro
      </button>
    </section>
  )
}
