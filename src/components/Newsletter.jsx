import { useState } from 'react'
import SectionReveal from './SectionReveal'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section id="newsletter" className="section newsletter">
      <div className="container">
        <SectionReveal>
          <div className="newsletter__box">
            <div className="newsletter__glow" aria-hidden="true" />
            <div className="newsletter__content">
              <span className="newsletter__label">Newsletter</span>
              <h2>Receba os destaques do esporte direto no seu e-mail.</h2>
              <p>
                Toda semana, as manchetes, curiosidades e eventos mais importantes.
                Grátis e sem spam.
              </p>
            </div>

            {submitted ? (
              <div className="newsletter__success" role="status">
                <span className="newsletter__success-icon">✓</span>
                <div>
                  <strong>Inscrição confirmada!</strong>
                  <p>Em breve você receberá nossos destaques.</p>
                </div>
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Digite seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="E-mail para newsletter"
                />
                <button type="submit" className="btn btn--accent">
                  Quero receber
                </button>
              </form>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}

export default Newsletter
