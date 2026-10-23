import { scrollToSection } from '../../utils/scrollToSection'

export default function CoachInsightCard({ insights }) {
  const item = insights?.items?.[0]
  const body = item?.evidence || 'Seu primeiro treino cria a referência para acompanhar sua evolução.'

  return (
    <div className="coach-whisper" aria-label="Coach Evolua">
      <span className="coach-whisper__mark" aria-hidden="true">
        “
      </span>
      <p className="coach-whisper__line">{body}</p>
      <p className="coach-whisper__by">Coach Evolua</p>
      <button
        type="button"
        className="coach-whisper__cta"
        onClick={() => scrollToSection(item?.ctaSection || 'coach-ia')}
      >
        {item?.ctaLabel || 'Abrir Coach'}
      </button>
    </div>
  )
}
