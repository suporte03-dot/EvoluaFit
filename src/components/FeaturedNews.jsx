import SportImage from './SportImage'
import { mainHeadline, secondaryHeadlines } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function FeaturedNews({ onReadMore }) {
  return (
    <section id="manchete" className="section featured-news">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Portal"
            title="Manchete Principal"
            subtitle="As notícias que estão definindo o dia no mundo esportivo"
          />
        </SectionReveal>

        <div className="featured-news__grid">
          <SectionReveal className="featured-news__main-wrap">
            <article className="featured-news__main card">
              <div className="featured-news__image-wrap">
                <SportImage
                  src={mainHeadline.image}
                  filter={mainHeadline.filter}
                  alt={mainHeadline.category}
                  className="featured-news__img"
                />
                <div className="featured-news__overlay" />
                <span className="featured-news__tag">{mainHeadline.tag}</span>
              </div>
              <div className="featured-news__body">
                <div className="featured-news__meta">
                  <span className="featured-news__category">{mainHeadline.category}</span>
                  <time>{mainHeadline.date}</time>
                  <span>{mainHeadline.readTime} de leitura</span>
                </div>
                <h2 className="featured-news__title">{mainHeadline.title}</h2>
                <p className="featured-news__excerpt">{mainHeadline.excerpt}</p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => onReadMore(mainHeadline)}
                >
                  Ler mais
                </button>
              </div>
            </article>
          </SectionReveal>

          <div className="featured-news__side">
            {secondaryHeadlines.map((news, index) => (
              <SectionReveal key={news.id} className="featured-news__side-wrap">
                <article
                  className="featured-news__side-card card"
                  style={{ '--delay': `${index * 0.08}s` }}
                >
                  <div className="featured-news__side-image">
                    <SportImage
                      src={news.image}
                      filter={news.filter}
                      alt={news.category}
                      className="featured-news__img"
                    />
                    <div className="featured-news__overlay featured-news__overlay--side" />
                    <span className="featured-news__side-icon" aria-hidden="true">
                      {news.icon}
                    </span>
                  </div>
                  <div className="featured-news__side-body">
                    <span className="featured-news__category">{news.category}</span>
                    <h3>{news.title}</h3>
                    <p>{news.excerpt}</p>
                    <div className="featured-news__side-meta">
                      <time>{news.date}</time>
                      <span>{news.readTime}</span>
                    </div>
                    <button
                      type="button"
                      className="featured-news__read-btn"
                      onClick={() => onReadMore(news)}
                    >
                      Ler mais →
                    </button>
                  </div>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedNews
