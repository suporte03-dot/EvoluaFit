const LOCKUP_SRC = `${import.meta.env.BASE_URL}branding/evoluafit-lockup.png?v=nobg`
const LOCKUP_WEBP = `${import.meta.env.BASE_URL}branding/evoluafit-lockup.webp?v=nobg`
const MARK_SRC = `${import.meta.env.BASE_URL}branding/evoluafit-mark.png`

/**
 * EvoluaFit sidebar brand block.
 */
export default function EvoluaFitBrand({
  collapsed = false,
  className = '',
  collapseControl = null,
  onNavigateHome,
}) {
  return (
    <div
      className={[
        'evoluafit-brand',
        collapsed ? 'evoluafit-brand--collapsed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <a
        href="#inicio"
        className="evoluafit-brand__identity"
        onClick={onNavigateHome}
        aria-label="EvoluaFit"
        title={collapsed ? 'EvoluaFit' : undefined}
      >
        {collapsed ? (
          <img src={MARK_SRC} alt="" className="evoluafit-brand__mark" width={40} height={40} />
        ) : (
          <picture>
            <source srcSet={LOCKUP_WEBP} type="image/webp" />
            <img src={LOCKUP_SRC} alt="" className="evoluafit-brand__lockup" />
          </picture>
        )}
      </a>

      {collapseControl}

      {!collapsed ? (
        <p className="evoluafit-brand__signature" aria-hidden="true">
          Disciplina hoje
          <br />
          Resultados sempre
        </p>
      ) : null}
    </div>
  )
}
