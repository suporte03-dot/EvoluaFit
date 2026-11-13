import { BODY_CONSENT_COPY } from '../../data/bodyEvolution'

export default function BodyPhotoConsent({ checked, onChange, onContinue, saving }) {
  return (
    <section className="body-evo-card body-consent" aria-labelledby="body-consent-title">
      <p className="body-evo-kicker">Privacidade</p>
      <h2 id="body-consent-title">{BODY_CONSENT_COPY.title}</h2>
      <ul className="body-consent__list">
        {BODY_CONSENT_COPY.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <label className="body-consent__check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>{BODY_CONSENT_COPY.checkbox}</span>
      </label>
      <button
        type="button"
        className="btn btn--primary body-evo-cta"
        disabled={!checked || saving}
        onClick={onContinue}
      >
        {saving ? 'Salvando...' : 'Continuar'}
      </button>
    </section>
  )
}
