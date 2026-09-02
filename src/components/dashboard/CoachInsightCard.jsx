import { scrollToSection } from '../../utils/scrollToSection'

export default function CoachInsightCard({ insights }) {
  const item = insights?.items?.[0]
  const body = item?.evidence || 'Conclua um treino para o Coach falar com números reais.'

  return (
    <div className="coach-whisper" aria-label="Coach Evolua">
      <p className="coach-whisper__kicker">Coach Evolua</p>
      <p className="coach-whisper__line">“{body}”</p>
      <button
        type="button"
        className="coach-whisper__cta"
        onClick={() => scrollToSection(item?.ctaSection || 'coach-ia')}
      >
        {item?.ctaLabel || 'Ver análise'}
      </button>
    </div>
  )
}
