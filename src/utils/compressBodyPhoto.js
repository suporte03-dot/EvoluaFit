const MAX_EDGE = 1400
const TARGET_QUALITY = 0.82

function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() =>
      createImageBitmap(file),
    )
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler esta imagem.'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

export async function compressBodyPhoto(file) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    throw new Error('Selecione uma imagem válida.')
  }

  const source = await loadBitmap(file)
  const width = source.width || source.naturalWidth
  const height = source.height || source.naturalHeight
  if (!width || !height) {
    throw new Error('Não foi possível ler esta imagem.')
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.fillStyle = '#0d1219'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(source, 0, 0, w, h)
  if (typeof source.close === 'function') source.close()

  let blob = await canvasToBlob(canvas, 'image/webp', TARGET_QUALITY)
  let ext = 'webp'
  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, 'image/jpeg', TARGET_QUALITY)
    ext = 'jpg'
  }

  if (blob && blob.size > 1_400_000) {
    const lighter = await canvasToBlob(canvas, blob.type, 0.7)
    if (lighter && lighter.size < blob.size) blob = lighter
  }

  if (!blob) {
    throw new Error('Não foi possível compactar esta imagem.')
  }

  const name = `body-${Date.now()}.${ext}`
  return new File([blob], name, { type: blob.type, lastModified: Date.now() })
}
