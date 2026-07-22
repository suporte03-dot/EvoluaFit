/** Consistent SVG icon set for the SaaS dashboard (no emoji as primary icons). */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Icon({ children, size = 20, className = '', label, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...base}
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconHome(props) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </Icon>
  )
}

export function IconChart(props) {
  return (
    <Icon {...props}>
      <path d="M4 19h16" />
      <path d="M7 16V10" />
      <path d="M12 16V7" />
      <path d="M17 16v-4" />
    </Icon>
  )
}

export function IconDumbbell(props) {
  return (
    <Icon {...props}>
      <path d="M6.5 9.5v5" />
      <path d="M17.5 9.5v5" />
      <path d="M4 11v2" />
      <path d="M20 11v2" />
      <path d="M6.5 12h11" />
      <rect x="2.5" y="9" width="2.5" height="6" rx="1" />
      <rect x="19" y="9" width="2.5" height="6" rx="1" />
    </Icon>
  )
}

export function IconCalendar(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
    </Icon>
  )
}

export function IconTrend(props) {
  return (
    <Icon {...props}>
      <path d="M3.5 16.5 9 11l3.5 3.5L20.5 6.5" />
      <path d="M14.5 6.5h6v6" />
    </Icon>
  )
}

export function IconSpark(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 13.8 9.2 19.5 11 13.8 12.8 12 18.5 10.2 12.8 4.5 11 10.2 9.2 12 3.5Z" />
    </Icon>
  )
}

export function IconBell(props) {
  return (
    <Icon {...props}>
      <path d="M6.5 16.5h11" />
      <path d="M7 10a5 5 0 0 1 10 0c0 3.5 1.5 5 1.5 5H5.5S7 13.5 7 10Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </Icon>
  )
}

export function IconMessage(props) {
  return (
    <Icon {...props}>
      <path d="M5 18.5 6.2 15H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11.5Z" />
    </Icon>
  )
}

export function IconSettings(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.9 7.1l1.6 1.6M17.5 15.3l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 16.9l1.6-1.6M17.5 8.7l1.6-1.6" />
    </Icon>
  )
}

export function IconFlame(props) {
  return (
    <Icon {...props}>
      <path d="M12 20c3.5 0 5.5-2.4 5.5-5.4 0-2.6-1.5-4.2-2.7-5.3.2 1.6-.4 2.6-1.3 3.1C13 9 11.2 6.8 12.2 4c-3.2 1.4-5.7 4.6-5.7 8.2C6.5 16.3 9 20 12 20Z" />
    </Icon>
  )
}

export function IconBolt(props) {
  return (
    <Icon {...props}>
      <path d="M13 3.5 6.5 13h5L11 20.5 17.5 11h-5L13 3.5Z" />
    </Icon>
  )
}

export function IconChevron(props) {
  return (
    <Icon {...props}>
      <path d="M9 6.5 14.5 12 9 17.5" />
    </Icon>
  )
}

export function IconMenu(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 17h15" />
    </Icon>
  )
}

export function IconPanel(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9 4.5v15" />
    </Icon>
  )
}

export function IconShield(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 19 6.5v5.2c0 4.2-2.9 7.8-7 8.8-4.1-1-7-4.6-7-8.8V6.5L12 3.5Z" />
      <path d="M9.5 12.2 11.2 14l3.5-3.8" />
    </Icon>
  )
}

/** Large 3D-like dumbbells composition for Meus Treinos module. */
export function DumbbellsVisual({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dbPlateA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34F5A5" />
          <stop offset="45%" stopColor="#00C97B" />
          <stop offset="100%" stopColor="#067A4A" />
        </linearGradient>
        <linearGradient id="dbPlateB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1AE88F" />
          <stop offset="55%" stopColor="#00A86B" />
          <stop offset="100%" stopColor="#045C38" />
        </linearGradient>
        <linearGradient id="dbBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="50%" stopColor="#6B7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="dbGlow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#00E58F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00E58F" stopOpacity="0" />
        </linearGradient>
        <filter id="dbSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#00E58F" floodOpacity="0.35" />
        </filter>
      </defs>

      <ellipse cx="140" cy="168" rx="96" ry="14" fill="url(#dbGlow)" />

      {/* Back dumbbell (tilted) */}
      <g filter="url(#dbSoft)" transform="translate(28 36) rotate(-18 112 64)">
        <rect x="78" y="58" width="68" height="12" rx="6" fill="url(#dbBar)" />
        <rect x="28" y="46" width="28" height="36" rx="7" fill="url(#dbPlateB)" />
        <rect x="48" y="50" width="18" height="28" rx="5" fill="url(#dbPlateA)" />
        <rect x="158" y="50" width="18" height="28" rx="5" fill="url(#dbPlateA)" />
        <rect x="168" y="46" width="28" height="36" rx="7" fill="url(#dbPlateB)" />
        <rect x="72" y="55" width="10" height="18" rx="3" fill="#4B5563" />
        <rect x="142" y="55" width="10" height="18" rx="3" fill="#4B5563" />
      </g>

      {/* Front dumbbell */}
      <g filter="url(#dbSoft)" transform="translate(42 58) rotate(12 112 64)">
        <rect x="78" y="58" width="68" height="14" rx="7" fill="url(#dbBar)" />
        <rect x="22" y="42" width="32" height="46" rx="8" fill="url(#dbPlateA)" />
        <rect x="46" y="48" width="20" height="34" rx="6" fill="url(#dbPlateB)" />
        <rect x="158" y="48" width="20" height="34" rx="6" fill="url(#dbPlateB)" />
        <rect x="170" y="42" width="32" height="46" rx="8" fill="url(#dbPlateA)" />
        <rect x="70" y="54" width="12" height="22" rx="3" fill="#4B5563" />
        <rect x="142" y="54" width="12" height="22" rx="3" fill="#4B5563" />
        <ellipse cx="38" cy="52" rx="10" ry="4" fill="#7CFFC4" opacity="0.35" />
        <ellipse cx="186" cy="52" rx="10" ry="4" fill="#7CFFC4" opacity="0.35" />
      </g>
    </svg>
  )
}

/** Glowing teal radar / crosshair for Coach IA. */
export function RadarVisual({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#00D9FF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
        </radialGradient>
        <filter id="radarBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <circle cx="80" cy="80" r="72" fill="url(#radarGlow)" />
      <circle cx="80" cy="80" r="62" stroke="#00D9FF" strokeOpacity="0.2" strokeWidth="1" />
      <circle cx="80" cy="80" r="46" stroke="#00D9FF" strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx="80" cy="80" r="30" stroke="#00D9FF" strokeOpacity="0.5" strokeWidth="1.4" />
      <circle cx="80" cy="80" r="14" stroke="#5EEFFF" strokeOpacity="0.85" strokeWidth="1.6" />
      <path d="M80 18v124M18 80h124" stroke="#00D9FF" strokeOpacity="0.35" strokeWidth="1" />
      <path
        d="M80 80 L118 48"
        stroke="#5EEFFF"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#radarBlur)"
        opacity="0.9"
      />
      <circle cx="80" cy="80" r="4" fill="#5EEFFF" />
      <circle cx="118" cy="48" r="5" fill="#5EEFFF" filter="url(#radarBlur)" />
      <circle cx="52" cy="108" r="3.5" fill="#00D9FF" opacity="0.7" />
      <circle cx="108" cy="102" r="2.5" fill="#00D9FF" opacity="0.55" />
    </svg>
  )
}

/** Glowing purple area/line chart for Evolução. */
export function EvolutionChartVisual({ series = [], className = '' }) {
  const w = 240
  const h = 120
  const pad = 8
  const values = series.length ? series : [0.2, 0.25, 0.22, 0.3, 0.28, 0.35, 0.4]
  const max = Math.max(0.01, ...values)
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : w
  const pts = values.map((v, i) => {
    const x = pad + i * step
    const y = h - pad - (v / max) * (h - pad * 2)
    return [x, y]
  })
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `M ${pts[0][0]},${h - pad} ${pts.map(([x, y]) => `L ${x},${y}`).join(' ')} L ${pts[pts.length - 1][0]},${h - pad} Z`

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="evoStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <filter id="evoGlow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#A78BFA" floodOpacity="0.7" />
        </filter>
      </defs>
      <path d={area} fill="url(#evoFill)" />
      <polyline
        points={line}
        stroke="url(#evoStroke)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#evoGlow)"
      />
      {pts.map(([x, y], i) =>
        i === pts.length - 1 || values[i] === max ? (
          <circle key={i} cx={x} cy={y} r="4" fill="#EDE9FE" filter="url(#evoGlow)" />
        ) : null,
      )}
    </svg>
  )
}
