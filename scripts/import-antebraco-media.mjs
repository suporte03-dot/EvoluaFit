/**
 * Copia imagens de Antebraço para public/media/exercises/antebraco/
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const assetsDir = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Suporte03-Desktop-Site-Novo-Mundo-do-Esporte/assets',
)
const outDir = join(root, 'public/media/exercises/antebraco')
mkdirSync(outDir, { recursive: true })

// Só antebraço — evita misturar com Rosca* de bíceps
const INCLUDE =
  /images_(Flex_o_de_P|Hand_Grip|Rolinho_de_antebra|Rosca_de_[Dd]ed|Rosca_de_[Pp]unho|Rosca_Inversa_com_Barra-)/i

const accentFixes = [
  [/flex.o/gi, 'flexao'],
  [/antebra.o/gi, 'antebraco'],
  [/atr.s/gi, 'atras'],
  [/bra.o/gi, 'braco'],
  [/ch.o/gi, 'chao'],
]

function slugify(name) {
  const m = name.match(/images_([^-]+(?:-[^-]+)*)-[0-9a-f]{8}-[0-9a-f-]{27,}\./i)
  let raw = m ? m[1] : name
  raw = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, '-')
    .replace(/[^a-zA-Z0-9\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()

  for (const [re, replacement] of accentFixes) {
    raw = raw.replace(re, replacement)
  }
  return raw.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const files = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => INCLUDE.test(f) && /\.(png|jpe?g|gif|webp)$/i.test(f))
  : []

if (!files.length) {
  console.error('Nenhuma imagem de Antebraço em', assetsDir)
  process.exit(1)
}

const map = {}
const used = new Set()

for (const file of files) {
  let slug = slugify(file)
  let finalSlug = slug
  let i = 2
  while (used.has(finalSlug)) finalSlug = `${slug}-${i++}`
  used.add(finalSlug)
  copyFileSync(join(assetsDir, file), join(outDir, `${finalSlug}.png`))
  map[finalSlug] = `media/exercises/antebraco/${finalSlug}.png`
  console.log(finalSlug)
}

writeFileSync(join(outDir, 'media-map.json'), JSON.stringify(map, null, 2), 'utf8')
console.log('\nCopied', Object.keys(map).length, '→', outDir)
