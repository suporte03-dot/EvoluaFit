import { Link } from 'react-router-dom'
import '../../styles/body-evolution.css'

export default function BodyMirrorEntry() {
  return (
    <section className="section" aria-labelledby="body-mirror-entry-title">
      <div className="container">
        <div className="body-mirror-entry glass-card">
          <p className="body-evo-kicker">Espelho Evolutivo</p>
          <h2 id="body-mirror-entry-title">Não acompanhe apenas seus treinos. Veja sua evolução acontecer.</h2>
          <p>Fotos, medidas e um manequim para contar a história do seu corpo — só você vê.</p>
          <Link to="/app/evolucao/espelho" className="btn btn--primary">
            Abrir Espelho Evolutivo
          </Link>
        </div>
      </div>
    </section>
  )
}
