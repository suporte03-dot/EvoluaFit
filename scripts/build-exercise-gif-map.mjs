/**
 * Builds exerciseGifMap.js — ExerciseDB GIFs (verified) + wger images (fallback).
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE = join(__dirname, 'exercisedb-full.json')
const OUT = join(__dirname, '../src/data/exerciseGifMap.js')

const SEARCH_NAMES = {
  'supino-reto': 'barbell bench press',
  'supino-inclinado': 'dumbbell incline bench press',
  crucifixo: 'dumbbell fly',
  'crucifixo-inclinado': 'incline dumbbell fly',
  'crucifixo-cabo': 'cable cross-over',
  flexao: 'push-up',
  desenvolvimento: 'dumbbell shoulder press',
  'desenvolvimento-arnold': 'arnold press',
  'elevacao-lateral': 'dumbbell lateral raise',
  'elevacao-frontal-lateral': 'dumbbell front raise',
  'triceps-pulley': 'triceps pushdown',
  'remada-curvada': 'barbell bent over row',
  'puxada-frontal': 'lat pulldown',
  'puxada-triangulo': 'close grip lat pulldown',
  'puxada-neutra': 'pull up neutral grip',
  'remada-unilateral': 'dumbbell one arm row',
  'remada-baixa-cabo': 'cable seated row',
  'rosca-direta': 'barbell curl',
  'rosca-martelo': 'hammer curl',
  'rosca-alternada': 'dumbbell alternate bicep curl',
  'face-pull': 'face pull',
  agachamento: 'barbell full squat',
  'agachamento-frontal': 'barbell front squat',
  'agachamento-goblet': 'goblet squat',
  'leg-press': 'sled 45 leg press',
  'cadeira-extensora': 'lever leg extension',
  stiff: 'dumbbell stiff leg deadlift',
  'cadeira-flexora': 'lever lying leg curl',
  afundo: 'dumbbell lunge',
  'passada-lateral': 'dumbbell lateral lunge',
  'hip-thrust': 'barbell hip thrust',
  'ponte-gluteos': 'glute bridge',
  panturrilha: 'standing calf raise',
  'levantamento-terra-halteres': 'dumbbell deadlift',
  prancha: 'front plank',
  'prancha-lateral': 'side plank',
  'abdominal-bicicleta': 'bicycle crunch',
  'abdominal-infra': 'decline sit-up',
  'dead-bug': 'dead bug',
  'bird-dog': 'bird dog',
  'pallof-press': 'band pallof press',
  burpee: 'burpee',
  'kettlebell-swing': 'kettlebell swing',
  'farmer-walk': 'farmers walk',
  'step-up': 'dumbbell step-up',
  'battle-rope': 'battle ropes',
  'aquecimento-leve': 'walking',
  'esteira-moderada': 'running treadmill',
  'bicicleta-leve': 'stationary bike',
  desaquecimento: 'walking',
  'rotacao-toracica': 'thoracic rotation',
  'alongamento-quadriceps': 'standing quadriceps stretch',
  'mobilidade-quadril-90': 'hip stretch',
  'alongamento-ombro': 'shoulder stretch',
  'gato-vaca': 'cat cow',
}

/** Curated wger / ExerciseDB URLs when search is ambiguous */
const MANUAL_OVERRIDES = {
  'crucifixo-inclinado': 'https://wger.de/media/exercise-images/828/2e959dab-f39b-4c7c-9063-eb43064ab5eb.png',
  'desenvolvimento-arnold': 'https://static.exercisedb.dev/media/znQUdHY.gif',
  'puxada-frontal': 'https://wger.de/media/exercise-images/1971/729af526-19a0-4d3d-a258-196c7575d139.jpg',
  'face-pull': 'https://wger.de/media/exercise-images/1639/8927346e-f5ca-4795-bdf1-5ac9309401e7.webp',
  afundo: 'https://wger.de/media/exercise-images/984/5c7ffe68-e7b2-47f3-a22a-f9cc28640432.png',
  'levantamento-terra-halteres': 'https://wger.de/media/exercise-images/1003/772d6e47-3865-4944-9255-7435d0b06782.png',
  'abdominal-infra': 'https://wger.de/media/exercise-images/979/27097a3a-5749-428d-b94c-6082afe390f6.png',
  'battle-rope': 'https://wger.de/media/exercise-images/1634/9a4704d3-1b25-43e3-b244-3885f4d3db87.png',
  'aquecimento-leve': 'https://wger.de/media/exercise-images/113/Walking-lunges-1.png',
  'esteira-moderada': 'https://wger.de/media/exercise-images/1615/7792295c-83b6-4ea8-9353-ce02f0ad2559.jpg',
  'bicicleta-leve': 'https://wger.de/media/exercise-images/1618/c18baedc-ff98-4fb2-b4f5-38a05c12f637.png',
  desaquecimento: 'https://wger.de/media/exercise-images/113/Walking-lunges-1.png',
  'rotacao-toracica': 'https://wger.de/media/exercise-images/1582/5094fe30-eea2-4269-b0de-4b8a20558fd7.png',
  'alongamento-quadriceps': 'https://wger.de/media/exercise-images/1873/c0ed299b-6d87-4d90-885d-bb3b5d85f1eb.png',
  'alongamento-ombro': 'https://wger.de/media/exercise-images/1835/ca4a0b7e-9fdd-4173-843a-f0392824abe1.jpg',
  'gato-vaca': 'https://static.exercisedb.dev/media/01qpYSe.gif',
}

/** Known-good ExerciseDB IDs (gifUrl verified with GET) */
const EXERCISEDB_IDS = {
  'supino-reto': '3TZduzM',
  crucifixo: '27NNGFr',
  'crucifixo-cabo': '0CXGHya',
  flexao: 'dPmaUaU',
  desenvolvimento: 'znQUdHY',
  'elevacao-lateral': 'cALkHHX',
  'elevacao-frontal-lateral': '3eGE2JC',
  'triceps-pulley': '3ZflifB',
  'remada-curvada': '7vG5o25',
  'puxada-triangulo': '8d8qJQI',
  'puxada-neutra': '0V2YQjW',
  'remada-baixa-cabo': 'c8oybX6',
  'rosca-direta': '25GPyDY',
  'rosca-martelo': '3s4NnTh',
  agachamento: 'qXTaZnJ',
  'agachamento-frontal': 'zG0zs85',
  'agachamento-goblet': 'yn8yg1r',
  'leg-press': '10Z2DXU',
  'cadeira-extensora': 'my33uHU',
  stiff: 'rR0LJzx',
  'cadeira-flexora': '17lJ1kr',
  'passada-lateral': 'H6ybluc',
  'hip-thrust': 'qKBpF7I',
  'ponte-gluteos': '9c6T1YX',
  prancha: 'VBAWRPG',
  'prancha-lateral': '9WTm7dq',
  'abdominal-bicicleta': 'XUUD0Fs',
  'dead-bug': 'X6ytgYZ',
  'bird-dog': 'uTv34oq',
  'pallof-press': '9Ap7miY',
  burpee: '0JtKWum',
  'kettlebell-swing': 'UHJlbu3',
  'farmer-walk': 'qPEzJjA',
  'step-up': 'dG7tG5y',
  'mobilidade-quadril-90': '0L2KwtI',
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const wgerInfoCache = new Map()

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function scoreName(query, candidate) {
  const nq = normalize(query)
  const nc = normalize(candidate)
  if (!nc) return 0
  if (nc === nq) return 100
  if (nc.includes(nq) || nq.includes(nc)) return 80
  const words = nq.split(' ').filter(Boolean)
  const hits = words.filter((w) => nc.includes(w)).length
  return hits * 15
}

async function loadExerciseDb() {
  if (!existsSync(CACHE)) return []
  return JSON.parse(readFileSync(CACHE, 'utf8'))
}

function findInExerciseDb(all, query) {
  const nq = normalize(query)
  const exact = all.find((e) => normalize(e.name) === nq)
  if (exact) return exact
  const scored = all
    .map((e) => ({ e, score: scoreName(query, e.name) }))
    .filter((x) => x.score >= 30)
    .sort((a, b) => b.score - a.score)
  return scored[0]?.e || null
}

async function verifyUrl(url) {
  try {
    const res = await fetch(url, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

async function getWgerInfo(id) {
  if (wgerInfoCache.has(id)) return wgerInfoCache.get(id)
  const res = await fetch(`https://wger.de/api/v2/exerciseinfo/${id}/?language=2`)
  if (!res.ok) return null
  const data = await res.json()
  wgerInfoCache.set(id, data)
  return data
}

async function findWgerImage(query) {
  const term = query.split(' ').slice(0, 3).join(' ')
  const res = await fetch(`https://wger.de/api/v2/exercise/?language=2&term=${encodeURIComponent(term)}&limit=20`)
  if (!res.ok) return null
  const data = await res.json()
  const ids = (data.results || []).map((x) => x.id)

  let best = null
  let bestScore = 0

  for (const id of ids) {
    const info = await getWgerInfo(id)
    if (!info?.images?.length) continue
    const name = info.translations?.find((t) => t.language === 2)?.name || info.name || ''
    const s = scoreName(query, name)
    if (s > bestScore) {
      const raw = info.images[0].image
      const image = raw.startsWith('http') ? raw : `https://wger.de${raw}`
      bestScore = s
      best = { image, name, source: `wger:${id}` }
    }
    await delay(100)
  }

  return bestScore >= 30 ? best : null
}

async function resolveMedia(exId, query, exerciseDb) {
  const manual = MANUAL_OVERRIDES[exId]
  if (manual && (await verifyUrl(manual))) {
    const type = manual.endsWith('.gif') ? 'gif' : 'image'
    return { url: manual, type, source: 'manual' }
  }

  const edbId = EXERCISEDB_IDS[exId]
  if (edbId) {
    const gif = `https://static.exercisedb.dev/media/${edbId}.gif`
    if (await verifyUrl(gif)) {
      return { url: gif, type: 'gif', source: `exercisedb:${edbId}` }
    }
  }

  const match = findInExerciseDb(exerciseDb, query)
  if (match?.gifUrl && (await verifyUrl(match.gifUrl))) {
    return { url: match.gifUrl, type: 'gif', source: `exercisedb:${match.exerciseId}` }
  }

  const wger = await findWgerImage(query)
  if (wger?.image && (await verifyUrl(wger.image))) {
    return { url: wger.image, type: 'image', source: wger.source }
  }

  return null
}

async function main() {
  const exerciseDb = await loadExerciseDb()
  const map = {}
  const meta = {}
  let found = 0

  for (const [exId, query] of Object.entries(SEARCH_NAMES)) {
    const media = await resolveMedia(exId, query, exerciseDb)
    if (media) {
      map[exId] = media.url
      meta[exId] = { query, ...media }
      found++
      console.log(`✓ ${exId} → ${media.source}`)
    } else {
      console.warn(`✗ ${exId} (${query})`)
    }
    await delay(350)
  }

  const content = `/**
 * Real demonstrative media — ExerciseDB GIFs + wger.de images (CC-BY-SA).
 * Não copiar assets do Gif do Treino.
 * Regenerar: node scripts/build-exercise-gif-map.mjs
 */

/** @type {Record<string, string>} */
export const EXERCISE_GIF_MAP = ${JSON.stringify(map, null, 2)}

/** @type {Record<string, { query: string, url: string, type: string, source: string }>} */
export const EXERCISE_MEDIA_META = ${JSON.stringify(meta, null, 2)}

export function getExerciseGifUrl(id) {
  return EXERCISE_GIF_MAP[id] || null
}

export function hasRealMedia(id) {
  return Boolean(EXERCISE_GIF_MAP[id])
}

export const REAL_MEDIA_COUNT = ${found}
export const TOTAL_EXERCISES = ${Object.keys(SEARCH_NAMES).length}
`

  writeFileSync(OUT, content, 'utf8')
  console.log(`\n${found}/${Object.keys(SEARCH_NAMES).length} with verified media`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
