import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Hero permanente do login EvoluaFit a partir de loginnovo.png.
 *
 * Estratégia: limpa tipografia baked do painel esquerdo, depois embute a
 * composição com contain num canvas no aspect ratio típico do hero (~62% de
 * viewport desktop ≈ 1.05). Letterbox fica NA ARTE (#05070c + extensão das
 * ondas), para o CSS usar object-fit: cover sem cortar rostos nem mostrar
 * barras pretas no layout.
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

fs.mkdirSync(path.resolve('tmp-hero-trials'), { recursive: true })

const meta = await sharp(srcPath).metadata()

// Painel esquerdo do mockup (~62%), altura quase total para preservar cabeças
const crop = {
  left: Math.round(meta.width * 0.012),
  top: Math.round(meta.height * 0.008),
  width: Math.round(meta.width * 0.618),
  height: Math.round(meta.height * 0.984),
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

// Limpeza do canto do texto (logo/headline/sub) — só esquerda; não invade cabeças
const topPatchW = Math.round(W * 0.58)
const topPatchH = Math.round(H * 0.34)
const topPatch = fadePatch({ width: topPatchW, height: topPatchH, solidX: 0.78, solidY: 0.8 })

const topSolidW = Math.round(W * 0.5)
const topSolidH = Math.round(H * 0.26)
const topSolid = Buffer.from(
  `<svg width="${topSolidW}" height="${topSolidH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#05070c"/>
</svg>`,
)

// Segunda passada mais baixa só na faixa da subheadline (esquerda)
const subPatchW = Math.round(W * 0.55)
const subPatchH = Math.round(H * 0.1)
const subPatch = fadePatch({ width: subPatchW, height: subPatchH, solidX: 0.88, solidY: 0.55 })

const privacyW = Math.round(W * 0.4)
const privacyH = Math.round(H * 0.16)
const privacyPatch = fadePatch({
  width: privacyW,
  height: privacyH,
  solidX: 0.82,
  solidY: 0.75,
  fromBottom: true,
})
const privacySolidW = Math.round(W * 0.34)
const privacySolidH = Math.round(H * 0.11)
const privacySolid = Buffer.from(
  `<svg width="${privacySolidW}" height="${privacySolidH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#05070c"/>
</svg>`,
)

const cleaned = await sharp(extracted)
  .composite([
    { input: topPatch, left: 0, top: 0 },
    { input: topSolid, left: Math.round(W * 0.008), top: Math.round(H * 0.006) },
    { input: subPatch, left: 0, top: Math.round(H * 0.22) },
    { input: privacyPatch, left: 0, top: H - privacyH },
    {
      input: privacySolid,
      left: Math.round(W * 0.008),
      top: Math.round(H * 0.84),
    },
  ])
  .toBuffer()

await sharp(cleaned).png().toFile(path.resolve('tmp-hero-trials/cleaned-v2.png'))

// Canvas no AR do painel hero em 1440×900 (62% → 893×900 ≈ 0.992)
// Assim cover no desktop típico não gera letterbox no layout.
const outW = 1786
const outH = 1800

// Quase preenche a altura (97%) — personagens grandes; margem mínima p/ cover em 16:9
const fitScale = (outH / H) * 0.97
const dw = Math.round(W * fitScale)
const dh = Math.round(H * fitScale)
const left = Math.round((outW - dw) / 2)
const top = Math.round((outH - dh) / 2) + Math.round(outH * 0.012)

const resized = await sharp(cleaned)
  .resize(dw, dh, { kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer()

// Atmosfera contínua (ondas blur + escurecidas) em vez de faixas laterais “mortas”
const atmosphere = await sharp(cleaned)
  .resize(outW, outH, { fit: 'cover', position: 'centre' })
  .blur(48)
  .modulate({ brightness: 0.32, saturation: 0.85 })
  .toBuffer()

const approved = await sharp({
  create: {
    width: outW,
    height: outH,
    channels: 3,
    background: { r: 5, g: 7, b: 12 },
  },
})
  .composite([
    { input: atmosphere, left: 0, top: 0 },
    { input: resized, left, top },
  ])
  .png({ compressionLevel: 8 })
  .toBuffer()

const outPublic = path.resolve('public/branding/evoluafit-login-hero-approved.png')
const outAssets = path.resolve('src/assets/branding/evoluafit-login-hero-approved.png')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, approved)
fs.writeFileSync(outAssets, approved)
await sharp(approved).png().toFile(path.resolve('tmp-hero-trials/approved-panel-ar.png'))

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

const outMeta = await sharp(approved).metadata()
console.log({
  src: path.relative(process.cwd(), srcPath),
  srcSize: `${meta.width}x${meta.height}`,
  crop,
  extracted: `${W}x${H}`,
  placed: `${dw}x${dh} @ ${left},${top}`,
  approved: `${outMeta.width}x${outMeta.height}`,
  ar: Number((outMeta.width / outMeta.height).toFixed(4)),
  bytes: approved.length,
})
