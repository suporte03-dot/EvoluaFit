import Logo from './Logo'
import { BRAND } from '../data/siteData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo size={28} />
          <div>
            <strong>{BRAND.name}</strong>
            <p>{BRAND.slogan}</p>
          </div>
        </div>
        <p className="footer__disclaimer">{BRAND.disclaimer}</p>
        <p className="footer__copy">
          © {new Date().getFullYear()} EvoluaFit — Plataforma fitness demonstrativa. Sem backend, dados salvos
          localmente.
        </p>
      </div>
    </footer>
  )
}
