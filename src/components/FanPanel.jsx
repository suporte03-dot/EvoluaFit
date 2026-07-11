import { useEffect, useState } from 'react'
import { getAgendaEvents, getAgendaFeaturedEvent } from '../data/agendaData'
import { trendingSports } from '../data/siteData'
import { formatUpdateLabel, getLastUpdatedAt } from '../services/newsService'
import { scrollToSection } from '../utils/scrollToSection'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

const FAN_PANEL_LINKS = [
  { label: 'Brasileirão Série A', sectionId: 'brasileirao' },
  { label: 'Ver agenda completa', sectionId: 'agenda' },
  { label: 'Tabelas e campeonatos', sectionId: 'tabelas' },
  { label: 'Ver todas as notícias', sectionId: 'noticias' },
  { label: 'Modalidades em alta', sectionId: 'modalidades' },
]

function FanPanel({ onNavigate }) {
  const [updateLabel, setUpdateLabel] = useState(() => formatUpdateLabel())

  useEffect(() => {
    const refresh = () => setUpdateLabel(formatUpdateLabel(getLastUpdatedAt()))
    window.addEventListener('arena360:news-updated', refresh)
    return () => window.removeEventListener('arena360:news-updated', refresh)
  }, [])

  const navigate = (sectionId, options = {}) => {
    if (onNavigate) {
      onNavigate(sectionId, options)
      return
    }
    scrollToSection(sectionId)
  }

  const handleLinkClick = (event, sectionId) => {
    event.preventDefault()
    navigate(sectionId)
  }

  const handleCardActivate = (action) => {
    navigate(action.sectionId, {
      agendaPeriod: action.agendaPeriod,
      sportHighlight: action.sportHighlight,
    })
  }

  const handleCardKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardActivate(action)
    }
  }

  const events = getAgendaEvents()
  const todayCount = events.filter((event) => event.status === 'Hoje').length
  const upcomingCount = events.filter(
    (event) => event.status !== 'Encerrado' && event.status !== 'Hoje',
  ).length
  const trending = trendingSports[0]
  const featured = getAgendaFeaturedEvent()
  const highlight = featured?.title ?? 'Final decisiva movimenta o calendário'

  const cards = [
    {
      id: 1,
      title: 'Jogos hoje',
      detail: `${todayCount} eventos em destaque`,
      icon: '⚽',
      accent: 'green',
      action: { sectionId: 'agenda', agendaPeriod: 'hoje' },
    },
    {
      id: 2,
      title: 'Modalidade em alta',
      detail: `${trending.name} lidera as buscas`,
      icon: '🔥',
      accent: 'accent',
      action: { sectionId: 'modalidades', sportHighlight: trending.filter },
    },
    {
      id: 3,
      title: 'Destaque da semana',
      detail: highlight,
      icon: '⭐',
      accent: 'orange',
      action: { sectionId: 'destaques' },
    },
    {
      id: 4,
      title: 'Próximos eventos',
      detail: `${upcomingCount} eventos na agenda`,
      icon: '📅',
      accent: 'green',
      action: { sectionId: 'agenda', agendaPeriod: 'semana' },
    },
  ]

  return (
    <section id="painel" className="section fan-panel">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Ao vivo"
            title="Painel do Torcedor"
            subtitle="Um resumo rápido do que está movimentando o esporte agora."
            light
          />
        </SectionReveal>

        <div className="fan-panel__grid">
          {cards.map((card, index) => (
            <SectionReveal key={card.id}>
              <article
                className={`fan-panel__card card fan-panel__card--${card.accent}`}
                style={{ '--delay': `${index * 0.07}s` }}
                role="button"
                tabIndex={0}
                onClick={() => handleCardActivate(card.action)}
                onKeyDown={(event) => handleCardKeyDown(event, card.action)}
              >
                <div className="fan-panel__scoreboard">
                  <span className="fan-panel__icon" aria-hidden="true">{card.icon}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.detail}</p>
                <div className="fan-panel__led" aria-hidden="true" />
              </article>
            </SectionReveal>
          ))}
        </div>

        <p className="fan-panel__update">{updateLabel}</p>

        <div className="fan-panel__links">
          {FAN_PANEL_LINKS.map((link) => (
            <a
              key={link.sectionId}
              href={`#${link.sectionId}`}
              className="fan-panel__link"
              onClick={(event) => handleLinkClick(event, link.sectionId)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FanPanel
