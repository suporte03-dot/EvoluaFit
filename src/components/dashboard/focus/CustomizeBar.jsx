export default function CustomizeBar({
  customizing,
  saving,
  onStart,
  onSave,
  onCancel,
  onReset,
  onOpenLibrary,
}) {
  if (!customizing) {
    return (
      <button type="button" className="focus-chrome__edit" onClick={onStart}>
        Personalizar
      </button>
    )
  }

  return (
    <div className="focus-customize" role="status">
      <div>
        <p className="hoje-card__kicker">Personalizando seu painel</p>
        <p>Arraste, reorganize ou remova os cards.</p>
      </div>
      <div className="focus-customize__actions">
        <button type="button" onClick={onOpenLibrary}>
          Biblioteca
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Restaurar o painel padrão? Sua organização atual será substituída.')) {
              onReset()
            }
          }}
        >
          Restaurar padrão
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="dash-hero__cta" onClick={onSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar painel'}
        </button>
      </div>
    </div>
  )
}
