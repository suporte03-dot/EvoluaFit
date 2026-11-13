import { useId } from 'react'

function lerp(a, b, t) {
  return a + (b - a) * t
}

export default function BodyAvatar2D({
  factors = {},
  label = 'Manequim',
  caption = 'Representação visual baseada nas medidas',
  tone = 'now',
}) {
  const fillId = `body-avatar-fill-${useId().replace(/:/g, '')}`
  const height = factors.height ?? 1
  const shoulders = factors.shoulders ?? 1
  const chest = factors.chest ?? 1
  const waist = factors.waist ?? 1
  const hips = factors.hips ?? 1
  const arms = factors.arms ?? 1
  const thighs = factors.thighs ?? 1
  const calves = factors.calves ?? 1

  const shoulderW = lerp(52, 78, (shoulders - 0.86) / 0.3)
  const chestW = lerp(46, 72, (chest - 0.86) / 0.3)
  const waistW = lerp(34, 64, (waist - 0.82) / 0.36)
  const hipW = lerp(44, 70, (hips - 0.86) / 0.3)
  const armW = lerp(10, 18, (arms - 0.86) / 0.3)
  const thighW = lerp(16, 26, (thighs - 0.86) / 0.3)
  const calfW = lerp(11, 18, (calves - 0.88) / 0.26)
  const scaleY = 0.94 + (height - 0.92) * 0.7

  const torso = `
    M ${100 - shoulderW / 2} 78
    C ${100 - chestW / 2} 108, ${100 - chestW / 2} 132, ${100 - waistW / 2} 158
    C ${100 - hipW / 2} 176, ${100 - hipW / 2} 188, ${100 - hipW / 2} 198
    L ${100 + hipW / 2} 198
    C ${100 + hipW / 2} 188, ${100 + hipW / 2} 176, ${100 + waistW / 2} 158
    C ${100 + chestW / 2} 132, ${100 + chestW / 2} 108, ${100 + shoulderW / 2} 78
    Z
  `

  return (
    <figure className={`body-avatar body-avatar--${tone}`}>
      <svg
        className="body-avatar__svg"
        viewBox="0 0 200 420"
        role="img"
        aria-label={`${label}. ${caption}.`}
      >
        <defs>
          <linearGradient id={fillId} x1="30%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#5b8cff" />
            <stop offset="55%" stopColor="#4a63d8" />
            <stop offset="100%" stopColor="#2a3348" />
          </linearGradient>
        </defs>
        <g
          className="body-avatar__figure"
          style={{ transform: `translate(0px, ${(1 - scaleY) * 24}px) scale(1, ${scaleY})` }}
        >
          <ellipse cx="100" cy="46" rx="22" ry="24" fill={`url(#${fillId})`} />
          <rect x="94" y="66" width="12" height="16" rx="6" fill={`url(#${fillId})`} />
          <path d={torso} fill={`url(#${fillId})`} />
          <rect
            x={100 - shoulderW / 2 - armW}
            y="86"
            width={armW}
            height="108"
            rx={armW / 2}
            fill={`url(#${fillId})`}
          />
          <rect
            x={100 + shoulderW / 2}
            y="86"
            width={armW}
            height="108"
            rx={armW / 2}
            fill={`url(#${fillId})`}
          />
          <rect
            x={100 - hipW / 2 + 2}
            y="196"
            width={thighW}
            height="92"
            rx={thighW / 2}
            fill={`url(#${fillId})`}
          />
          <rect
            x={100 + hipW / 2 - 2 - thighW}
            y="196"
            width={thighW}
            height="92"
            rx={thighW / 2}
            fill={`url(#${fillId})`}
          />
          <rect
            x={100 - hipW / 2 + 6}
            y="284"
            width={calfW}
            height="78"
            rx={calfW / 2}
            fill={`url(#${fillId})`}
          />
          <rect
            x={100 + hipW / 2 - 6 - calfW}
            y="284"
            width={calfW}
            height="78"
            rx={calfW / 2}
            fill={`url(#${fillId})`}
          />
        </g>
      </svg>
      <figcaption>
        <strong>{label}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  )
}
