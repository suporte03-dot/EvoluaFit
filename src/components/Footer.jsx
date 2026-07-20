import { BRAND } from '../data/siteData'

const logoUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#inicio" className="brand">
            <img
              src={logoUrl('evoluafit-logo.png')}
              alt="EvoluaFit - Treinos inteligentes, evolução real"
              className="brand-logo brand-logo--footer"
            />
          </a>
        </div>
        <p className="footer__disclaimer" role="note">
          {BRAND.disclaimer}
        </p>
        <p className="footer__copy">
          © {new Date().getFullYear()} {BRAND.name} — Dados salvos localmente neste aparelho.
        </p>
      </div>
    </footer>
  )
}
