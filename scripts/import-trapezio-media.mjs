/**
 * Copia imagens do lote Trapézio (encolhimentos / face pull / remada alta / voador posterior)
 * para public/media/exercises/trapezio/
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const assetsDir = join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Suporte03-Desktop-Site-Novo-Mundo-do-Esporte/assets',
)
const outDir = join(root, 'public/media/exercises/trapezio')

if (existsSync(outDir)) rmSync(outDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

// Apenas o lote enviado para Trapézio (não remadas de costas).
const INCLUDE =
  /images_(Encolhimento|Face_Pull|Voador_|Puxada_(para_o_Rosto|de_face)|Meio_Agachado_com_Puxada|Eleva__o_(lateral_tronco|de_Deltoide|de_T_)|Dumbbell-Raise|Dips_de_esc|Remada_alta|Remada_Alta|Remada_em_Y|Remada_com_barra-|Remada_Inclinada_a_45|remada_invertida|Remada_invertida)/i

const accentFixes = [
  [/eleva.o/gi, 'elevacao'],
  [/cabe.a/gi, 'cabeca'],
  [/atr.s/gi, 'atras'],
  [/m.quina/gi, 'maquina'],
  [/esc.pula/gi, 'escapula'],
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
  console.error('Nenhuma imagem de Trapézio em', assetsDir)
  process.exit(1)
}

const map = {}
const used = new Set()

for (const file of files) {
  let slug = slugify(file)
  // Normaliza elevacao quando ainda ficou eleva-o
  slug = slug.replace(/^eleva-o-/g, 'elevacao-')
  let finalSlug = slug
  let i = 2
  while (used.has(finalSlug)) finalSlug = `${slug}-${i++}`
  used.add(finalSlug)
  copyFileSync(join(assetsDir, file), join(outDir, `${finalSlug}.png`))
  map[finalSlug] = `media/exercises/trapezio/${finalSlug}.png`
  console.log(finalSlug)
}

writeFileSync(join(outDir, 'media-map.json'), JSON.stringify(map, null, 2), 'utf8')
console.log('\nCopied', Object.keys(map).length, '→', outDir)
