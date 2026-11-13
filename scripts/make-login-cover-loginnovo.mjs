import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Capa limpa (personagens + gráfico) a partir de loginnovo.png.
 * - Crop único (sem inventar personagens)
 * - Arte preenche o canvas (sem faixas vazias)
 * - Patch topo-esquerdo remove tipografia baked
 * - Barras ficam no bottom-right da composição
 */
const candidates = [
  path.resolve('public/branding/loginnovo.png'),
  path.resolve('dist/branding/loginnovo.png'),
]
const srcPath = candidates.find((p) => fs.existsSync(p))
if (!srcPath) {
  console.error('loginnovo.png não encontrado em public/branding ou dist/branding')
  process.exit(1)
}

const meta = await sharp(srcPath).metadata()

const left = Math.round(meta.width * 0.045)
const top = Math.round(meta.height * 0.168)
const width = Math.round(meta.width * 0.56)
const height = Math.round(meta.height * 0.655)

const extracted = await sharp(srcPath)
  .extract({ left, top, width, height })
  .modulate({ brightness: 1.02, saturation: 1.03 })
  .toBuffer()

const canvasW = 1800
const canvasH = 1200

// Cover-fill: arte cobre todo o canvas (sem letterbox)
const filled = await sharp(extracted)
  .resize(canvasW, canvasH, {
    fit: 'cover',
    position: 'centre',
    kernel: sharp.kernel.lanczos3,
  })
  .toBuffer()

// Patch topo-esquerdo: tipografia residual do mockup
const patchW = Math.round(canvasW * 0.48)
const patchH = Math.round(canvasH * 0.24)
const patch = Buffer.from(
  `<svg width="${patchW}" height="${patchH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050810" stop-opacity="1"/>
      <stop offset="40%" stop-color="#050810" stop-opacity="1"/>
      <stop offset="75%" stop-color="#050810" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="m"><rect width="100%" height="100%" fill="url(#h)"/></mask>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)" mask="url(#m)"/>
</svg>`,
)

const stripH = Math.round(canvasH * 0.06)
const strip = Buffer.from(
  `<svg width="${canvasW}" height="${stripH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050810" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`,
)

const stage = await sharp(filled)
  .composite([
    { input: patch, left: 0, top: 0 },
    { input: strip, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 8 })
  .toBuffer()

const outPublic = path.resolve('public/branding/login-cover-loginnovo.png')
const outAssets = path.resolve('src/assets/branding/login-cover-loginnovo.png')
const outDist = path.resolve('dist/branding/login-cover-loginnovo.png')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, stage)
fs.writeFileSync(outAssets, stage)
if (fs.existsSync(path.dirname(outDist))) {
  fs.writeFileSync(outDist, stage)
}

const m = await sharp(stage).metadata()
console.log({
  src: `${meta.width}x${meta.height}`,
  crop: { left, top, width, height },
  out: `${m.width}x${m.height}`,
  bytes: stage.length,
})
