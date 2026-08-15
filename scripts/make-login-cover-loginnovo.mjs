import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Extrai capa limpa (personagens + gráfico) a partir do mockup loginnovo.png,
 * removendo tipografia/UI embutidas no topo e rodapé.
 */
const srcPath = path.resolve('dist/branding/loginnovo.png')
const meta = await sharp(srcPath).metadata()

// Região só de personagens + gráfico (abaixo do headline, acima do bloco privacy)
const left = Math.round(meta.width * 0.045)
const top = Math.round(meta.height * 0.30)
const width = Math.round(meta.width * 0.56)
const height = Math.round(meta.height * 0.48)

const stage = await sharp(srcPath)
  .extract({ left, top, width, height })
  .resize(1800, null, { kernel: sharp.kernel.lanczos3 })
  .modulate({ brightness: 1.04, saturation: 1.05 })
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
  out: `${m.width}x${m.height}`,
  bytes: stage.length,
})
