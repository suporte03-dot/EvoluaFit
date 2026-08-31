import { BRAND } from '../data/siteData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#inicio" className="brand">
            <img
              src={`${import.meta.env.BASE_URL}branding/evoluafit-lockup.png?v=nobg`}
              alt="EvoluaFit"
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
