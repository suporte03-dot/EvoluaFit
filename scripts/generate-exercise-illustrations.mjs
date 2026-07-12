/**
 * Gera ilustrações SVG originais por exercício (EvoluaFit).
 * Cada arquivo representa visualmente o movimento correto — sem assets de terceiros.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/media/exercises')
const fallbackDir = join(outDir, 'fallbacks')

const GREEN = '#00E58F'
const GREEN_DIM = '#00C97B'
const WHITE = '#E2E8F0'
const BG1 = '#0b1020'
const BG2 = '#152238'

/** Pose SVG paths por tipo de movimento */
const POSES = {
  'bench-flat': `<rect x="40" y="200" width="240" height="12" rx="4" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5" opacity="0.6"/>
    <ellipse cx="160" cy="175" rx="55" ry="8" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <line x1="105" y1="175" x2="70" y2="175" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
    <line x1="215" y1="175" x2="250" y2="175" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="160" cy="155" r="14" fill="${GREEN}" opacity="0.9"/>
    <line x1="160" y1="169" x2="160" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  'bench-incline': `<polygon points="60,210 260,170 260,182 60,222" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5" opacity="0.6"/>
    <ellipse cx="155" cy="158" rx="50" ry="7" transform="rotate(-12 155 158)" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <circle cx="145" cy="142" r="12" fill="${GREEN}" opacity="0.9"/>
    <line x1="100" y1="165" x2="65" y2="178" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    <line x1="210" y1="152" x2="245" y2="140" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>`,
  'fly': `<rect x="50" y="195" width="220" height="10" rx="3" fill="#1e293b" stroke="${GREEN}" stroke-width="1"/>
    <circle cx="160" cy="155" r="12" fill="${GREEN}"/>
    <path d="M120 175 Q160 220 200 175" stroke="${GREEN}" stroke-width="3" fill="none"/>
    <line x1="120" y1="175" x2="90" y2="200" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    <line x1="200" y1="175" x2="230" y2="200" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>`,
  'cable-fly': `<rect x="30" y="80" width="8" height="180" fill="#334155"/>
    <rect x="282" y="80" width="8" height="180" fill="#334155"/>
    <circle cx="160" cy="150" r="12" fill="${GREEN}"/>
    <line x1="38" y1="120" x2="120" y2="170" stroke="${GREEN}" stroke-width="2"/>
    <line x1="282" y1="120" x2="200" y2="170" stroke="${GREEN}" stroke-width="2"/>
    <line x1="120" y1="170" x2="90" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="200" y1="170" x2="230" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  pushup: `<line x1="80" y1="200" x2="240" y2="200" stroke="#334155" stroke-width="2"/>
    <line x1="100" y1="200" x2="180" y2="165" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="165" x2="220" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="95" cy="198" r="10" fill="${GREEN}"/>`,
  'shoulder-press': `<circle cx="160" cy="175" r="12" fill="${GREEN}"/>
    <line x1="160" y1="187" x2="160" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="120" y1="200" x2="100" y2="140" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
    <line x1="200" y1="200" x2="220" y2="140" stroke="${WHITE}" stroke-width="4" stroke-linecap="round"/>
    <line x1="100" y1="140" x2="220" y2="140" stroke="${GREEN}" stroke-width="5" stroke-linecap="round"/>`,
  'lateral-raise': `<circle cx="160" cy="170" r="12" fill="${GREEN}"/>
    <line x1="160" y1="182" x2="160" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="195" x2="100" y2="155" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    <line x1="160" y1="195" x2="220" y2="155" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="100" cy="155" r="6" fill="${GREEN_DIM}"/>
    <circle cx="220" cy="155" r="6" fill="${GREEN_DIM}"/>`,
  'tricep-pushdown': `<rect x="150" y="40" width="20" height="60" fill="#334155"/>
    <line x1="160" y1="100" x2="160" y2="130" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="160" cy="145" r="12" fill="${GREEN}"/>
    <line x1="160" y1="157" x2="160" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="175" x2="160" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="145" y1="220" x2="175" y2="220" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/>`,
  'tricep-rope': `<rect x="150" y="40" width="20" height="50" fill="#334155"/>
    <path d="M150 95 Q160 110 170 95" stroke="${GREEN}" stroke-width="2" fill="none"/>
    <circle cx="160" cy="130" r="11" fill="${GREEN}"/>
    <line x1="150" y1="200" x2="140" y2="230" stroke="${WHITE}" stroke-width="3"/>
    <line x1="170" y1="200" x2="180" y2="230" stroke="${WHITE}" stroke-width="3"/>`,
  'barbell-row': `<line x1="80" y1="210" x2="240" y2="210" stroke="#334155" stroke-width="2"/>
    <line x1="120" y1="210" x2="140" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <line x1="200" y1="210" x2="180" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="160" cy="148" r="12" fill="${GREEN}"/>
    <line x1="90" y1="175" x2="230" y2="175" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/>`,
  'lat-pulldown': `<rect x="120" y="30" width="80" height="15" fill="#334155"/>
    <line x1="160" y1="45" x2="160" y2="70" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="160" cy="95" r="12" fill="${GREEN}"/>
    <line x1="160" y1="107" x2="160" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="120" x2="100" y2="90" stroke="${WHITE}" stroke-width="3"/>
    <line x1="190" y1="120" x2="220" y2="90" stroke="${WHITE}" stroke-width="3"/>`,
  'cable-row': `<rect x="40" y="120" width="12" height="100" fill="#334155"/>
    <line x1="52" y1="160" x2="120" y2="175" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="145" cy="178" r="11" fill="${GREEN}"/>
    <line x1="145" y1="189" x2="145" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="120" y1="175" x2="90" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  'dumbbell-row': `<circle cx="175" cy="175" r="11" fill="${GREEN}"/>
    <line x1="120" y1="210" x2="175" y2="186" stroke="${WHITE}" stroke-width="3"/>
    <line x1="175" y1="210" x2="175" y2="186" stroke="${WHITE}" stroke-width="3"/>
    <rect x="95" y="168" width="20" height="14" rx="3" fill="${GREEN}" opacity="0.8"/>`,
  'barbell-curl': `<circle cx="160" cy="155" r="12" fill="${GREEN}"/>
    <line x1="160" y1="167" x2="160" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <path d="M120 195 Q160 140 200 195" stroke="${GREEN}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <line x1="115" y1="195" x2="105" y2="195" stroke="${GREEN_DIM}" stroke-width="6" stroke-linecap="round"/>
    <line x1="205" y1="195" x2="215" y2="195" stroke="${GREEN_DIM}" stroke-width="6" stroke-linecap="round"/>`,
  'hammer-curl': `<circle cx="160" cy="155" r="12" fill="${GREEN}"/>
    <line x1="160" y1="167" x2="160" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="140" y1="200" x2="130" y2="155" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="200" x2="190" y2="155" stroke="${WHITE}" stroke-width="3"/>
    <rect x="125" y="150" width="10" height="12" fill="${GREEN}"/>
    <rect x="185" y="150" width="10" height="12" fill="${GREEN}"/>`,
  'face-pull': `<rect x="260" y="100" width="10" height="80" fill="#334155"/>
    <line x1="260" y1="130" x2="180" y2="155" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="155" cy="160" r="11" fill="${GREEN}"/>
    <line x1="130" y1="165" x2="100" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="165" x2="210" y2="175" stroke="${WHITE}" stroke-width="3"/>`,
  squat: `<circle cx="160" cy="120" r="13" fill="${GREEN}"/>
    <line x1="160" y1="133" x2="160" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="175" x2="120" y2="215" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="175" x2="200" y2="215" stroke="${WHITE}" stroke-width="3"/>
    <line x1="120" y1="215" x2="115" y2="230" stroke="${WHITE}" stroke-width="3"/>
    <line x1="200" y1="215" x2="205" y2="230" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="195" x2="190" y2="195" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/>`,
  'goblet-squat': `<circle cx="160" cy="115" r="12" fill="${GREEN}"/>
    <rect x="152" y="95" width="16" height="20" rx="3" fill="${GREEN_DIM}"/>
    <line x1="160" y1="127" x2="160" y2="170" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="170" x2="125" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="170" x2="195" y2="210" stroke="${WHITE}" stroke-width="3"/>`,
  'leg-press': `<path d="M80 220 L80 120 L200 80 L200 220 Z" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5" opacity="0.7"/>
    <circle cx="140" cy="130" r="11" fill="${GREEN}"/>
    <line x1="140" y1="141" x2="155" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="155" y1="175" x2="175" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <rect x="165" y="185" width="40" height="8" rx="2" fill="${GREEN_DIM}"/>`,
  'leg-extension': `<rect x="100" y="180" width="120" height="40" rx="8" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5"/>
    <circle cx="160" cy="155" r="11" fill="${GREEN}"/>
    <line x1="160" y1="166" x2="160" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="195" x2="200" y2="155" stroke="${WHITE}" stroke-width="3"/>`,
  'leg-curl': `<rect x="100" y="170" width="120" height="35" rx="8" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5"/>
    <circle cx="130" cy="155" r="11" fill="${GREEN}"/>
    <line x1="130" y1="166" x2="160" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="195" x2="120" y2="175" stroke="${WHITE}" stroke-width="3"/>`,
  deadlift: `<circle cx="160" cy="130" r="12" fill="${GREEN}"/>
    <line x1="160" y1="142" x2="160" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="200" x2="190" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="100" y1="205" x2="220" y2="205" stroke="${GREEN}" stroke-width="5" stroke-linecap="round"/>`,
  lunge: `<circle cx="145" cy="125" r="11" fill="${GREEN}"/>
    <line x1="145" y1="136" x2="130" y2="185" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="185" x2="110" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <line x1="145" y1="160" x2="195" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="195" y1="210" x2="200" y2="230" stroke="${WHITE}" stroke-width="3"/>`,
  'hip-thrust': `<rect x="80" y="195" width="160" height="12" rx="4" fill="#1e293b" stroke="${GREEN}" stroke-width="1"/>
    <circle cx="160" cy="165" r="11" fill="${GREEN}"/>
    <line x1="120" y1="175" x2="100" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="200" y1="175" x2="220" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="176" x2="160" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <rect x="150" y="175" width="20" height="14" rx="3" fill="${GREEN_DIM}"/>`,
  calf: `<circle cx="160" cy="130" r="11" fill="${GREEN}"/>
    <line x1="160" y1="141" x2="160" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="145" y1="200" x2="145" y2="225" stroke="${WHITE}" stroke-width="3"/>
    <line x1="175" y1="200" x2="175" y2="220" stroke="${WHITE}" stroke-width="3"/>
    <rect x="130" y="225" width="60" height="6" fill="#334155"/>`,
  plank: `<line x1="70" y1="185" x2="250" y2="185" stroke="#334155" stroke-width="2"/>
    <line x1="90" y1="185" x2="220" y2="185" stroke="${WHITE}" stroke-width="4"/>
    <line x1="90" y1="185" x2="90" y2="165" stroke="${WHITE}" stroke-width="3"/>
    <line x1="220" y1="185" x2="240" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="85" cy="163" r="10" fill="${GREEN}"/>`,
  'side-plank': `<line x1="140" y1="80" x2="140" y2="220" stroke="#334155" stroke-width="2"/>
    <line x1="140" y1="150" x2="200" y2="150" stroke="${WHITE}" stroke-width="4"/>
    <line x1="140" y1="150" x2="140" y2="130" stroke="${WHITE}" stroke-width="3"/>
    <line x1="200" y1="150" x2="210" y2="135" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="138" cy="125" r="9" fill="${GREEN}"/>`,
  crunch: `<line x1="80" y1="210" x2="240" y2="210" stroke="#334155" stroke-width="2"/>
    <path d="M120 210 Q160 150 200 210" stroke="${WHITE}" stroke-width="3" fill="none"/>
    <circle cx="160" cy="155" r="11" fill="${GREEN}"/>
    <line x1="140" y1="175" x2="120" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="175" x2="200" y2="210" stroke="${WHITE}" stroke-width="3"/>`,
  'leg-raise': `<line x1="80" y1="210" x2="240" y2="210" stroke="#334155" stroke-width="2"/>
    <circle cx="160" cy="175" r="11" fill="${GREEN}"/>
    <line x1="140" y1="210" x2="140" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="210" x2="180" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="140" y1="175" x2="120" y2="140" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="175" x2="200" y2="140" stroke="${WHITE}" stroke-width="3"/>`,
  'dead-bug': `<line x1="80" y1="210" x2="240" y2="210" stroke="#334155" stroke-width="2"/>
    <circle cx="160" cy="175" r="11" fill="${GREEN}"/>
    <line x1="140" y1="195" x2="120" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="195" x2="200" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <line x1="140" y1="210" x2="110" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="210" x2="210" y2="210" stroke="${WHITE}" stroke-width="3"/>`,
  'bird-dog': `<line x1="100" y1="200" x2="180" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="175" x2="220" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="100" y1="200" x2="70" y2="170" stroke="${WHITE}" stroke-width="3"/>
    <line x1="220" y1="200" x2="250" y2="170" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="175" cy="168" r="10" fill="${GREEN}"/>`,
  'pallof-press': `<rect x="40" y="120" width="10" height="90" fill="#334155"/>
    <line x1="50" y1="155" x2="130" y2="170" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="155" cy="173" r="10" fill="${GREEN}"/>
    <line x1="175" y1="173" x2="230" y2="173" stroke="${WHITE}" stroke-width="3"/>`,
  burpee: `<circle cx="160" cy="110" r="11" fill="${GREEN}"/>
    <line x1="160" y1="121" x2="160" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="160" x2="190" y2="160" stroke="${WHITE}" stroke-width="3"/>
    <line x1="130" y1="160" x2="120" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="190" y1="160" x2="200" y2="200" stroke="${WHITE}" stroke-width="3"/>`,
  kettlebell: `<circle cx="160" cy="130" r="11" fill="${GREEN}"/>
    <line x1="160" y1="141" x2="160" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <ellipse cx="175" cy="195" rx="22" ry="28" fill="${GREEN_DIM}" opacity="0.9"/>
    <path d="M168 175 Q175 160 182 175" stroke="${WHITE}" stroke-width="2" fill="none"/>`,
  'farmer-walk': `<circle cx="140" cy="140" r="10" fill="${GREEN}"/>
    <line x1="140" y1="150" x2="140" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="150" x2="180" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <rect x="115" y="175" width="18" height="22" rx="3" fill="${GREEN}"/>
    <rect x="187" y="175" width="18" height="22" rx="3" fill="${GREEN}"/>`,
  'step-up': `<rect x="80" y="195" width="60" height="30" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5"/>
    <circle cx="175" cy="130" r="11" fill="${GREEN}"/>
    <line x1="175" y1="141" x2="155" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="155" y1="195" x2="130" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  'battle-rope': `<circle cx="160" cy="140" r="11" fill="${GREEN}"/>
    <line x1="160" y1="151" x2="160" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <path d="M80 180 Q100 150 120 180 Q140 210 160 180 Q180 150 200 180 Q220 210 240 180" stroke="${GREEN}" stroke-width="4" fill="none"/>`,
  treadmill: `<rect x="70" y="170" width="180" height="50" rx="8" fill="#1e293b" stroke="${GREEN}" stroke-width="1.5"/>
    <circle cx="160" cy="145" r="11" fill="${GREEN}"/>
    <line x1="160" y1="156" x2="160" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="145" y1="175" x2="135" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="175" y1="175" x2="185" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  cycling: `<circle cx="120" cy="210" r="28" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <circle cx="200" cy="210" r="28" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <circle cx="160" cy="155" r="10" fill="${GREEN}"/>
    <line x1="160" y1="165" x2="145" y2="195" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="165" x2="175" y2="195" stroke="${WHITE}" stroke-width="3"/>`,
  stretch: `<circle cx="160" cy="140" r="11" fill="${GREEN}"/>
    <line x1="160" y1="151" x2="160" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="170" x2="120" y2="130" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="170" x2="200" y2="130" stroke="${WHITE}" stroke-width="3"/>
    <path d="M120 210 Q160 230 200 210" stroke="${GREEN_DIM}" stroke-width="2" fill="none"/>`,
  'hip-mobility': `<circle cx="160" cy="150" r="11" fill="${GREEN}"/>
    <line x1="120" y1="210" x2="200" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="161" x2="160" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="160" y1="180" x2="200" y2="150" stroke="${WHITE}" stroke-width="3"/>
    <circle cx="200" cy="148" r="8" fill="none" stroke="${GREEN}" stroke-width="2"/>`,
  'cat-cow': `<line x1="100" y1="200" x2="180" y2="175" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="175" x2="220" y2="200" stroke="${WHITE}" stroke-width="3"/>
    <path d="M100 200 Q140 160 180 175 Q220 190 220 200" stroke="${GREEN}" stroke-width="2" fill="none"/>
    <circle cx="175" cy="168" r="9" fill="${GREEN}"/>`,
  warmup: `<circle cx="160" cy="145" r="11" fill="${GREEN}"/>
    <path d="M120 200 Q160 120 200 200" stroke="${GREEN_DIM}" stroke-width="2" fill="none" opacity="0.5"/>
    <line x1="160" y1="156" x2="160" y2="210" stroke="${WHITE}" stroke-width="3"/>
    <line x1="140" y1="190" x2="120" y2="170" stroke="${WHITE}" stroke-width="3"/>
    <line x1="180" y1="190" x2="200" y2="170" stroke="${WHITE}" stroke-width="3"/>`,
}

/** Mapeamento exercício → pose única */
export const EXERCISE_POSE_MAP = {
  'supino-reto': 'bench-flat',
  'supino-inclinado': 'bench-incline',
  crucifixo: 'fly',
  'crucifixo-inclinado': 'fly',
  'crucifixo-cabo': 'cable-fly',
  flexao: 'pushup',
  desenvolvimento: 'shoulder-press',
  'desenvolvimento-arnold': 'shoulder-press',
  'elevacao-lateral': 'lateral-raise',
  'elevacao-frontal-lateral': 'lateral-raise',
  'triceps-pulley': 'tricep-rope',
  'remada-curvada': 'barbell-row',
  'puxada-frontal': 'lat-pulldown',
  'puxada-triangulo': 'lat-pulldown',
  'puxada-neutra': 'lat-pulldown',
  'remada-unilateral': 'dumbbell-row',
  'remada-baixa-cabo': 'cable-row',
  'rosca-direta': 'barbell-curl',
  'rosca-martelo': 'hammer-curl',
  'rosca-alternada': 'hammer-curl',
  'face-pull': 'face-pull',
  agachamento: 'squat',
  'agachamento-frontal': 'squat',
  'agachamento-goblet': 'goblet-squat',
  'leg-press': 'leg-press',
  'cadeira-extensora': 'leg-extension',
  stiff: 'deadlift',
  'cadeira-flexora': 'leg-curl',
  afundo: 'lunge',
  'passada-lateral': 'lunge',
  'hip-thrust': 'hip-thrust',
  'ponte-gluteos': 'hip-thrust',
  panturrilha: 'calf',
  'levantamento-terra-halteres': 'deadlift',
  prancha: 'plank',
  'prancha-lateral': 'side-plank',
  'abdominal-bicicleta': 'crunch',
  'abdominal-infra': 'leg-raise',
  'dead-bug': 'dead-bug',
  'bird-dog': 'bird-dog',
  'pallof-press': 'pallof-press',
  burpee: 'burpee',
  'kettlebell-swing': 'kettlebell',
  'farmer-walk': 'farmer-walk',
  'step-up': 'step-up',
  'battle-rope': 'battle-rope',
  'aquecimento-leve': 'warmup',
  'esteira-moderada': 'treadmill',
  'bicicleta-leve': 'cycling',
  desaquecimento: 'stretch',
  'rotacao-toracica': 'stretch',
  'alongamento-quadriceps': 'stretch',
  'mobilidade-quadril-90': 'hip-mobility',
  'alongamento-ombro': 'stretch',
  'gato-vaca': 'cat-cow',
}

const FALLBACK_POSES = {
  peito: 'bench-flat',
  costas: 'barbell-row',
  pernas: 'squat',
  ombros: 'shoulder-press',
  biceps: 'barbell-curl',
  triceps: 'tricep-pushdown',
  bracos: 'barbell-curl',
  abdomen: 'plank',
  cardio: 'treadmill',
  mobilidade: 'stretch',
  funcional: 'burpee',
}

function buildSvg(name, poseKey, subtitle = '') {
  const pose = POSES[poseKey] || POSES.squat
  const label = name.length > 32 ? `${name.slice(0, 30)}…` : name
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="320" y2="240">
      <stop stop-color="${BG1}"/><stop offset="1" stop-color="${BG2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop stop-color="${GREEN}" stop-opacity="0.14"/><stop offset="1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="320" height="240" fill="url(#bg)"/>
  <rect width="320" height="240" fill="url(#glow)"/>
  <g transform="translate(0,10)">${pose}</g>
  <text x="160" y="228" text-anchor="middle" fill="${WHITE}" font-family="system-ui,sans-serif" font-size="11" font-weight="600">${label}</text>
  ${subtitle ? `<text x="160" y="238" text-anchor="middle" fill="${GREEN}" font-family="system-ui,sans-serif" font-size="8" opacity="0.85">${subtitle}</text>` : ''}
</svg>`
}

const EXERCISE_NAMES = {
  'supino-reto': 'Supino reto',
  'supino-inclinado': 'Supino inclinado',
  crucifixo: 'Crucifixo',
  'crucifixo-inclinado': 'Crucifixo inclinado',
  'crucifixo-cabo': 'Crucifixo no cabo',
  flexao: 'Flexão de braço',
  desenvolvimento: 'Desenvolvimento',
  'desenvolvimento-arnold': 'Desenvolvimento Arnold',
  'elevacao-lateral': 'Elevação lateral',
  'elevacao-frontal-lateral': 'Elevação frontal + lateral',
  'triceps-pulley': 'Tríceps corda',
  'remada-curvada': 'Remada curvada',
  'puxada-frontal': 'Puxada frontal',
  'puxada-triangulo': 'Puxada triângulo',
  'puxada-neutra': 'Puxada neutra',
  'remada-unilateral': 'Remada unilateral',
  'remada-baixa-cabo': 'Remada baixa cabo',
  'rosca-direta': 'Rosca direta',
  'rosca-martelo': 'Rosca martelo',
  'rosca-alternada': 'Rosca alternada',
  'face-pull': 'Face pull',
  agachamento: 'Agachamento livre',
  'agachamento-frontal': 'Agachamento frontal',
  'agachamento-goblet': 'Agachamento goblet',
  'leg-press': 'Leg press 45°',
  'cadeira-extensora': 'Cadeira extensora',
  stiff: 'Stiff halteres',
  'cadeira-flexora': 'Cadeira flexora',
  afundo: 'Afundo alternado',
  'passada-lateral': 'Passada lateral',
  'hip-thrust': 'Hip thrust',
  'ponte-gluteos': 'Ponte de glúteos',
  panturrilha: 'Panturrilha em pé',
  'levantamento-terra-halteres': 'Levantamento terra',
  prancha: 'Prancha abdominal',
  'prancha-lateral': 'Prancha lateral',
  'abdominal-bicicleta': 'Abdominal bicicleta',
  'abdominal-infra': 'Abdominal infra',
  'dead-bug': 'Dead bug',
  'bird-dog': 'Bird dog',
  'pallof-press': 'Pallof press',
  burpee: 'Burpee modificado',
  'kettlebell-swing': 'Swing kettlebell',
  'farmer-walk': 'Farmer walk',
  'step-up': 'Step-up na caixa',
  'battle-rope': 'Battle rope',
  'aquecimento-leve': 'Aquecimento leve',
  'esteira-moderada': 'Esteira moderada',
  'bicicleta-leve': 'Bicicleta leve',
  desaquecimento: 'Desaquecimento',
  'rotacao-toracica': 'Rotação torácica',
  'alongamento-quadriceps': 'Along. quadríceps',
  'mobilidade-quadril-90': 'Mobilidade quadril',
  'alongamento-ombro': 'Along. ombro',
  'gato-vaca': 'Gato-vaca',
}

const exerciseNames = EXERCISE_NAMES

mkdirSync(outDir, { recursive: true })
mkdirSync(fallbackDir, { recursive: true })

for (const [id, poseKey] of Object.entries(EXERCISE_POSE_MAP)) {
  const name = exerciseNames[id] || id
  writeFileSync(join(outDir, `${id}.svg`), buildSvg(name, poseKey, 'EvoluaFit'))
}

for (const [key, poseKey] of Object.entries(FALLBACK_POSES)) {
  writeFileSync(join(fallbackDir, `${key}.svg`), buildSvg(key.charAt(0).toUpperCase() + key.slice(1), poseKey, 'Grupo muscular'))
}

console.log(`Generated ${Object.keys(EXERCISE_POSE_MAP).length} exercise SVGs + ${Object.keys(FALLBACK_POSES).length} fallbacks.`)
