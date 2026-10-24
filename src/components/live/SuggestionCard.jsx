import { IconBolt, IconTrend } from '../dashboard/icons'

export default function SuggestionCard({ suggestion }) {
  if (!suggestion) return null
  const isFirst = suggestion.kind === 'first'
  const Icon = suggestion.kind === 'increase' ? IconTrend : IconBolt
  return (
    <section className={`live-suggestion live-suggestion--${suggestion.kind}`} aria-label="Sugestão de hoje">
      <span className="live-suggestion__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <p className="live-suggestion__kicker">Sugestão de hoje</p>
        <p className="live-suggestion__text">{suggestion.message}</p>
        {isFirst ? (
          <p className="live-suggestion__hint">Escolha uma carga que permita completar a faixa com boa técnica.</p>
        ) : null}
      </div>
    </section>
  )
}
