import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Hero permanente do login EvoluaFit a partir de loginnovo.png.
 * Peça única: personagens + ondas + gráfico + iluminação.
 * Remove tipografia baked (logo/headline/sub/privacy). Mantém TREINE/ACOMPANHE/EVOLUA.
 */
const candidates = [
  path.resolve('public/branding/loginnovo.png'),
  path.resolve('src/assets/branding/loginnovo.png'),
]
const srcPath = candidates.find((p) => fs.existsSync(p))
if (!srcPath) {
  console.error('Fonte loginnovo.png não encontrada')
  process.exit(1)
}

const meta = await sharp(srcPath).metadata()

const crop = {
  left: Math.round(meta.width * 0.018),
  top: Math.round(meta.height * 0.018),
  width: Math.round(meta.width * 0.615),
  height: Math.round(meta.height * 0.955),
}

const extracted = await sharp(srcPath).extract(crop).toBuffer()
const exMeta = await sharp(extracted).metadata()
const W = exMeta.width
const H = exMeta.height

function fadePatch({ width, height, solidX = 0.7, solidY = 0.7, fromBottom = false }) {
  const y1 = fromBottom ? '1' : '0'
  const y2 = fromBottom ? '0' : '1'
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="${y1}" x2="0" y2="${y2}">
      <stop offset="0%" stop-color="#05070c" stop-opacity="1"/>
      <stop offset="${Math.round(solidY * 100)}%" stop-color="#05070c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#05070c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="${Math.round(solidX * 100)}%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="100%" height="100%" fill="url(#h)"/></mask>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)" mask="url(#m)"/>
</svg>`,
  )
}

const topPatchW = Math.round(W * 0.58)
const topPatchH = Math.round(H * 0.36)
const topPatch = fadePatch({ width: topPatchW, height: topPatchH, solidX: 0.78, solidY: 0.78 })

// Camada extra opaca só na caixa de texto (logo + headline + sub)
const topSolidW = Math.round(W * 0.5)
const topSolidH = Math.round(H * 0.26)
const topSolid = Buffer.from(
  `<svg width="${topSolidW}" height="${topSolidH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="0" fill="#05070c"/>
</svg>`,
)

const privacyW = Math.round(W * 0.42)
const privacyH = Math.round(H * 0.2)
const privacyPatch = fadePatch({
  width: privacyW,
  height: privacyH,
  solidX: 0.85,
  solidY: 0.78,
  fromBottom: true,
})
const privacySolidW = Math.round(W * 0.36)
const privacySolidH = Math.round(H * 0.13)
const privacySolid = Buffer.from(
  `<svg width="${privacySolidW}" height="${privacySolidH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#05070c"/>
</svg>`,
)

const cleaned = await sharp(extracted)
  .composite([
    { input: topPatch, left: 0, top: 0 },
    { input: topSolid, left: Math.round(W * 0.01), top: Math.round(H * 0.01) },
    {
      input: privacyPatch,
      left: 0,
      top: H - privacyH,
    },
    {
      input: privacySolid,
      left: Math.round(W * 0.008),
      top: Math.round(H * 0.82),
    },
  ])
  .toBuffer()

// Asset permanente = crop limpo nativo (sem letterbox prévio).
// Letterbox fica só no CSS (object-fit: contain) conforme o painel real.
const approved = await sharp(cleaned).png({ compressionLevel: 8 }).toBuffer()
const outMetaNative = await sharp(approved).metadata()

const outPublic = path.resolve('public/branding/evoluafit-login-hero-approved.png')
const outAssets = path.resolve('src/assets/branding/evoluafit-login-hero-approved.png')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, approved)
fs.writeFileSync(outAssets, approved)

// Variantes: mesma arte; desktop upscale suave p/ telas densas (sem re-crop)
const variants = [
  { name: 'desktop', width: 1600 },
  { name: 'tablet', width: 1100 },
  { name: 'mobile', width: 720 },
]

for (const v of variants) {
  const buf = await sharp(approved)
    .resize({
      width: v.width,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 8 })
    .toBuffer()
  fs.writeFileSync(path.resolve(`public/branding/evoluafit-login-hero-${v.name}.png`), buf)
  const m = await sharp(buf).metadata()
  console.log(v.name, `${m.width}x${m.height}`, `${(buf.length / 1024).toFixed(0)}KB`)
}

await sharp(cleaned).resize(720, null).png().toFile('tmp-hero-trials/cleaned-check.png')

console.log({
  src: path.relative(process.cwd(), srcPath),
  srcSize: `${meta.width}x${meta.height}`,
  crop,
  extracted: `${W}x${H}`,
  approved: `${outMetaNative.width}x${outMetaNative.height}`,
  bytes: approved.length,
})
