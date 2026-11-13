import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const fallbacksDir = join(root, 'public/media/exercises/fallbacks')
const thumbsDir = join(root, 'public/media/exercises/thumbs')

const GREEN = '#00E58F'
const GREEN_DIM = '#00C97B'
const BG_START = '#0b1020'
const BG_END = '#152238'

const muscleFallbacks = {
  peito: { label: 'Peito', icon: 'chest' },
  costas: { label: 'Costas', icon: 'back' },
  pernas: { label: 'Pernas', icon: 'legs' },
  ombros: { label: 'Ombros', icon: 'shoulders' },
  bracos: { label: 'Braços', icon: 'arms' },
  abdomen: { label: 'Abdômen', icon: 'core' },
  cardio: { label: 'Cardio', icon: 'cardio' },
  mobilidade: { label: 'Mobilidade', icon: 'mobility' },
}

function iconPaths(type) {
  switch (type) {
    case 'chest':
      return `<path d="M200 95c-18 0-32-14-40-28-8 14-22 28-40 28-22 0-40-18-40-40v-8c0-11 9-20 20-20h120c11 0 20 9 20 20v8c0 22-18 40-40 40z" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M160 67v56M120 95h80" stroke="${GREEN_DIM}" stroke-width="1.5" opacity="0.4"/>`
    case 'back':
      return `<path d="M120 55h80v90c0 11-9 20-20 20h-40c-11 0-20-9-20-20V55z" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M140 80h40M140 100h40M140 120h40" stroke="${GREEN_DIM}" stroke-width="2" opacity="0.5"/>`
    case 'legs':
      return `<circle cx="160" cy="72" r="22" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M130 94v50M190 94v50M130 144h60" stroke="${GREEN}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
        <path d="M130 120h60" stroke="${GREEN_DIM}" stroke-width="2" opacity="0.5"/>`
    case 'shoulders':
      return `<circle cx="160" cy="78" r="18" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M100 95h120M110 95l-20 30M210 95l20 30" stroke="${GREEN}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`
    case 'arms':
      return `<circle cx="160" cy="70" r="16" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M160 86v20M120 100l40-14M200 100l-40-14M120 100v40M200 100v40" stroke="${GREEN}" stroke-width="3" stroke-linecap="round" opacity="0.85"/>`
    case 'core':
      return `<ellipse cx="160" cy="100" rx="48" ry="36" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <path d="M128 100h64M160 76v48" stroke="${GREEN_DIM}" stroke-width="1.5" opacity="0.4"/>`
    case 'cardio':
      return `<path d="M160 130V90M160 90l-28 20 28-38 28 38-28-20z" stroke="${GREEN}" stroke-width="3" stroke-linejoin="round" fill="none" opacity="0.85"/>
        <path d="M100 130h120" stroke="${GREEN_DIM}" stroke-width="2" opacity="0.5"/>`
    case 'mobility':
      return `<path d="M120 130c20-40 40-60 40-60s20 20 40 60" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>
        <circle cx="160" cy="70" r="16" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>`
    default:
      return `<circle cx="160" cy="90" r="40" stroke="${GREEN}" stroke-width="3" fill="none" opacity="0.85"/>`
  }
}

function fallbackSvg(key, { label, icon }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
  <defs>
    <linearGradient id="bg-${key}" x1="0" y1="0" x2="640" y2="360" gradientUnits="userSpaceOnUse">
      <stop stop-color="${BG_START}"/>
      <stop offset="1" stop-color="${BG_END}"/>
    </linearGradient>
    <radialGradient id="glow-${key}" cx="50%" cy="40%" r="50%">
      <stop stop-color="${GREEN}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg-${key})"/>
  <rect width="640" height="360" fill="url(#glow-${key})"/>
  <g transform="translate(160, 30) scale(1.6)">
    ${iconPaths(icon)}
  </g>
  <text x="320" y="300" text-anchor="middle" fill="#e2e8f0" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${label}</text>
  <text x="320" y="330" text-anchor="middle" fill="${GREEN}" font-family="system-ui,sans-serif" font-size="13" opacity="0.8">EvoluaFit</text>
</svg>`
}

function thumbSvg(name, typeLabel) {
  const safeName = name.length > 28 ? `${name.slice(0, 26)}…` : name
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" fill="none">
  <defs>
    <linearGradient id="tbg" x1="0" y1="0" x2="320" y2="180">
      <stop stop-color="${BG_START}"/>
      <stop offset="1" stop-color="${BG_END}"/>
    </linearGradient>
    <radialGradient id="tglow" cx="50%" cy="38%" r="55%">
      <stop stop-color="${GREEN}" stop-opacity="0.1"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="320" height="180" fill="url(#tbg)"/>
  <rect width="320" height="180" fill="url(#tglow)"/>
  <circle cx="160" cy="68" r="26" stroke="${GREEN}" stroke-width="2" opacity="0.85"/>
  <path d="M118 132c0-23.196 18.804-42 42-42s42 18.804 42 42" stroke="${GREEN}" stroke-width="2" opacity="0.75"/>
  <path d="M132 98l-16 22M188 98l16 22" stroke="${GREEN_DIM}" stroke-width="1.5" stroke-linecap="round" opacity="0.45"/>
  <text x="160" y="156" text-anchor="middle" fill="#cbd5e1" font-family="system-ui,sans-serif" font-size="9" font-weight="500">${safeName}</text>
  <text x="160" y="170" text-anchor="middle" fill="${GREEN}" font-family="system-ui,sans-serif" font-size="7" opacity="0.75">${typeLabel}</text>
</svg>`
}

// Exercise list for thumb regeneration (id, name, typeLabel)
const exercises = [
  ['supino-reto', 'Supino reto', 'Push'],
  ['supino-inclinado', 'Supino inclinado', 'Superiores'],
  ['crucifixo', 'Crucifixo', 'Push'],
  ['crucifixo-inclinado', 'Crucifixo inclinado', 'Push'],
  ['crucifixo-cabo', 'Crucifixo no cabo', 'Superiores'],
  ['flexao', 'Flexão de braço', 'Push'],
  ['desenvolvimento', 'Desenvolvimento', 'Push'],
  ['desenvolvimento-arnold', 'Desenvolvimento Arnold', 'Superiores'],
  ['elevacao-lateral', 'Elevação lateral', 'Push'],
  ['elevacao-frontal-lateral', 'Elevação frontal + lateral', 'Full Body'],
  ['triceps-pulley', 'Tríceps na polia', 'Push'],
  ['remada-curvada', 'Remada curvada', 'Pull'],
  ['puxada-frontal', 'Puxada frontal', 'Pull'],
  ['puxada-triangulo', 'Puxada triângulo', 'Pull'],
  ['puxada-neutra', 'Puxada neutra', 'Superiores'],
  ['remada-unilateral', 'Remada unilateral', 'Pull'],
  ['remada-baixa-cabo', 'Remada baixa cabo', 'Superiores'],
  ['rosca-direta', 'Rosca direta', 'Pull'],
  ['rosca-martelo', 'Rosca martelo', 'Pull'],
  ['rosca-alternada', 'Rosca alternada', 'Full Body'],
  ['face-pull', 'Face pull', 'Pull'],
  ['agachamento', 'Agachamento livre', 'Legs'],
  ['agachamento-frontal', 'Agachamento frontal', 'Inferiores'],
  ['agachamento-goblet', 'Agachamento goblet', 'Full Body'],
  ['leg-press', 'Leg press 45°', 'Legs'],
  ['cadeira-extensora', 'Cadeira extensora', 'Legs'],
  ['stiff', 'Stiff halteres', 'Legs'],
  ['cadeira-flexora', 'Cadeira flexora', 'Inferiores'],
  ['afundo', 'Afundo alternado', 'Legs'],
  ['passada-lateral', 'Passada lateral', 'Inferiores'],
  ['hip-thrust', 'Hip thrust', 'Legs'],
  ['ponte-gluteos', 'Ponte de glúteos', 'Full Body'],
  ['panturrilha', 'Panturrilha em pé', 'Legs'],
  ['levantamento-terra-halteres', 'Levantamento terra', 'Full Body'],
  ['prancha', 'Prancha abdominal', 'Core'],
  ['prancha-lateral', 'Prancha lateral', 'Core'],
  ['abdominal-bicicleta', 'Abdominal bicicleta', 'Core'],
  ['abdominal-infra', 'Abdominal infra', 'Inferiores'],
  ['dead-bug', 'Dead bug', 'Core'],
  ['bird-dog', 'Bird dog', 'Core'],
  ['pallof-press', 'Pallof press', 'Core'],
  ['burpee', 'Burpee modificado', 'Funcional'],
  ['kettlebell-swing', 'Swing kettlebell', 'Funcional'],
  ['farmer-walk', 'Farmer walk', 'Funcional'],
  ['step-up', 'Step-up na caixa', 'Funcional'],
  ['battle-rope', 'Battle rope', 'Funcional'],
  ['aquecimento-leve', 'Aquecimento leve', 'Cardio'],
  ['esteira-moderada', 'Esteira moderada', 'Cardio'],
  ['bicicleta-leve', 'Bicicleta leve', 'Cardio'],
  ['desaquecimento', 'Desaquecimento', 'Cardio'],
  ['rotacao-toracica', 'Rotação torácica', 'Mobilidade'],
  ['alongamento-quadriceps', 'Along. quadríceps', 'Mobilidade'],
  ['mobilidade-quadril-90', 'Mobilidade quadril', 'Mobilidade'],
  ['alongamento-ombro', 'Along. ombro', 'Mobilidade'],
  ['gato-vaca', 'Gato-vaca', 'Mobilidade'],
]

mkdirSync(fallbacksDir, { recursive: true })
mkdirSync(thumbsDir, { recursive: true })

for (const [key, meta] of Object.entries(muscleFallbacks)) {
  writeFileSync(join(fallbacksDir, `${key}.svg`), fallbackSvg(key, meta))
}

for (const [id, name, typeLabel] of exercises) {
  writeFileSync(join(thumbsDir, `${id}.svg`), thumbSvg(name, typeLabel))
}

// Generic fallback (no text placeholder)
writeFileSync(
  join(root, 'public/media/exercises/fallback.svg'),
  fallbackSvg('peito', { label: 'Exercício', icon: 'chest' }),
)

console.log(`Generated ${Object.keys(muscleFallbacks).length} fallbacks and ${exercises.length} thumbs.`)
