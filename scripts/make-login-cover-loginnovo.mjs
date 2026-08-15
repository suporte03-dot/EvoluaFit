import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Capa limpa (personagens + gráfico) a partir de loginnovo.png.
 * - Crop único (sem inventar personagens / sem separar camadas)
 * - Arte reduzida e ancorada embaixo → headroom para o título + gráfico menor
 * - Wipe no topo remove tipografia residual do mockup
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

// Personagens + barras (abaixo do headline, acima do privacy)
const left = Math.round(meta.width * 0.025)
const top = Math.round(meta.height * 0.28)
const width = Math.round(meta.width * 0.585)
const height = Math.round(meta.height * 0.52)

const extracted = await sharp(srcPath)
  .extract({ left, top, width, height })
  .resize(1800, null, { kernel: sharp.kernel.lanczos3 })
  .modulate({ brightness: 1.04, saturation: 1.05 })
  .toBuffer()

const em = await sharp(extracted).metadata()

const canvasW = 1800
const canvasH = 1360
// Arte reduzida + ancorada embaixo → headroom para título e gráfico menor
const artScale = 0.78
const artW = Math.round(em.width * artScale)
const artH = Math.round(em.height * artScale)
const artBuf = await sharp(extracted)
  .resize(artW, artH, { kernel: sharp.kernel.lanczos3 })
  .toBuffer()

// Homem centro-esquerda / mulher à direita; gráfico bottom-center/right
const leftPad = Math.round((canvasW - artW) * 0.42)
const topPad = canvasH - artH - Math.round(canvasH * 0.015)

const bg = await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 3,
    background: { r: 5, g: 8, b: 16 },
  },
})
  .png()
  .toBuffer()

const wipeH = Math.round(canvasH * 0.26)
const wipe = Buffer.from(
  `<svg width="${canvasW}" height="${wipeH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050810" stop-opacity="1"/>
      <stop offset="42%" stop-color="#050810" stop-opacity="0.88"/>
      <stop offset="72%" stop-color="#050810" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`,
)

const stage = await sharp(bg)
  .composite([
    { input: artBuf, left: leftPad, top: topPad },
    { input: wipe, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 8 })
  .toBuffer()

const outPublic = path.resolve('public/branding/login-cover-loginnovo.png')
const outAssets = path.resolve('src/assets/branding/login-cover-loginnovo.png')
fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, stage)
fs.writeFileSync(outAssets, stage)

const m = await sharp(stage).metadata()
console.log({
  src: `${meta.width}x${meta.height}`,
  crop: { left, top, width, height },
  art: `${artW}x${artH}`,
  place: { leftPad, topPad },
  out: `${m.width}x${m.height}`,
  bytes: stage.length,
})
