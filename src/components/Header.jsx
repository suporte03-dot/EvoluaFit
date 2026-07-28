import { useEffect, useState } from 'react'
import { scrollToSection, handleSectionClick } from '../utils/scrollToSection'
import { IconMenu } from './dashboard/icons'
import EvoluaFitLogo from './branding/EvoluaFitLogo'

/**
 * Compact mobile top bar for SaaS shell.
 * Desktop navigation lives in DashboardSidebar — this header is mobile-only.
 */
export default function Header({ onOpenDashboardMenu, mobileMenuOpen = false }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header header--saas-mobile ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        {onOpenDashboardMenu && (
          <button
            type="button"
            className={`header__dash-menu${mobileMenuOpen ? ' is-open' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenDashboardMenu()
            }}
            aria-label={mobileMenuOpen ? 'Fechar menu do painel' : 'Abrir menu do painel'}
            aria-expanded={mobileMenuOpen}
            aria-controls="dash-sidebar-drawer"
          >
            <IconMenu size={20} />
          </button>
        )}

        <a
          href="#inicio"
          className="header__brand"
          onClick={(e) => handleSectionClick(e, 'inicio')}
          aria-label="EvoluaFit — Início"
        >
          <EvoluaFitLogo size="medium" showWordmark />
        </a>

        <button
          type="button"
          className="btn btn--primary header__cta-desktop btn--start-workout"
          onClick={() => scrollToSection('planilha')}
        >
          Criar treino
        </button>
      </div>
    </header>
  )
}
