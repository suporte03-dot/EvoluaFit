/**
 * Copia GIFs de Downloads/Costa 2 para public/media/exercises/gifs/<id>.gif
 * e mescla em src/data/exerciseLocalGifs.js (não apaga o Peito).
 */
import { existsSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { costasExerciseDefs } from '../src/data/costasExercises.js'
import { LOCAL_EXERCISE_GIFS as EXISTING } from '../src/data/exerciseLocalGifs.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(process.env.USERPROFILE || '', 'Downloads', 'Costa 2')
const outDir = join(root, 'public/media/exercises/gifs')

function fold(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.gif(?:\.costa)?(?:\.png)?$/i, '')
    .replace(/\.webp.*$/i, '')
    .replace(/\(1\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** slug do arquivo → id do catálogo. null = pular. */
const MANUAL = {
  'puxada-alta-com-triangulo': 'puxada-triangulo',
  'puxada-alta-neutra-com-cabos-duplos-no-chao': 'puxada-alta-neutra-cabos-duplos',
  'puxada-alta-unilateral-alta-ajoelhada': 'puxada-alta-unilateral-ajoelhada',
  'puxada-com-um-braco-com-cabo': 'puxada-com-um-braco-cabo',
  'puxada-na-polia-alta-com-pegada-fechada': 'puxada-polia-pegada-fechada',
  'pullover-com-barra-no-banco-declinado': 'pullover-com-barra-declinado',
  'pullover-com-barra-w-pegada-invertida': 'pullover-barra-w-invertida',
  'remada-curvada-com-barra': 'remada-curvada',
  'remada-inclinada-com-pegada-neutra-com-halteres': 'remada-inclinada-pegada-neutra',
  'remada-inclinada-com-pegada-reversa-com-halteres': 'remada-inclinada-pegada-reversa',
  'remada-sentada-na-maquina': 'remada-baixa',
  'remada-sentado-com-cabo-pegada-fechada': 'remada-baixa-cabo',
  'serrote': 'remada-unilateral',
  'remada-com-cabo-sentada-unilateral-com-torcao': 'remada-cabo-unilateral-torsao',
  'remada-com-cabo-sentada-unilateral-com-torsao': 'remada-cabo-unilateral-torsao',
  'remada-com-halteres-em-posicao-prancha': 'remada-halteres-prancha',
  'remada-cruzada-no-cross': 'remada-cruzada-cross',
  'remada-curvada-com-barra-de-pegada-alternada-ampla-com-aducao-de-escapula':
    'remada-curvada-pegada-alternada',
  'remada-curvada-com-halteres-com-pegada-invertida': 'remada-curvada-halteres-pegada-invertida',
  'remada-curvada-com-halteres': 'remada-curvada-com-halteres',
  'remada-curvada-com-kettlebell': 'remada-curvada-kettlebell',
  'remada-frontal-com-alavanca': 'remada-frontal-alavanca',
  'remada-renegada-com-halteres': 'remada-renegada',
  'remada-sentada-com-corda-na-polia': 'remada-sentada-corda',
  'remada-t-com-alavanca': 'remada-t-alavanca',
  'remada-t-com-landmine': 'remada-t-landmine',
  'remada-t-invertida-com-alavanca': 'remada-t-invertida-alavanca',
  'remada-unilateral-com-barra-landmine': 'remada-unilateral-landmine',
  'remada-unilateral-com-barra': 'remada-unilateral-barra',
  'remada-unilateral-com-cabo': 'remada-unilateral-cabo',
}

const STOP = new Set(['com', 'de', 'do', 'da', 'no', 'na', 'em', 'para', 'um', 'uma'])
const EQUIP = new Set([
  'barra',
  'halteres',
  'haltere',
  'cabo',
  'smith',
  'alavanca',
  'maquina',
  'triangulo',
  'corda',
  'kettlebell',
  'landmine',
  'anilhas',
  'nuca',
])

const ids = costasExerciseDefs.map((ex) => ex.id)

function matchScore(slug, id) {
  if (slug === id) return 10000
  if (MANUAL[slug] === id) return 5000 - Math.abs(slug.length - id.length)
  const parts = id.split('-')
  const slugParts = slug.split('-')
  if (!parts.every((p) => slugParts.includes(p))) return -1
  const extra = slugParts.filter((p) => !parts.includes(p) && !STOP.has(p))
  const distinctive = extra.filter((p) => EQUIP.has(p) || p.length > 3)
  if (distinctive.length) return -1
  return parts.length * 100 - extra.length * 10
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
  if (lower.includes('.webp')) return false
  return lower.includes('.gif') || lower.endsWith('.png')
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

const map = { ...EXISTING }
for (const [id, { file, score }] of Object.entries(best)) {
  writeGif(file, id)
  map[id] = `media/exercises/gifs/${id}.gif`
  console.log('ok', id, '←', file, `(${score})`)
}

for (const id of ids) {
  if (map[id]) continue
  const existingGif = join(outDir, `${id}.gif`)
  if (existsSync(existingGif)) {
    map[id] = `media/exercises/gifs/${id}.gif`
    console.log('keep', id)
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
  `/** GIFs animados locais. Gerado por scripts/import-peito-gifs.mjs e import-costas-gifs.mjs */\nexport const LOCAL_EXERCISE_GIFS = ${JSON.stringify(map, null, 2)}\n`,
  'utf8',
)

const costasMapped = ids.filter((id) => map[id]).length
console.log(`\n${costasMapped}/${ids.length} Costas com GIF · ${Object.keys(map).length} GIFs locais no total`)
