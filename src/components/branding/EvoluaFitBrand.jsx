import EvoluaFitMark from './EvoluaFitMark'

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
        <EvoluaFitMark size={collapsed ? 40 : 48} compact={collapsed} className="evoluafit-brand__mark" />

        {!collapsed && (
          <div className="evoluafit-brand__content" aria-hidden="true">
            <div className="evoluafit-brand__name">
              <span className="evoluafit-brand__name-main">Evolua</span>
              <span className="evoluafit-brand__name-accent">Fit</span>
            </div>
          </div>
        )}
      </a>

      {collapseControl}
    </div>
  )
}
