/**
 * Copia GIFs de Downloads/Ombro 2 e elevações *.gif.ombro.png da pasta Downloads
 * para public/media/exercises/gifs/<id>.gif e mescla em src/data/exerciseLocalGifs.js.
 */
import { existsSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ombrosExerciseDefs } from '../src/data/ombrosExercises.js'
import { LOCAL_EXERCISE_GIFS as EXISTING } from '../src/data/exerciseLocalGifs.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const downloads = join(process.env.USERPROFILE || '', 'Downloads')
const packDir = join(downloads, 'Ombro 2')
const outDir = join(root, 'public/media/exercises/gifs')

function fold(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.gif(?:\.ombro)?(?:\.png)?$/i, '')
    .replace(/\.webp.*$/i, '')
    .replace(/\(\d+\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** slug do arquivo → id do catálogo. null = pular (duplicata do pack). */
const MANUAL = {
  'circulos-de-braco-com-pesos': 'circulos-braco-pesos',
  'crucifixo-inverso-unilateral-com-cabo': 'crucifixo-inverso-cabo',
  'desenvolvimento-arnold': 'desenvolvimento-arnold',
  'desenvolvimento-arnold-metade': 'desenvolvimento-arnold-metade',
  'desenvolvimento-arnold-com-um-braco': 'desenvolvimento-arnold-um-braco',
  'desenvolvimento-cubano-com-halteres': 'desenvolvimento-cubano',
  'desenvolvimento-cubano-sentado-com-halteres': 'desenvolvimento-cubano-sentado',
  'desenvolvimento-de-ombro-alternada-em-pe-com-halteres': 'desenvolvimento-alternada-em-pe',
  'desenvolvimento-de-ombro-com-barra-sentado': 'desenvolvimento-barra-sentado',
  'desenvolvimento-de-ombro-com-cabo': 'desenvolvimento-cabo',
  'desenvolvimento-de-ombro-com-cabo-ajoelhado': 'desenvolvimento-cabo-ajoelhado',
  'desenvolvimento-de-ombro-com-halteres-em-forma-de-w': 'desenvolvimento-halteres-w',
  'desenvolvimento-de-ombro-com-halteres-em-z': 'desenvolvimento-halteres-z',
  'desenvolvimento-de-ombro-deitado': 'desenvolvimento-deitado',
  'desenvolvimento-de-ombro-na-maquina': 'desenvolvimento-maquina',
  'desenvolvimento-de-ombro-na-maquina-pegada-martelo': 'desenvolvimento-maquina-martelo',
  'desenvolvimento-de-ombro-no-banco-com-halteres': 'desenvolvimento',
  'desenvolvimento-de-ombro-reversa-na-maquina': 'desenvolvimento-maquina-reversa',
  'desenvolvimento-de-ombro-unilateral-com-halter': 'desenvolvimento-unilateral-halter',
  'desenvolvimento-de-ombros-atras-da-cabeca-na-maquina-smith': 'desenvolvimento-atras-cabeca-smith',
  'desenvolvimento-de-ombros-atras-do-pescoco-sentado': 'desenvolvimento-atras-pescoco-sentado',
  'desenvolvimento-de-ombros-com-barra-w-com-pegada-invertida': 'desenvolvimento-barra-w-invertida',
  'desenvolvimento-de-ombros-com-halteres-em-pe-com-pegada-neutra':
    'desenvolvimento-halteres-em-pe-neutra',
  'desenvolvimento-de-ombros-com-rotacao-alternada-com-halteres': 'desenvolvimento-rotacao-alternada',
  'desenvolvimento-de-ombros-na-maquina': null,
  'desenvolvimento-de-ombros-na-maquina-smith': 'desenvolvimento-ombros-smith',
  'desenvolvimento-militar-com-barra': 'desenvolvimento-militar-barra',
  'desenvolvimento-militar-com-barra-no-chao-ajoelhado': 'desenvolvimento-militar-barra-chao-ajoelhado',
  'desenvolvimento-militar-com-pegada-fechada': 'desenvolvimento-militar-pegada-fechada',
  'desenvolvimento-militar-de-uma-mao-com-kettlebell': 'desenvolvimento-militar-kettlebell-unilateral',
  'desenvolvimento-militar-em-pe-na-maquina-smith': 'desenvolvimento-militar-smith-em-pe',
  'desenvolvimento-militar-inclinado-com-barra-presa-no-chao': 'desenvolvimento-militar-inclinado-chao',
  'elevacao-frontal-alternada-com-halteres': 'elevacao-frontal-alternada-halteres',
  'elevacao-frontal-com-barra-girando': 'elevacao-frontal-barra-girando',
  'elevacao-frontal-com-barra-w-inclinada': 'elevacao-frontal-barra-w-inclinada',
  'elevacao-frontal-com-dois-bracos-com-halteres': 'elevacao-frontal-dois-bracos-halteres',
  'elevacao-frontal-com-halteres': 'elevacao-frontal-halteres',
  'elevacao-frontal-com-halteres-sentado': 'elevacao-frontal-halteres-sentado',
  'elevacao-lateral-alternada-com-halteres': 'elevacao-lateral-alternada-halteres',
  'elevacao-posterior-unilateral-com-halteres-em-decubito-prono': 'elevacao-posterior-unilateral-prone',
  'elevacao-lateral-com-barra-no-chao': 'elevacao-lateral-barra-chao',
  'elevacao-lateral-com-braco-flexionado': 'elevacao-lateral-braco-flexionado',
  'elevacao-lateral-com-halteres-com-apoio-no-peito': 'elevacao-lateral-halteres-peito',
  'elevacao-lateral-com-halteres-para-deltoides-posteriores-deitado':
    'elevacao-lateral-posterior-deitado',
  'elevacao-lateral-com-halteres-sentado': 'elevacao-lateral-halteres-sentado',
  'elevacao-lateral-com-tronco-inclinado': 'elevacao-lateral-tronco-inclinado-halteres',
  'elevacao-lateral-cruzada-no-crossover': 'elevacao-lateral-cruzada-crossover',
  'elevacao-lateral-de-bracos-com-cabo': 'elevacao-lateral-cabo',
  'elevacao-lateral-de-bracos-com-halteres': 'elevacao-lateral',
  'elevacao-lateral-de-halteres-inclinada': 'elevacao-lateral-halteres-inclinada',
  'elevacao-lateral-deitado': 'elevacao-lateral-deitado',
  'elevacao-lateral-e-frontal-com-halteres': 'elevacao-frontal-lateral',
  'elevacao-lateral-na-maquina': 'elevacao-lateral-maquina',
  'elevacao-lateral-unilateral-com-cabo': 'elevacao-lateral-unilateral-cabo',
  'elevacao-lateral-unilateral-com-haltere-inclinado': 'elevacao-lateral-unilateral-inclinado',
  'elevacao-lateral-unilateral-com-halteres': 'elevacao-lateral-unilateral-halteres',
  'elevacoes-frontais-com-halteres-apoiadas-no-peito': 'elevacao-frontal-halteres-peito',
  'levantamento-de-halteres-de-3-maneiras': 'levantamento-halteres-3-maneiras',
  'levantamento-de-halteres-de-4-maneiras': 'levantamento-halteres-4-maneiras',
  'levantamento-frontal-alternado-com-haltere-sentado': 'levantamento-frontal-alternado-sentado',
}

const SHARE = {
  'desenvolvimento-banco-halteres': 'desenvolvimento',
  'desenvolvimento-arnold-completo': 'desenvolvimento-arnold',
}

const ids = ombrosExerciseDefs.map((ex) => ex.id)

function matchId(slug) {
  if (Object.prototype.hasOwnProperty.call(MANUAL, slug)) return MANUAL[slug]
  if (ids.includes(slug)) return slug
  return null
}

function listPackFiles() {
  const found = []
  if (existsSync(packDir)) {
    for (const file of readdirSync(packDir)) {
      const lower = file.toLowerCase()
      if (lower.includes('.webp')) continue
      if (lower.includes('.gif') || lower.endsWith('.png')) found.push({ dir: packDir, file })
    }
  }
  if (existsSync(downloads)) {
    for (const file of readdirSync(downloads)) {
      const lower = file.toLowerCase()
      if (!lower.endsWith('.gif.ombro.png')) continue
      found.push({ dir: downloads, file })
    }
  }
  return found
}

const files = listPackFiles()
const best = {}
const unmatched = []

for (const item of files) {
  const slug = fold(item.file)
  const id = matchId(slug)
  if (!id) {
    unmatched.push({ file: item.file, slug })
    continue
  }
  const score = slug.length
  if (!best[id] || score > best[id].score) {
    best[id] = { ...item, slug, score }
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function writeGif(fromDir, fromFile, id) {
  const dest = join(outDir, `${id}.gif`)
  const data = readFileSync(join(fromDir, fromFile))
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
for (const [id, item] of Object.entries(best)) {
  writeGif(item.dir, item.file, id)
  map[id] = `media/exercises/gifs/${id}.gif`
  console.log('ok', id, '←', item.file)
}

for (const [alias, source] of Object.entries(SHARE)) {
  if (!map[source]) continue
  map[alias] = map[source]
  console.log('share', alias, '←', source)
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
  `/** GIFs animados locais. Gerado por scripts/import-peito-gifs.mjs, import-costas-gifs.mjs e import-ombros-gifs.mjs */\nexport const LOCAL_EXERCISE_GIFS = ${JSON.stringify(map, null, 2)}\n`,
  'utf8',
)

const ombrosMapped = ids.filter((id) => map[id]).length
console.log(`\n${ombrosMapped}/${ids.length} Ombros com GIF · ${Object.keys(map).length} GIFs locais no total`)
