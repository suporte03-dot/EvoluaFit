/** Alternativas para "Aparelho ocupado". A troca vale só para esta sessão. */
export default function SwapExerciseList({ alternatives, doneSets = 0, onPick, onCancel }) {
  return (
    <>
      <p className="live-sheet__text">
        Mesmo grupo muscular e mesmo tipo de movimento, com o seu equipamento. A planilha não muda; o histórico registra o
        exercício que você fizer.
        {doneSets > 0 ? ` As ${doneSets === 1 ? 'série feita fica' : `${doneSets} séries feitas ficam`} no exercício atual.` : ''}
      </p>
      {alternatives.length ? (
        <ul className="live-swap">
          {alternatives.map((alt) => (
            <li key={alt.id}>
              <button type="button" className="live-swap__item" onClick={() => onPick(alt)}>
                <span className="live-swap__thumb" aria-hidden="true">
                  {alt.thumbnail || alt.image ? (
                    <img src={alt.thumbnail || alt.image} alt="" loading="lazy" decoding="async" />
                  ) : null}
                </span>
                <span className="live-swap__body">
                  <span className="live-swap__name">{alt.name}</span>
                  <span className="live-swap__meta">{alt.equipment}</span>
                </span>
                <span className="live-swap__cta">Trocar</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="live-sheet__note">
          Nenhuma alternativa com o seu equipamento para este exercício. Faça outro exercício do treino e volte a este depois.
        </p>
      )}
      <button type="button" className="live-btn live-btn--ghost live-btn--block" onClick={onCancel}>
        Esperar o aparelho
      </button>
    </>
  )
}
