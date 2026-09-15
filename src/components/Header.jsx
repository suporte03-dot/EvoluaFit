import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToSection, handleSectionClick } from '../utils/scrollToSection'
import { isDedicatedAppRoute } from '../data/dashboardRoutes'
import { IconMenu } from './dashboard/icons'
import EvoluaFitLogo from './branding/EvoluaFitLogo'

/**
 * Compact mobile top bar for SaaS shell.
 * Desktop navigation lives in DashboardSidebar — this header is mobile-only.
 */
export default function Header({ onOpenDashboardMenu, mobileMenuOpen = false }) {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goHome = (e) => {
    e.preventDefault()
    if (isDedicatedAppRoute(location.pathname)) {
      navigate('/app')
      return
    }
    handleSectionClick(e, 'inicio')
  }

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
          href="/app"
          className="header__brand"
          onClick={goHome}
          aria-label="EvoluaFit — Início"
        >
          <EvoluaFitLogo size="medium" showWordmark />
        </a>

        <button
          type="button"
          className="btn btn--primary header__cta-desktop btn--start-workout"
          onClick={() => {
            if (isDedicatedAppRoute(location.pathname)) {
              navigate('/app/planilha')
              return
            }
            scrollToSection('planilha')
          }}
        >
          Criar treino
        </button>
      </div>
    </header>
  )
}
