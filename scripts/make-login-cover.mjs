import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

/**
 * Capa quadrada: personagens + gráfico cabem inteiros no stage
 * (sem crop agressivo de object-fit: cover em painel alto).
 */
const base = path.resolve('public/branding')
const src = path.join(base, 'login-characters.jpg')
const outPublic = path.join(base, 'login-cover-balanced.jpg')
const outAssets = path.resolve('src/assets/branding/login-cover-balanced.jpg')

const meta = await sharp(src).metadata()

// Stage quase quadrado — personagens cabem com corpo visível
const outW = 1400
const outH = 1400

// Recolhe a cena (~86% da largura) para o corpo + gráfico caberem no quadrado
const sceneW = Math.round(outW * 0.86)
const sceneH = Math.round(meta.height * (sceneW / meta.width))
const left = Math.round((outW - sceneW) / 2)
// Leve bias para baixo: ar no topo para logo/título
const top = Math.round((outH - sceneH) * 0.52)

const resized = await sharp(src)
  .resize(sceneW, sceneH, { kernel: sharp.kernel.lanczos3 })
  .modulate({ brightness: 1.04, saturation: 1.05 })
  .jpeg({ quality: 93, mozjpeg: true })
  .toBuffer()

const outBuffer = await sharp({
  create: {
    width: outW,
    height: outH,
    channels: 3,
    background: { r: 5, g: 8, b: 16 },
  },
})
  .composite([{ input: resized, left, top }])
  .jpeg({ quality: 93, mozjpeg: true })
  .toBuffer()

fs.mkdirSync(path.dirname(outAssets), { recursive: true })
fs.writeFileSync(outPublic, outBuffer)
fs.writeFileSync(outAssets, outBuffer)

console.log({
  src: `${meta.width}x${meta.height}`,
  scene: `${sceneW}x${sceneH}`,
  left,
  top,
  out: `${outW}x${outH}`,
  fill: +(sceneH / outH).toFixed(3),
})
