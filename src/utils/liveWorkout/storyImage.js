const W = 1080
const H = 1920
const HEADING = '"Outfit", system-ui, sans-serif'
const BODY = '"Figtree", system-ui, sans-serif'

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function fitText(ctx, text, maxWidth, size, weight, family) {
  let s = size
  do {
    ctx.font = `${weight} ${s}px ${family}`
    if (ctx.measureText(text).width <= maxWidth) break
    s -= 4
  } while (s > 28)
  return s
}

function brandGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, '#4F7CF7')
  g.addColorStop(1, '#8B5CF6')
  return g
}

/**
 * Gera a imagem 1080×1920 do story.
 * data: { title, subtitle, dateLabel, stats: [{label, value}], highlight?: {kicker, title, value}, footer }
 */
export async function renderStoryImage(data) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (document.fonts?.ready) await document.fonts.ready

  ctx.fillStyle = '#0A1120'
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W * 0.8, 260, 40, W * 0.8, 260, 900)
  glow.addColorStop(0, 'rgba(139, 92, 246, 0.35)')
  glow.addColorStop(1, 'rgba(10, 17, 32, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  const glow2 = ctx.createRadialGradient(80, H - 200, 40, 80, H - 200, 800)
  glow2.addColorStop(0, 'rgba(79, 124, 247, 0.28)')
  glow2.addColorStop(1, 'rgba(10, 17, 32, 0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  const logo = await loadImage(`${import.meta.env.BASE_URL}branding/evoluafit-lockup.webp`)
  if (logo) {
    const lw = 360
    const lh = (logo.height / logo.width) * lw
    ctx.drawImage(logo, 96, 120, lw, lh)
  } else {
    ctx.fillStyle = '#EEF2F9'
    ctx.font = `700 56px ${HEADING}`
    ctx.fillText('EvoluaFit', 96, 180)
  }

  let y = 420
  ctx.fillStyle = '#6EA8FE'
  ctx.font = `700 34px ${BODY}`
  ctx.fillText(String(data.kicker || 'TREINO CONCLUÍDO').toUpperCase(), 96, y)

  y += 100
  ctx.fillStyle = '#EEF2F9'
  const titleSize = fitText(ctx, data.title, W - 192, 92, 700, HEADING)
  ctx.font = `700 ${titleSize}px ${HEADING}`
  ctx.fillText(data.title, 96, y)

  if (data.dateLabel) {
    y += 64
    ctx.fillStyle = '#9AA6BC'
    ctx.font = `500 36px ${BODY}`
    ctx.fillText(data.dateLabel, 96, y)
  }

  if (data.highlight) {
    y += 80
    const hh = 300
    roundRect(ctx, 96, y, W - 192, hh, 36)
    ctx.fillStyle = brandGradient(ctx, 96, y, W - 96, y + hh)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = `700 32px ${BODY}`
    ctx.fillText(data.highlight.kicker.toUpperCase(), 150, y + 80)
    ctx.fillStyle = '#FFFFFF'
    const hs = fitText(ctx, data.highlight.title, W - 300, 64, 700, HEADING)
    ctx.font = `700 ${hs}px ${HEADING}`
    ctx.fillText(data.highlight.title, 150, y + 165)
    ctx.font = `700 56px ${HEADING}`
    ctx.fillText(data.highlight.value, 150, y + 245)
    y += hh
  }

  y += 80
  const gap = 32
  const cw = (W - 192 - gap) / 2
  const ch = 230
  ;(data.stats || []).slice(0, 4).forEach((stat, i) => {
    const cx = 96 + (i % 2) * (cw + gap)
    const cy = y + Math.floor(i / 2) * (ch + gap)
    roundRect(ctx, cx, cy, cw, ch, 32)
    ctx.fillStyle = '#111A2E'
    ctx.fill()
    ctx.strokeStyle = 'rgba(148,163,184,0.14)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#9AA6BC'
    ctx.font = `600 32px ${BODY}`
    ctx.fillText(stat.label.toUpperCase(), cx + 44, cy + 76)
    ctx.fillStyle = '#EEF2F9'
    const vs = fitText(ctx, stat.value, cw - 88, 76, 700, HEADING)
    ctx.font = `700 ${vs}px ${HEADING}`
    ctx.fillText(stat.value, cx + 44, cy + 170)
  })

  ctx.fillStyle = brandGradient(ctx, 96, 0, W - 96, 0)
  roundRect(ctx, 96, H - 220, W - 192, 8, 4)
  ctx.fill()
  ctx.fillStyle = '#9AA6BC'
  ctx.font = `500 34px ${BODY}`
  ctx.fillText(data.footer || 'Treino registrado no EvoluaFit', 96, H - 140)

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'))
}

/** Web Share API com arquivo; sem suporte, baixa a imagem. */
export async function shareStoryImage(blob, { filename = 'evoluafit-story.png', text = '' } = {}) {
  if (!blob) return 'error'
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'downloaded'
}
