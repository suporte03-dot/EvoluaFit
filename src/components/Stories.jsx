import { stories } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function Stories() {
  return (
    <section id="historias" className="section stories">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Editorial"
            title="Histórias que Marcaram"
            subtitle="Viradas épicas, recordes e momentos que entraram para a eternidade"
            light
          />
        </SectionReveal>

        <div className="stories__grid">
          {stories.map((story, index) => (
            <SectionReveal key={story.id}>
              <article
                className="stories__card card"
                style={{ '--delay': `${index * 0.07}s` }}
              >
                <div className="stories__image-wrap">
                  <img src={story.image} alt="" className="stories__img" />
                  <div className="stories__overlay" />
                  <span className="stories__icon" aria-hidden="true">{story.icon}</span>
                </div>
                <div className="stories__body">
                  <div className="stories__top">
                    <span className="stories__year">{story.year}</span>
                    <span className="stories__tag">{story.tag}</span>
                  </div>
                  <span className="stories__sport">{story.sport}</span>
                  <h3>{story.title}</h3>
                  <p>{story.excerpt}</p>
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stories
