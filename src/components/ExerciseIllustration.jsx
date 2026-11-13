import { EXERCISE_POSE_MAP } from '../data/exerciseMediaMap'

const GREEN = '#00E58F'
const GREEN_DIM = '#00C97B'
const WHITE = '#E2E8F0'

const POSES = {
  'bench-flat': (
    <>
      <rect x="40" y="200" width="240" height="12" rx="4" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="160" cy="175" rx="55" ry="8" fill="none" stroke={GREEN} strokeWidth="3" />
      <line x1="105" y1="175" x2="70" y2="175" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <line x1="215" y1="175" x2="250" y2="175" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="160" cy="155" r="14" fill={GREEN} opacity="0.9" />
      <line x1="160" y1="169" x2="160" y2="195" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'bench-incline': (
    <>
      <polygon points="60,210 260,170 260,182 60,222" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="155" cy="158" rx="50" ry="7" transform="rotate(-12 155 158)" fill="none" stroke={GREEN} strokeWidth="3" />
      <circle cx="145" cy="142" r="12" fill={GREEN} opacity="0.9" />
      <line x1="100" y1="165" x2="65" y2="178" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <line x1="210" y1="152" x2="245" y2="140" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  fly: (
    <>
      <rect x="50" y="195" width="220" height="10" rx="3" fill="#1e293b" stroke={GREEN} strokeWidth="1" />
      <circle cx="160" cy="155" r="12" fill={GREEN} />
      <path d="M120 175 Q160 220 200 175" stroke={GREEN} strokeWidth="3" fill="none" />
      <line x1="120" y1="175" x2="90" y2="200" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <line x1="200" y1="175" x2="230" y2="200" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  'cable-fly': (
    <>
      <rect x="30" y="80" width="8" height="180" fill="#334155" />
      <rect x="282" y="80" width="8" height="180" fill="#334155" />
      <circle cx="160" cy="150" r="12" fill={GREEN} />
      <line x1="38" y1="120" x2="120" y2="170" stroke={GREEN} strokeWidth="2" />
      <line x1="282" y1="120" x2="200" y2="170" stroke={GREEN} strokeWidth="2" />
      <line x1="120" y1="170" x2="90" y2="195" stroke={WHITE} strokeWidth="3" />
      <line x1="200" y1="170" x2="230" y2="195" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  pushup: (
    <>
      <line x1="80" y1="200" x2="240" y2="200" stroke="#334155" strokeWidth="2" />
      <line x1="100" y1="200" x2="180" y2="165" stroke={WHITE} strokeWidth="3" />
      <line x1="180" y1="165" x2="220" y2="200" stroke={WHITE} strokeWidth="3" />
      <circle cx="95" cy="198" r="10" fill={GREEN} />
    </>
  ),
  'shoulder-press': (
    <>
      <circle cx="160" cy="175" r="12" fill={GREEN} />
      <line x1="160" y1="187" x2="160" y2="220" stroke={WHITE} strokeWidth="3" />
      <line x1="120" y1="200" x2="100" y2="140" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <line x1="200" y1="200" x2="220" y2="140" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="140" x2="220" y2="140" stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  'lateral-raise': (
    <>
      <circle cx="160" cy="170" r="12" fill={GREEN} />
      <line x1="160" y1="182" x2="160" y2="220" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="195" x2="100" y2="155" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <line x1="160" y1="195" x2="220" y2="155" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="155" r="6" fill={GREEN_DIM} />
      <circle cx="220" cy="155" r="6" fill={GREEN_DIM} />
    </>
  ),
  'tricep-pushdown': (
    <>
      <rect x="150" y="40" width="20" height="60" fill="#334155" />
      <line x1="160" y1="100" x2="160" y2="130" stroke={GREEN} strokeWidth="2" />
      <circle cx="160" cy="145" r="12" fill={GREEN} />
      <line x1="160" y1="157" x2="160" y2="210" stroke={WHITE} strokeWidth="3" />
      <line x1="145" y1="220" x2="175" y2="220" stroke={GREEN} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  'tricep-rope': (
    <>
      <rect x="150" y="40" width="20" height="50" fill="#334155" />
      <path d="M150 95 Q160 110 170 95" stroke={GREEN} strokeWidth="2" fill="none" />
      <circle cx="160" cy="130" r="11" fill={GREEN} />
      <line x1="150" y1="200" x2="140" y2="230" stroke={WHITE} strokeWidth="3" />
      <line x1="170" y1="200" x2="180" y2="230" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'barbell-row': (
    <>
      <line x1="80" y1="210" x2="240" y2="210" stroke="#334155" strokeWidth="2" />
      <line x1="120" y1="210" x2="140" y2="160" stroke={WHITE} strokeWidth="3" />
      <line x1="200" y1="210" x2="180" y2="160" stroke={WHITE} strokeWidth="3" />
      <circle cx="160" cy="148" r="12" fill={GREEN} />
      <line x1="90" y1="175" x2="230" y2="175" stroke={GREEN} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  'lat-pulldown': (
    <>
      <rect x="120" y="30" width="80" height="15" fill="#334155" />
      <line x1="160" y1="45" x2="160" y2="70" stroke={GREEN} strokeWidth="2" />
      <circle cx="160" cy="95" r="12" fill={GREEN} />
      <line x1="160" y1="107" x2="160" y2="200" stroke={WHITE} strokeWidth="3" />
      <line x1="130" y1="120" x2="100" y2="90" stroke={WHITE} strokeWidth="3" />
      <line x1="190" y1="120" x2="220" y2="90" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'cable-row': (
    <>
      <rect x="40" y="120" width="12" height="100" fill="#334155" />
      <line x1="52" y1="160" x2="120" y2="175" stroke={GREEN} strokeWidth="2" />
      <circle cx="145" cy="178" r="11" fill={GREEN} />
      <line x1="145" y1="189" x2="145" y2="220" stroke={WHITE} strokeWidth="3" />
      <line x1="120" y1="175" x2="90" y2="195" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'dumbbell-row': (
    <>
      <circle cx="175" cy="175" r="11" fill={GREEN} />
      <line x1="120" y1="210" x2="175" y2="186" stroke={WHITE} strokeWidth="3" />
      <line x1="175" y1="210" x2="175" y2="186" stroke={WHITE} strokeWidth="3" />
      <rect x="95" y="168" width="20" height="14" rx="3" fill={GREEN} opacity="0.8" />
    </>
  ),
  'barbell-curl': (
    <>
      <circle cx="160" cy="155" r="12" fill={GREEN} />
      <line x1="160" y1="167" x2="160" y2="220" stroke={WHITE} strokeWidth="3" />
      <path d="M120 195 Q160 140 200 195" stroke={GREEN} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="115" y1="195" x2="105" y2="195" stroke={GREEN_DIM} strokeWidth="6" strokeLinecap="round" />
      <line x1="205" y1="195" x2="215" y2="195" stroke={GREEN_DIM} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  'hammer-curl': (
    <>
      <circle cx="160" cy="155" r="12" fill={GREEN} />
      <line x1="160" y1="167" x2="160" y2="220" stroke={WHITE} strokeWidth="3" />
      <line x1="140" y1="200" x2="130" y2="155" stroke={WHITE} strokeWidth="3" />
      <line x1="180" y1="200" x2="190" y2="155" stroke={WHITE} strokeWidth="3" />
      <rect x="125" y="150" width="10" height="12" fill={GREEN} />
      <rect x="185" y="150" width="10" height="12" fill={GREEN} />
    </>
  ),
  'face-pull': (
    <>
      <rect x="260" y="100" width="10" height="80" fill="#334155" />
      <line x1="260" y1="130" x2="180" y2="155" stroke={GREEN} strokeWidth="2" />
      <circle cx="155" cy="160" r="11" fill={GREEN} />
      <line x1="130" y1="165" x2="100" y2="175" stroke={WHITE} strokeWidth="3" />
      <line x1="180" y1="165" x2="210" y2="175" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  squat: (
    <>
      <circle cx="160" cy="120" r="13" fill={GREEN} />
      <line x1="160" y1="133" x2="160" y2="175" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="175" x2="120" y2="215" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="175" x2="200" y2="215" stroke={WHITE} strokeWidth="3" />
      <line x1="130" y1="195" x2="190" y2="195" stroke={GREEN} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  'goblet-squat': (
    <>
      <circle cx="160" cy="115" r="12" fill={GREEN} />
      <rect x="152" y="95" width="16" height="20" rx="3" fill={GREEN_DIM} />
      <line x1="160" y1="127" x2="160" y2="170" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="170" x2="125" y2="210" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="170" x2="195" y2="210" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'leg-press': (
    <>
      <path d="M80 220 L80 120 L200 80 L200 220 Z" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" opacity="0.7" />
      <circle cx="140" cy="130" r="11" fill={GREEN} />
      <line x1="140" y1="141" x2="155" y2="175" stroke={WHITE} strokeWidth="3" />
      <line x1="155" y1="175" x2="175" y2="195" stroke={WHITE} strokeWidth="3" />
      <rect x="165" y="185" width="40" height="8" rx="2" fill={GREEN_DIM} />
    </>
  ),
  'leg-extension': (
    <>
      <rect x="100" y="180" width="120" height="40" rx="8" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" />
      <circle cx="160" cy="155" r="11" fill={GREEN} />
      <line x1="160" y1="166" x2="160" y2="195" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="195" x2="200" y2="155" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'leg-curl': (
    <>
      <rect x="100" y="170" width="120" height="35" rx="8" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" />
      <circle cx="130" cy="155" r="11" fill={GREEN} />
      <line x1="130" y1="166" x2="160" y2="195" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="195" x2="120" y2="175" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  deadlift: (
    <>
      <circle cx="160" cy="130" r="12" fill={GREEN} />
      <line x1="160" y1="142" x2="160" y2="200" stroke={WHITE} strokeWidth="3" />
      <line x1="100" y1="205" x2="220" y2="205" stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  lunge: (
    <>
      <circle cx="145" cy="125" r="11" fill={GREEN} />
      <line x1="145" y1="136" x2="130" y2="185" stroke={WHITE} strokeWidth="3" />
      <line x1="145" y1="160" x2="195" y2="210" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'hip-thrust': (
    <>
      <rect x="80" y="195" width="160" height="12" rx="4" fill="#1e293b" stroke={GREEN} strokeWidth="1" />
      <circle cx="160" cy="165" r="11" fill={GREEN} />
      <rect x="150" y="175" width="20" height="14" rx="3" fill={GREEN_DIM} />
    </>
  ),
  calf: (
    <>
      <circle cx="160" cy="130" r="11" fill={GREEN} />
      <line x1="160" y1="141" x2="160" y2="200" stroke={WHITE} strokeWidth="3" />
      <rect x="130" y="225" width="60" height="6" fill="#334155" />
    </>
  ),
  plank: (
    <>
      <line x1="70" y1="185" x2="250" y2="185" stroke="#334155" strokeWidth="2" />
      <line x1="90" y1="185" x2="220" y2="185" stroke={WHITE} strokeWidth="4" />
      <circle cx="85" cy="163" r="10" fill={GREEN} />
    </>
  ),
  'side-plank': (
    <>
      <line x1="140" y1="150" x2="200" y2="150" stroke={WHITE} strokeWidth="4" />
      <circle cx="138" cy="125" r="9" fill={GREEN} />
    </>
  ),
  crunch: (
    <>
      <path d="M120 210 Q160 150 200 210" stroke={WHITE} strokeWidth="3" fill="none" />
      <circle cx="160" cy="155" r="11" fill={GREEN} />
    </>
  ),
  'leg-raise': (
    <>
      <circle cx="160" cy="175" r="11" fill={GREEN} />
      <line x1="140" y1="175" x2="120" y2="140" stroke={WHITE} strokeWidth="3" />
      <line x1="180" y1="175" x2="200" y2="140" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'dead-bug': (
    <>
      <circle cx="160" cy="175" r="11" fill={GREEN} />
      <line x1="140" y1="195" x2="120" y2="160" stroke={WHITE} strokeWidth="3" />
      <line x1="180" y1="195" x2="200" y2="160" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'bird-dog': (
    <>
      <line x1="100" y1="200" x2="180" y2="175" stroke={WHITE} strokeWidth="3" />
      <line x1="100" y1="200" x2="70" y2="170" stroke={WHITE} strokeWidth="3" />
      <line x1="220" y1="200" x2="250" y2="170" stroke={WHITE} strokeWidth="3" />
      <circle cx="175" cy="168" r="10" fill={GREEN} />
    </>
  ),
  'pallof-press': (
    <>
      <rect x="40" y="120" width="10" height="90" fill="#334155" />
      <line x1="175" y1="173" x2="230" y2="173" stroke={WHITE} strokeWidth="3" />
      <circle cx="155" cy="173" r="10" fill={GREEN} />
    </>
  ),
  burpee: (
    <>
      <circle cx="160" cy="110" r="11" fill={GREEN} />
      <line x1="130" y1="160" x2="190" y2="160" stroke={WHITE} strokeWidth="3" />
      <line x1="130" y1="160" x2="120" y2="200" stroke={WHITE} strokeWidth="3" />
      <line x1="190" y1="160" x2="200" y2="200" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  kettlebell: (
    <>
      <circle cx="160" cy="130" r="11" fill={GREEN} />
      <ellipse cx="175" cy="195" rx="22" ry="28" fill={GREEN_DIM} opacity="0.9" />
    </>
  ),
  'farmer-walk': (
    <>
      <rect x="115" y="175" width="18" height="22" rx="3" fill={GREEN} />
      <rect x="187" y="175" width="18" height="22" rx="3" fill={GREEN} />
      <circle cx="160" cy="140" r="10" fill={GREEN} />
    </>
  ),
  'step-up': (
    <>
      <rect x="80" y="195" width="60" height="30" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" />
      <circle cx="175" cy="130" r="11" fill={GREEN} />
      <line x1="155" y1="195" x2="130" y2="195" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'battle-rope': (
    <>
      <path d="M80 180 Q100 150 120 180 Q140 210 160 180 Q180 150 200 180 Q220 210 240 180" stroke={GREEN} strokeWidth="4" fill="none" />
      <circle cx="160" cy="140" r="11" fill={GREEN} />
    </>
  ),
  treadmill: (
    <>
      <rect x="70" y="170" width="180" height="50" rx="8" fill="#1e293b" stroke={GREEN} strokeWidth="1.5" />
      <circle cx="160" cy="145" r="11" fill={GREEN} />
    </>
  ),
  cycling: (
    <>
      <circle cx="120" cy="210" r="28" fill="none" stroke={GREEN} strokeWidth="3" />
      <circle cx="200" cy="210" r="28" fill="none" stroke={GREEN} strokeWidth="3" />
      <circle cx="160" cy="155" r="10" fill={GREEN} />
    </>
  ),
  stretch: (
    <>
      <circle cx="160" cy="140" r="11" fill={GREEN} />
      <line x1="160" y1="170" x2="120" y2="130" stroke={WHITE} strokeWidth="3" />
      <line x1="160" y1="170" x2="200" y2="130" stroke={WHITE} strokeWidth="3" />
    </>
  ),
  'hip-mobility': (
    <>
      <circle cx="160" cy="150" r="11" fill={GREEN} />
      <line x1="160" y1="180" x2="200" y2="150" stroke={WHITE} strokeWidth="3" />
      <circle cx="200" cy="148" r="8" fill="none" stroke={GREEN} strokeWidth="2" />
    </>
  ),
  'cat-cow': (
    <>
      <path d="M100 200 Q140 160 180 175 Q220 190 220 200" stroke={GREEN} strokeWidth="2" fill="none" />
      <circle cx="175" cy="168" r="9" fill={GREEN} />
    </>
  ),
  warmup: (
    <>
      <circle cx="160" cy="145" r="11" fill={GREEN} />
      <path d="M120 200 Q160 120 200 200" stroke={GREEN_DIM} strokeWidth="2" fill="none" opacity="0.5" />
    </>
  ),
}

const FALLBACK_POSES = {
  peito: 'bench-flat',
  costas: 'barbell-row',
  pernas: 'squat',
  ombros: 'shoulder-press',
  biceps: 'barbell-curl',
  triceps: 'tricep-rope',
  bracos: 'barbell-curl',
  abdomen: 'plank',
  cardio: 'treadmill',
  mobilidade: 'stretch',
  funcional: 'burpee',
}

export function getPoseKey(exercise) {
  if (!exercise) return 'squat'
  const fromId = EXERCISE_POSE_MAP[exercise.id]
  if (fromId && POSES[fromId]) return fromId
  const fromPose = exercise.poseKey
  if (fromPose && POSES[fromPose]) return fromPose
  if (fromPose && FALLBACK_POSES[fromPose]) return FALLBACK_POSES[fromPose]
  return 'squat'
}

export default function ExerciseIllustration({ exercise, className = '' }) {
  const poseKey = getPoseKey(exercise)
  const pose = POSES[poseKey] || POSES.squat
  const label = exercise?.name || 'Exercício'

  return (
    <svg
      viewBox="0 0 320 240"
      className={`exercise-illustration ${className}`.trim()}
      role="img"
      aria-label={`Demonstração: ${label}`}
    >
      <defs>
        <linearGradient id="ex-bg" x1="0" y1="0" x2="320" y2="240">
          <stop stopColor="#0b1020" />
          <stop offset="1" stopColor="#152238" />
        </linearGradient>
        <radialGradient id="ex-glow" cx="50%" cy="45%" r="55%">
          <stop stopColor="#00E58F" stopOpacity="0.14" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#ex-bg)" />
      <rect width="320" height="240" fill="url(#ex-glow)" />
      <g transform="translate(0, 10)">{pose}</g>
      <text x="160" y="228" textAnchor="middle" fill="#E2E8F0" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="600">
        {label.length > 34 ? `${label.slice(0, 32)}…` : label}
      </text>
      <text x="160" y="238" textAnchor="middle" fill="#00E58F" fontFamily="system-ui, sans-serif" fontSize="8" opacity="0.85">
        {exercise?.type || 'EvoluaFit'}
      </text>
    </svg>
  )
}
