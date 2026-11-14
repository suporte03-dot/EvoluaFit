import { scrollToSection } from '../../utils/scrollToSection'

export default function CoachInsightCard({ insights, history }) {
  const item = insights?.items?.[0]
  const body =
    item?.evidence ||
    (history?.length
      ? 'Continue registrando cargas e séries: com mais sessões eu mostro onde ajustar.'
      : 'Dúvida sobre execução, carga ou rotina? Pergunte ao Coach.')

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
