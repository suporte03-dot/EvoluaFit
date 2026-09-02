export default function EngagementStrip({ xp, achievements = [], streak }) {
  const unlocked = achievements.filter((item) => item.unlocked)

  return (
    <section className="hoje-card hoje-engage" aria-label="Jornada e conquistas">
      <p className="hoje-card__kicker">Jornada</p>
      <h3 className="hoje-card__title">{xp?.levelName || 'Começando'}</h3>
      <p className="hoje-card__body">
        Nível de produto — separado da experiência de treino do perfil.
        {streak > 0 ? ` ${streak} ${streak === 1 ? 'dia' : 'dias'} evoluindo.` : ''}
      </p>
      {xp ? (
        <div
          className="hoje-xp"
          role="progressbar"
          aria-valuenow={xp.intoLevel}
          aria-valuemin={0}
          aria-valuemax={xp.nextLevelAt}
          aria-label={`${xp.levelName}: ${xp.xp} XP`}
        >
          <span style={{ width: `${xp.pct}%` }} />
        </div>
      ) : null}
      <p className="hoje-card__note">
        {xp
          ? `${xp.xp.toLocaleString('pt-BR')} XP${xp.nextName ? ` · próximo: ${xp.nextName}` : ''}`
          : 'Complete um treino para gerar XP.'}
      </p>
      {unlocked.length ? (
        <ul className="hoje-achievements">
          {unlocked.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      ) : (
        <p className="hoje-card__note">Conquistas aparecem com o primeiro treino registrado.</p>
      )}
    </section>
  )
}
