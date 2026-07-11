import { useEffect, useState } from 'react'
import SportImage from './SportImage'
import {
  formatUpdateLabel,
  getHeadline,
  getLastUpdatedAt,
  getSecondaryHeadlines,
} from '../services/newsService'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function FeaturedNews({ onReadMore }) {
  const [headline, setHeadline] = useState(getHeadline)
  const [secondary, setSecondary] = useState(getSecondaryHeadlines)
  const [updateLabel, setUpdateLabel] = useState(() => formatUpdateLabel())

  useEffect(() => {
    const refresh = () => {
      setHeadline(getHeadline())
      setSecondary(getSecondaryHeadlines())
      setUpdateLabel(formatUpdateLabel(getLastUpdatedAt()))
    }

    window.addEventListener('arena360:news-updated', refresh)
    return () => window.removeEventListener('arena360:news-updated', refresh)
  }, [])

  const allFeatured = [headline, ...secondary]

  return (
    <section id="manchete" className="section featured-news">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Cobertura especial"
            title="Destaque do Dia"
            subtitle="A principal história esportiva do momento em uma cobertura especial."
          />
        </SectionReveal>

        <SectionReveal>
          <div className="featured-news__layout">
            <article
              className="featured-news__main card card--clickable"
              onClick={() => onReadMore(headline, allFeatured)}
              onKeyDown={(e) => e.key === 'Enter' && onReadMore(headline, allFeatured)}
              role="button"
              tabIndex={0}
            >
              <div className="featured-news__image-wrap">
                <SportImage
                  src={headline.image}
                  filter={headline.filter}
                  alt={headline.category}
                  className="featured-news__img"
                />
                <div className="featured-news__overlay" />
                <span className="featured-news__tag">{headline.tag}</span>
              </div>
              <div className="featured-news__body">
                <div className="featured-news__meta">
                  <span className="featured-news__category">{headline.category}</span>
                  <time>{headline.date}</time>
                  <span>{headline.readTime} de leitura</span>
                </div>
                <h2 className="featured-news__title">{headline.title}</h2>
                <p className="featured-news__excerpt">{headline.excerpt}</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReadMore(headline, allFeatured)
                  }}
                >
                  Ler destaque
                </button>
              </div>
            </article>

            <div className="featured-news__side">
              {secondary.map((item) => (
                <article
                  key={item.id}
                  className="featured-news__side-card card card--clickable"
                  onClick={() => onReadMore(item, allFeatured)}
                  onKeyDown={(e) => e.key === 'Enter' && onReadMore(item, allFeatured)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="featured-news__side-image">
                    <SportImage
                      src={item.image}
                      filter={item.filter}
                      alt={item.category}
                      className="featured-news__img"
                    />
                    <div className="featured-news__overlay featured-news__overlay--side" />
                    <span className="featured-news__side-icon" aria-hidden="true">{item.icon}</span>
                  </div>
                  <div className="featured-news__side-body">
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <div className="featured-news__side-meta">
                      <time>{item.date}</time>
                      <span>{item.readTime}</span>
                    </div>
                    <span className="featured-news__read-btn">Ler mais →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="featured-news__update">{updateLabel}</p>
        </SectionReveal>
      </div>
    </section>
  )
}

export default FeaturedNews
