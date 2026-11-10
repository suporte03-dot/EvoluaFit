/**
 * Baixa os GIFs animados do ExerciseDB e copia os GIFs locais de Downloads.
 * Destino: public/media/exercises/gifs/<id>.gif
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXERCISE_GIF_MAP } from '../src/data/exerciseGifMap.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/media/exercises/gifs')
mkdirSync(outDir, { recursive: true })

const downloads = process.env.USERPROFILE
  ? [
      ['PEITO/SUPINO RETO.gif', 'supino-reto'],
      ['PEITO/CRUCIFIXO.gif', 'crucifixo'],
      ['PEITO/CRUCIFIXO NO CABO.gif', 'crucifixo-cabo'],
      ['COSTA/REMADA CURVADA.gif', 'remada-curvada'],
      ['COSTA/REMADA BAIXA.gif', 'remada-baixa'],
      ['COSTA/REMADA BAIXA NO CABO.gif', 'remada-baixa-cabo'],
      ['COSTA/PUXADA NEUTRA.gif', 'puxada-neutra'],
      ['COSTA/PUXADA COM TRIÂNGULO.gif', 'puxada-triangulo'],
      ['BÍCEPS/ROSCA DIRETA.gif', 'rosca-direta'],
      ['BÍCEPS/ROSCA MARTELO.gif', 'rosca-martelo'],
      ['BÍCEPS/ROSCA ALTERNADA.gif', 'rosca-alternada'],
      ['ABDOMEN/PRANCHA ABDOMEN.gif', 'prancha'],
      ['ABDOMEN/PRANCHA LATERAL.gif', 'prancha-lateral'],
      ['ABDOMEN/PALLOF PRESS.gif', 'pallof-press'],
    ]
  : []

let copied = 0
for (const [rel, id] of downloads) {
  const src = join(process.env.USERPROFILE, 'Downloads', rel)
  const dest = join(outDir, `${id}.gif`)
  if (existsSync(src) && !existsSync(dest)) {
    copyFileSync(src, dest)
    copied++
    console.log('copy', id)
  }
}

const unique = [...new Set(Object.entries(EXERCISE_GIF_MAP).filter(([, url]) => String(url).endsWith('.gif')))]
let downloaded = 0
for (const [id, url] of unique) {
  const dest = join(outDir, `${id}.gif`)
  if (existsSync(dest)) continue
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn('fail', id, res.status)
      continue
    }
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
    downloaded++
    console.log('get ', id)
  } catch (error) {
    console.warn('fail', id, error.message)
  }
}

console.log(`copied ${copied}, downloaded ${downloaded}`)
