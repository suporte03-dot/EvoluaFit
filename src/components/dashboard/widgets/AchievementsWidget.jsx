export default function AchievementsWidget({ achievements = [], xp }) {
  const unlocked = achievements.filter((item) => item.unlocked)

  return (
    <div className="focus-widget-body">
      <p className="hoje-card__kicker">Metas</p>
      <h3 className="hoje-card__title">{xp?.levelName || 'Conquistas'}</h3>
      <p className="hoje-card__body">
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
    </div>
  )
}
