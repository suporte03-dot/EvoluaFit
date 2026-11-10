/**
 * Copia GIFs de Downloads/Peito 2 para public/media/exercises/gifs/<id>.gif
 * e gera src/data/exerciseLocalGifs.js
 */
import { existsSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { peitoExerciseDefs } from '../src/data/peitoExercises.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(process.env.USERPROFILE || '', 'Downloads', 'Peito 2')
const outDir = join(root, 'public/media/exercises/gifs')

function fold(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.gif(?:\.peito(?:\.pnh)?)?(?:\.png)?$/i, '')
    .replace(/\.webp.*$/i, '')
    .replace(/\(1\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** slug do arquivo → id do catálogo. null = pular (sem exercício correspondente). */
const MANUAL = {
  'crucifixo-com-halteres': 'crucifixo',
  'crucifixo-com-halteres-inclinado': 'crucifixo-inclinado',
  'crucifixo-inclinado-cross': null,
  'crucifixo-deitado-com-cabo': 'crucifixo-cabo',
  'cross-over-polia-alta': 'crucifixo-cabo',
  'crossover-de-peitoral-superior-com-cabo': 'supino-reto-em-pe-no-cross-over',
  'crossover-unilateral-com-cabo': 'supino-unilateral-no-cabo',
  'supino-inclinado-com-halteres': 'supino-inclinado',
  'supino-declinada-na-maquina': 'supino-declinado-na-maquina',
  'supino-na-maquina-para-miolo-do-peitoral': 'supino-na-maquina-para-miolo-do-peitoral',
  'supino-inclinado-na-maquina-com-pegada-martelo': 'supino-inclinado-na-maquina',
  'supino-com-haltere-pegada-fechada': 'supino-com-halteres-com-pegada-fechada',
  'supino-com-halteres-com-pegada-fechada': 'supino-com-halteres-com-pegada-fechada',
  'supino-inclinado-com-halteres-e-pegada-fechada': 'supino-inclinado-com-pegada-fechada',
  'supino-no-banco-inclinado-30-graus-com-pegada-invertida': 'supino-com-halteres-pegada-invertida',
  'supino-unilateral-com-halteres-com-pegada-reversa': 'supino-com-halteres-pegada-invertida',
  'supino-declinado-unilateral-pegada-martelo-com-haltere': 'supino-declinado-pegada-martelo',
  'supino-inclinado-com-halteres-e-pegada-invertida': 'supino-com-halteres-pegada-invertida',
}

const EXTRA_COPIES = {
  'supino-com-halteres-com-pegada-fechada': ['supino-fechado'],
  'supino-invertido-com-pegada-aberta': ['supino-invertido-com-pegada-fechada'],
}

const ids = peitoExerciseDefs.map((ex) => ex.id)

function matchScore(slug, id) {
  if (slug === id) return 10000
  if (MANUAL[slug] === id) return 5000 - Math.abs(slug.length - id.length)
  const parts = id.split('-')
  const slugParts = slug.split('-')
  if (!parts.every((p) => slugParts.includes(p))) return -1
  return parts.length * 100 - Math.abs(slugParts.length - parts.length) * 10
}

function matchId(slug) {
  if (Object.prototype.hasOwnProperty.call(MANUAL, slug)) return MANUAL[slug]
  if (ids.includes(slug)) return slug
  let best = null
  for (const id of ids) {
    const score = matchScore(slug, id)
    if (score < 20) continue
    if (!best || score > best.score) best = { id, score }
  }
  return best?.id || null
}

const files = readdirSync(srcDir).filter((name) => {
  const lower = name.toLowerCase()
  return !lower.includes('.webp') && (lower.includes('.gif') || lower.endsWith('.png'))
})

const best = {}
const unmatched = []

for (const file of files) {
  const slug = fold(file)
  const id = matchId(slug)
  if (!id) {
    unmatched.push({ file, slug })
    continue
  }
  const score = matchScore(slug, id)
  if (!best[id] || score > best[id].score) {
    best[id] = { file, slug, score }
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function writeGif(fromFile, id) {
  const dest = join(outDir, `${id}.gif`)
  const data = readFileSync(join(srcDir, fromFile))
  const tmp = join(outDir, `.tmp-${id}.gif`)
  let lastErr
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      writeFileSync(tmp, data)
      if (existsSync(dest)) {
        try {
          unlinkSync(dest)
        } catch {
          writeFileSync(dest, data)
          try {
            unlinkSync(tmp)
          } catch {
            /* ignore */
          }
          return
        }
      }
      renameSync(tmp, dest)
      return
    } catch (err) {
      lastErr = err
      sleep(350 * (attempt + 1))
    }
  }
  throw lastErr
}

const map = {}
for (const [id, { file, score }] of Object.entries(best)) {
  writeGif(file, id)
  map[id] = `media/exercises/gifs/${id}.gif`
  console.log('ok', id, '←', file, `(${score})`)
  for (const extra of EXTRA_COPIES[id] || []) {
    if (map[extra]) continue
    writeGif(file, extra)
    map[extra] = `media/exercises/gifs/${extra}.gif`
    console.log('ok', extra, '←', file, '(copia)')
  }
}

for (const { file, slug } of unmatched) {
  console.warn('sem id:', file, '→', slug)
}

const missing = ids.filter((id) => !map[id])
if (missing.length) {
  console.warn('\nsem GIF no catálogo:', missing.join(', '))
}

writeFileSync(
  join(root, 'src/data/exerciseLocalGifs.js'),
  `/** GIFs animados locais. Gerado por scripts/import-peito-gifs.mjs */\nexport const LOCAL_EXERCISE_GIFS = ${JSON.stringify(map, null, 2)}\n`,
  'utf8',
)

console.log(`\n${Object.keys(map).length}/${ids.length} GIFs mapeados`)
