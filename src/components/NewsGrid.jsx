import { useEffect, useState } from 'react'
import SportImage from './SportImage'
import {
  formatUpdateLabel,
  getGridNews,
  getLastUpdatedAt,
  refreshNews,
} from '../services/newsService'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'
import CategoryFilter from './CategoryFilter'

function NewsGrid({ onReadMore }) {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [newsItems, setNewsItems] = useState(getGridNews)
  const [loading, setLoading] = useState(false)
  const [updateLabel, setUpdateLabel] = useState(() => formatUpdateLabel())

  useEffect(() => {
    const refresh = () => {
      setNewsItems(getGridNews())
      setUpdateLabel(formatUpdateLabel(getLastUpdatedAt()))
    }
    window.addEventListener('arena360:news-updated', refresh)
    return () => window.removeEventListener('arena360:news-updated', refresh)
  }, [])

  const filtered =
    activeFilter === 'todos'
      ? newsItems
      : newsItems.filter((news) => news.filter === activeFilter)

  const handleRefresh = async () => {
    setLoading(true)
    await refreshNews()
    setNewsItems(getGridNews())
    setUpdateLabel(formatUpdateLabel(getLastUpdatedAt()))
    setLoading(false)
    window.dispatchEvent(new CustomEvent('arena360:news-updated'))
  }

  return (
    <section id="destaques" className="section news-grid">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Notícias"
            title="Últimas Notícias"
            subtitle="Acompanhe os principais acontecimentos do esporte em tempo real."
          />
        </SectionReveal>

        <SectionReveal>
          <div className="news-grid__toolbar">
            <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <div className="news-grid__actions">
              <span className="news-grid__update">{updateLabel}</span>
              <button
                type="button"
                className="btn btn--outline btn--sm news-grid__refresh"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Atualizando...' : 'Atualizar notícias'}
              </button>
            </div>
          </div>
        </SectionReveal>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">📰</span>
            <h3>Nenhuma notícia encontrada</h3>
            <p>Não há notícias para o filtro selecionado. Tente outra modalidade ou atualize a lista.</p>
          </div>
        ) : (
          <div className="news-grid__list" id="noticias">
            {filtered.map((news, index) => (
              <SectionReveal key={news.id}>
                <article
                  className="news-grid__card card card--clickable"
                  style={{ '--delay': `${index * 0.05}s` }}
                  onClick={() => onReadMore(news, filtered)}
                  onKeyDown={(e) => e.key === 'Enter' && onReadMore(news, filtered)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="news-grid__image-wrap">
                    <SportImage
                      src={news.image}
                      filter={news.filter}
                      alt={news.category}
                      className="news-grid__img"
                    />
                    <div className="news-grid__overlay" />
                    <span className="news-grid__category">{news.category}</span>
                  </div>
                  <div className="news-grid__body">
                    <div className="news-grid__meta">
                      <time>{news.date}</time>
                      <span>{news.readTime} de leitura</span>
                      <span>{news.source}</span>
                    </div>
                    <h3>{news.title}</h3>
                    <p>{news.excerpt}</p>
                    <button
                      type="button"
                      className="news-grid__btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReadMore(news, filtered)
                      }}
                    >
                      Ler mais →
                    </button>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsGrid
