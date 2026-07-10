import SportImage from './SportImage'
import { useState } from 'react'
import { gridNews } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'
import CategoryFilter from './CategoryFilter'

function NewsGrid({ onReadMore }) {
  const [activeFilter, setActiveFilter] = useState('todos')

  const filtered =
    activeFilter === 'todos'
      ? gridNews
      : gridNews.filter((news) => news.filter === activeFilter)

  return (
    <section id="destaques" className="section news-grid">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Cobertura"
            title="Destaques esportivos"
            subtitle="Notícias filtradas por modalidade — clique para ler a matéria completa"
          />
        </SectionReveal>

        <SectionReveal>
          <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </SectionReveal>

        <div className="news-grid__list" id="noticias">
          {filtered.map((news, index) => (
            <SectionReveal key={news.id}>
              <article
                className="news-grid__card card"
                style={{ '--delay': `${index * 0.05}s` }}
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
                  </div>
                  <h3>{news.title}</h3>
                  <p>{news.excerpt}</p>
                  <button
                    type="button"
                    className="news-grid__btn"
                    onClick={() => onReadMore(news)}
                  >
                    Ler mais →
                  </button>
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="news-grid__empty">Nenhuma notícia para este filtro.</p>
        )}
      </div>
    </section>
  )
}

export default NewsGrid
