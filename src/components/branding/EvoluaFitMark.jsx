const MARK_SRC = `${import.meta.env.BASE_URL}branding/evoluafit-mark.png`

/**
 * EvoluaFit Mark — ícone E em placa arredondada.
 */
export default function EvoluaFitMark({
  size = 40,
  className = '',
}) {
  const px = typeof size === 'number' ? size : 40

  return (
    <img
      className={`evoluafit-mark ${className}`.trim()}
      src={MARK_SRC}
      width={px}
      height={px}
      alt=""
      aria-hidden="true"
    />
  )
}
