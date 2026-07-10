import { useState } from 'react'
import { curiosities } from '../data/siteData'
import SectionTitle from './SectionTitle'
import SectionReveal from './SectionReveal'

function Curiosities() {
  const [highlighted, setHighlighted] = useState(0)

  const showNext = () => {
    setHighlighted((current) => (current + 1) % curiosities.length)
  }

  return (
    <section id="curiosidades" className="section curiosities">
      <div className="container">
        <SectionReveal>
          <SectionTitle
            label="Você Sabia?"
            title="Curiosidades esportivas"
            subtitle="Respostas rápidas para perguntas que todo torcedor já fez"
          />
        </SectionReveal>

        <div className="curiosities__grid">
          {curiosities.map((item, index) => (
            <SectionReveal key={item.id}>
              <article
                className={`curiosities__card card ${highlighted === index ? 'curiosities__card--active' : ''}`}
                style={{ '--delay': `${index * 0.05}s` }}
              >
                <span className="curiosities__icon" aria-hidden="true">{item.icon}</span>
                <span className="curiosities__sport">{item.sport}</span>
                <h3 className="curiosities__question">{item.question}</h3>
                <p className="curiosities__answer">{item.answer}</p>
              </article>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal>
          <div className="curiosities__action">
            <button type="button" className="btn btn--accent" onClick={showNext}>
              Ver outra curiosidade
            </button>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}

export default Curiosities
