import { Link } from 'react-router-dom'
import EvoluaFitLogo from '../../components/branding/EvoluaFitLogo'

export default function LegalLayout({ title, children }) {
  return (
    <div className="legal-page">
      <header className="legal-page__top">
        <Link to="/login" className="legal-page__brand" aria-label="Voltar ao login">
          <EvoluaFitLogo size="small" showWordmark />
        </Link>
        <nav>
          <Link to="/termos">Termos</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/login">Entrar</Link>
        </nav>
      </header>
      <article className="legal-page__body">
        <h1>{title}</h1>
        {children}
      </article>
    </div>
  )
}
