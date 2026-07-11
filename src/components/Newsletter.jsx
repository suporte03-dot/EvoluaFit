import { useState } from 'react'
import SectionReveal from './SectionReveal'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = email.trim()

    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Informe um e-mail válido para receber a newsletter da Arena 360.')
      return
    }

    setError('')
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section id="newsletter" className="section newsletter">
      <div className="container">
        <SectionReveal>
          <div className="newsletter__box">
            <div className="newsletter__glow" aria-hidden="true" />
            <div className="newsletter__content">
              <span className="newsletter__label">Newsletter</span>
              <h2>Receba os destaques do esporte</h2>
              <p>
                Notícias, agenda e curiosidades direto no seu e-mail. Sem enrolação,
                só o que importa.
              </p>
            </div>

            {submitted ? (
              <div className="newsletter__success" role="status">
                <span className="newsletter__success-icon">✓</span>
                <div>
                  <strong>Bem-vindo à Arena 360!</strong>
                  <p>Cadastro realizado com sucesso. Você receberá os próximos destaques do esporte em todos os ângulos.</p>
                </div>
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={handleSubmit} noValidate>
                <div className="newsletter__field">
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    aria-label="E-mail para newsletter"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'newsletter-error' : undefined}
                  />
                  {error && (
                    <p id="newsletter-error" className="newsletter__error" role="alert">
                      {error}
                    </p>
                  )}
                </div>
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
