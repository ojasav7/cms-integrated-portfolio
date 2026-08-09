/**
 * Canvas2D render engine for the "dd" ASCII-art effect.
 *
 * Reimplements the 21st.dev pipeline from scratch:
 *   1. background (blur / original / solid / none)
 *   2. grid sampling (cellSize)
 *   3. per-cell primitive per renderMode
 *   4. color adjustments (brightness → contrast → saturation → grayscale → tint)
 *   5. blur (gaussian / motion / tilt / lens / progressive)
 *   6. post-effects (vignette, scanLines, chromatic, bloom, filmGrain,
 *      glitch, pixelate, halftone, filmDust)
 *   7. lights
 *   8. mask
 *   9. animation (wave / pulse / shimmer / ripple / flicker)
 */

import type { AsciiArtConfig, AsciiTonePoint } from './config'

export interface Cell {
  x: number
  y: number
  w: number
  h: number
  r: number
  g: number
  b: number
  lum: number // 0..1
  edge: number // 0..1 gradient magnitude
}

const CHAR_SETS: Record<string, string> = {
  standard: ' .:-=+*#%@',
  block: ' ░▒▓█',
  binary: ' 01',
  hex: ' 0123456789ABCDEF',
  braille: ' ⠁⠂⠄⠈⠐⠠⡀⢀',
  ascii: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
}

function getCharSet(config: AsciiArtConfig): string {
  if (config.charSet === 'custom' && config.customChars) {
    return config.customChars
  }
  return CHAR_SETS[config.charSet] ?? CHAR_SETS.standard
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v))
}

/** Piecewise-linear tone-curve lookup (x/y are 0..1). Identity by default. */
function applyToneCurve(v: number, points?: AsciiTonePoint[]): number {
  if (!points || points.length < 2) return v
  const pts = [...points].sort((a, b) => a.x - b.x)
  if (v <= pts[0].x) return pts[0].y
  const last = pts[pts.length - 1]
  if (v >= last.x) return last.y
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    if (v >= a.x && v <= b.x) {
      const t = b.x === a.x ? 0 : (v - a.x) / (b.x - a.x)
      return a.y + (b.y - a.y) * t
    }
  }
  return v
}

function hash2(x: number, y: number) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) >>> 0) / 4294967295
}

/** Sample the image into a grid of cells (one average color per cell). */
function sampleCells(
  img: HTMLImageElement,
  cellSize: number,
  width: number,
  height: number,
): Cell[] {
  const cols = Math.max(1, Math.ceil(width / cellSize))
  const rows = Math.max(1, Math.ceil(height / cellSize))
  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const octx = off.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(img, 0, 0, cols, rows)
  const data = octx.getImageData(0, 0, cols, rows).data

  const cells: Cell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4
      const rr = data[i]
      const gg = data[i + 1]
      const bb = data[i + 2]
      const lum = (0.2126 * rr + 0.7152 * gg + 0.0722 * bb) / 255
      cells.push({
        x: c * cellSize,
        y: r * cellSize,
        w: cellSize,
        h: cellSize,
        r: rr,
        g: gg,
        b: bb,
        lum,
        edge: 0,
      })
    }
  }

  // Edge magnitude = max luminance delta with 4 neighbours.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c
      const cell = cells[i]
      let maxDelta = 0
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ]
      for (const [nr, nc] of neighbors) {
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        maxDelta = Math.max(maxDelta, Math.abs(cell.lum - cells[nr * cols + nc].lum))
      }
      cell.edge = maxDelta
    }
  }
  return cells
}

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: AsciiArtConfig,
  w: number,
  h: number,
) {
  const mode = config.bgMode
  if (mode === 'none' || mode === 'transparent') return
  ctx.save()
  ctx.globalAlpha = clamp(config.bgOpacity / 100)
  if (mode === 'blur') {
    ctx.filter = `blur(${config.bgBlur}px)`
    ctx.drawImage(img, 0, 0, w, h)
    ctx.filter = 'none'
  } else if (mode === 'original') {
    ctx.drawImage(img, 0, 0, w, h)
  } else if (mode === 'solid') {
    ctx.fillStyle = config.tint || '#000'
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Animation                                                           */
/* ------------------------------------------------------------------ */

interface AnimState {
  t: number
  amp: number
  style: string
}

function getAnim(config: AsciiArtConfig, time: number): AnimState {
  const frozen = config.animated === false
  const speed = config.animSpeed?.enabled && !frozen ? config.animSpeed.intensity / 100 : 0
  const amp = config.animIntensity?.enabled && !frozen ? config.animIntensity.intensity / 100 : 0
  const t = frozen ? 0 : time * (0.5 + speed * 1.5)
  return { t, amp, style: config.animStyle }
}

function animOffset(cell: Cell, anim: AnimState, w: number, h: number) {
  let x = cell.x
  let y = cell.y
  const cs = cell.w
  const { t, amp, style } = anim
  if (style === 'wave') {
    y += Math.sin((cell.x / cs) * 0.5 + t) * amp * cs * 0.3
  } else if (style === 'ripple') {
    const cx = w / 2
    const cy = h / 2
    const dist = Math.hypot(cell.x - cx, cell.y - cy)
    y += Math.sin(dist * 0.05 - t * 2) * amp * cs * 0.4
  }
  return { x, y }
}

function cellAlpha(cell: Cell, anim: AnimState) {
  const { t, amp, style } = anim
  if (style === 'pulse') {
    return 0.55 + 0.45 * Math.sin(t * 2 + (cell.x + cell.y) * 0.1)
  }
  if (style === 'shimmer') {
    const v = Math.sin((cell.x + cell.y) * 0.1 - t * 3)
    return 0.5 + 0.5 * v
  }
  if (style === 'flicker') {
    return Math.random() > 0.5 ? 1 : 0.7
  }
  return 1
}

/* ------------------------------------------------------------------ */
/* Cell primitives                                                     */
/* ------------------------------------------------------------------ */

function drawChar(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.font = `${size}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(ch, x, y)
}

function drawCells(
  ctx: CanvasRenderingContext2D,
  cells: Cell[],
  config: AsciiArtConfig,
  time: number,
  w: number,
  h: number,
) {
  const mode = config.renderMode
  const blend = config.styleBlend || 'source-over'
  const coverage = clamp(config.coverage / 100)
  const density = clamp(config.density / 100)
  const invert = config.invert
  const cellSize = config.cellSize
  const chars = getCharSet(config)
  const anim = getAnim(config, time)
  const edgeBoost = clamp(config.edgeEmphasis / 100)

  ctx.save()
  ctx.globalCompositeOperation = blend as GlobalCompositeOperation

  for (const cell of cells) {
    if (coverage < 1 && hash2(cell.x, cell.y) > coverage) continue

    let lum = invert ? 1 - cell.lum : cell.lum
    if (edgeBoost > 0) {
      // Push luminance away from mid-grey near edges.
      lum = clamp(lum + (cell.edge - 0.5) * edgeBoost * 1.4)
    }
    lum = applyToneCurve(clamp(lum), config.toneCurve)

    const { x, y } = animOffset(cell, anim, w, h)
    const cx = x + cellSize / 2
    const cy = y + cellSize / 2
    const color = `rgb(${cell.r},${cell.g},${cell.b})`
    const alpha = cellAlpha(cell, anim)
    // Glyphs render at roughly cell size (matches the reference look);
    // density scales them up or down from there.
    const size = cellSize * (0.85 + density * 0.3)

    switch (mode) {
      case 'characters': {
        const idx = Math.min(chars.length - 1, Math.floor(lum * chars.length))
        drawChar(ctx, chars[idx], cx, cy, size, color, alpha)
        break
      }
      case 'hexdump': {
        const hex = '0123456789ABCDEF'
        drawChar(ctx, hex[Math.floor(lum * 15)], cx, cy, size, color, alpha)
        break
      }
      case 'halfblocks': {
        const ch = lum > 0.75 ? '█' : lum > 0.25 ? '▀' : '▄'
        drawChar(ctx, ch, cx, cy, cellSize, color, alpha)
        break
      }
      case 'matrix': {
        const ch = chars[Math.floor(((lum + time * 0.01 + (x / cellSize) * 0.1) % 1) * chars.length)]
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgba(0,255,70,${0.35 + lum * 0.65})`
        ctx.font = `${cellSize * 0.7}px ui-monospace, monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(ch, cx, cy)
        break
      }
      case 'dots':
      case 'bubbles': {
        const r = (cellSize / 2) * (0.15 + lum * 0.85)
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
        if (mode === 'bubbles') {
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.beginPath()
          ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      }
      case 'mosaic':
      case 'pixel': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillRect(x, y, cellSize, cellSize)
        break
      }
      case 'dither': {
        // Ordered dithering via a 4x4 Bayer matrix.
        const bayer = [
          [0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5],
        ]
        const col = Math.floor(x / cellSize) % 4
        const row = Math.floor(y / cellSize) % 4
        const threshold = (bayer[row][col] + 0.5) / 16
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        if (lum > threshold) ctx.fillRect(x, y, cellSize, cellSize)
        break
      }
      case 'cross': {
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.12)
        ctx.beginPath()
        ctx.moveTo(x + cellSize * 0.2, y + cellSize * 0.2)
        ctx.lineTo(x + cellSize * 0.8, y + cellSize * 0.8)
        ctx.moveTo(x + cellSize * 0.8, y + cellSize * 0.2)
        ctx.lineTo(x + cellSize * 0.2, y + cellSize * 0.8)
        ctx.stroke()
        break
      }
      case 'diamond': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(Math.PI / 4)
        const s = cellSize * (0.2 + lum * 0.5)
        ctx.fillRect(-s / 2, -s / 2, s, s)
        ctx.restore()
        break
      }
      case 'voxel': {
        const s = cellSize * (0.3 + lum * 0.5)
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillRect(cx - s / 2, cy - s / 2, s, s)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(cx - s / 2, cy - s / 2, s, s * 0.3)
        break
      }
      case 'lego': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.fillRect(x + cellSize * 0.1, y + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(cx, cy, cellSize * 0.18, 0, Math.PI * 2)
        ctx.fill()
        break
      }
      case 'mixed': {
        const t = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 3
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        if (t === 0) {
          ctx.beginPath()
          ctx.arc(cx, cy, cellSize * 0.3, 0, Math.PI * 2)
          ctx.fill()
        } else if (t === 1) {
          ctx.fillRect(x + cellSize * 0.1, y + cellSize * 0.1, cellSize * 0.8, cellSize * 0.8)
        } else {
          ctx.strokeStyle = color
          ctx.lineWidth = Math.max(1, cellSize * 0.08)
          ctx.beginPath()
          ctx.moveTo(x + cellSize * 0.2, cy)
          ctx.lineTo(x + cellSize * 0.8, cy)
          ctx.stroke()
        }
        break
      }
      case 'lines': {
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.06)
        ctx.beginPath()
        ctx.moveTo(x, cy)
        ctx.lineTo(x + cellSize, cy)
        ctx.stroke()
        break
      }
      case 'diagonal': {
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.06)
        ctx.beginPath()
        ctx.moveTo(x, y + cellSize)
        ctx.lineTo(x + cellSize, y)
        ctx.stroke()
        break
      }
      case 'braille': {
        const dots = Math.round(lum * 6)
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        for (let i = 0; i < dots; i++) {
          const dx = (i % 2) * cellSize * 0.4
          const dy = Math.floor(i / 2) * cellSize * 0.3
          ctx.beginPath()
          ctx.arc(x + cellSize * 0.3 + dx, y + cellSize * 0.2 + dy, cellSize * 0.08, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      }
      case 'rings': {
        const n = Math.floor(lum * 3) + 1
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.05)
        for (let i = 0; i < n; i++) {
          ctx.beginPath()
          ctx.arc(cx, cy, (cellSize / 2) * ((i + 1) / n), 0, Math.PI * 2)
          ctx.stroke()
        }
        break
      }
      case 'hearts': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        drawHeart(ctx, cx, cy, cellSize * (0.2 + lum * 0.3))
        break
      }
      case 'stars': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        drawStar(ctx, cx, cy, 5, cellSize * (0.2 + lum * 0.35), cellSize * (0.08 + lum * 0.15))
        break
      }
      case 'hexagons': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        drawHexagon(ctx, cx, cy, cellSize * (0.2 + lum * 0.3))
        break
      }
      case 'triangles': {
        ctx.globalAlpha = alpha
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(x, y + cellSize)
        ctx.lineTo(x + cellSize, y + cellSize)
        ctx.lineTo(x + cellSize / 2, y)
        ctx.closePath()
        ctx.fill()
        break
      }
      case 'hatch': {
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.04)
        const n = 2 + Math.floor(lum * 3)
        for (let i = 0; i < n; i++) {
          const off = i * cellSize * 0.2
          ctx.beginPath()
          ctx.moveTo(x + off, y)
          ctx.lineTo(x + cellSize, y + cellSize - off)
          ctx.stroke()
        }
        break
      }
      case 'contour': {
        const n = Math.floor(lum * 4)
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(1, cellSize * 0.05)
        for (let i = 0; i < n; i++) {
          const inset = (i / n) * cellSize * 0.4
          ctx.strokeRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2)
        }
        break
      }
    }
  }
  ctx.restore()
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.3)
  ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.3)
  ctx.bezierCurveTo(cx - size, cy + size * 0.6, cx, cy + size, cx, cy + size * 0.8)
  ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.6, cx + size, cy + size * 0.3)
  ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3)
  ctx.fill()
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number,
) {
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outer)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
    rot += step
  }
  ctx.closePath()
  ctx.fill()
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/* ------------------------------------------------------------------ */
/* Color adjustments                                                   */
/* ------------------------------------------------------------------ */

function applyColorAdjustments(
  ctx: CanvasRenderingContext2D,
  config: AsciiArtConfig,
  w: number,
  h: number,
) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')!
  octx.drawImage(ctx.canvas, 0, 0)

  ctx.clearRect(0, 0, w, h)

  const filters: string[] = []
  const brightness = config.brightness / 100
  const contrast = config.contrast / 100
  const sat = config.saturation / 100
  const gray = config.grayscale / 100
  if (brightness !== 0) filters.push(`brightness(${1 + brightness})`)
  if (contrast !== 1) filters.push(`contrast(${contrast})`)
  if (sat !== 1) filters.push(`saturate(${sat})`)
  if (gray > 0) filters.push(`grayscale(${gray})`)

  ctx.filter = filters.join(' ')
  ctx.drawImage(off, 0, 0)
  ctx.filter = 'none'

  // Tint via overlay blend.
  if (config.tintOpacity > 0) {
    ctx.save()
    ctx.globalCompositeOperation = (config.overlayBlend || 'soft-light') as GlobalCompositeOperation
    ctx.globalAlpha = clamp(config.tintOpacity / 100)
    ctx.fillStyle = config.tint || '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* Blur                                                               */
/* ------------------------------------------------------------------ */

function applyBlur(
  ctx: CanvasRenderingContext2D,
  config: AsciiArtConfig,
  w: number,
  h: number,
) {
  const type = config.blurType
  if (type === 'off' || config.blurAmount <= 0) return
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')!
  octx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)

  if (type === 'gaussian') {
    ctx.filter = `blur(${config.blurAmount}px)`
    ctx.drawImage(off, 0, 0)
    ctx.filter = 'none'
  } else if (type === 'motion') {
    const angle = (config.blurAngle * Math.PI) / 180
    const amount = config.blurAmount
    const steps = 8
    // directionalBothSides: trail on both sides of the line, otherwise the
    // blur trails in a single direction along the angle.
    for (let i = 0; i < steps; i++) {
      const t = config.directionalBothSides
        ? i / (steps - 1) - 0.5
        : i / (steps - 1)
      const dx = Math.cos(angle) * amount * t
      const dy = Math.sin(angle) * amount * t
      ctx.globalAlpha = 1 / steps
      ctx.drawImage(off, dx, dy)
    }
    ctx.globalAlpha = 1
  } else if (type === 'tilt') {
    const pos = (config.tiltPosition / 100) * h
    const feather = (config.tiltFeather / 100) * h
    const focus = (config.tiltFocus / 100) * h
    ctx.filter = `blur(${config.blurAmount}px)`
    ctx.drawImage(off, 0, 0)
    ctx.filter = 'none'
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, pos - focus / 2 - feather / 2, w, focus + feather)
    ctx.clip()
    ctx.drawImage(off, 0, 0)
    ctx.restore()
  } else if (type === 'lens') {
    const cx = (config.blurCenterX / 100) * w
    const cy = (config.blurCenterY / 100) * h
    ctx.filter = `blur(${config.blurAmount}px)`
    ctx.drawImage(off, 0, 0)
    ctx.filter = 'none'
    const radius = (config.lensFocus / 100) * Math.max(w, h)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(off, 0, 0)
    ctx.restore()
  } else if (type === 'progressive') {
    const pos = (config.progressivePosition / 100) * h
    ctx.filter = `blur(${config.blurAmount}px)`
    ctx.drawImage(off, 0, 0)
    ctx.filter = 'none'
    ctx.save()
    ctx.beginPath()
    if (config.progressiveReverse) ctx.rect(0, 0, w, pos)
    else ctx.rect(0, pos, w, h - pos)
    ctx.clip()
    ctx.drawImage(off, 0, 0)
    ctx.restore()
  }
}

/* ------------------------------------------------------------------ */
/* Post effects                                                        */
/* ------------------------------------------------------------------ */

function applyPostEffects(
  ctx: CanvasRenderingContext2D,
  config: AsciiArtConfig,
  w: number,
  h: number,
  time: number,
) {
  const pfx = config.pfx
  if (pfx.vignette?.enabled) applyVignette(ctx, w, h, pfx.vignette.intensity)
  if (pfx.scanLines?.enabled) applyScanLines(ctx, w, h, pfx.scanLines.intensity)
  if (pfx.chromatic?.enabled) applyChromatic(ctx, w, h, pfx.chromatic.intensity)
  if (pfx.bloom?.enabled) applyBloom(ctx, w, h, pfx.bloom.intensity)
  if (pfx.filmGrain?.enabled) applyFilmGrain(ctx, w, h, pfx.filmGrain.intensity)
  if (pfx.glitch?.enabled) applyGlitch(ctx, w, h, pfx.glitch.intensity)
  if (pfx.pixelate?.enabled) applyPixelate(ctx, w, h, pfx.pixelate.intensity)
  if (pfx.halftone?.enabled) applyHalftone(ctx, w, h, pfx.halftone.intensity)
  if (pfx.filmDust?.enabled) applyFilmDust(ctx, w, h, pfx.filmDust.intensity)
}

function applyVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  const grad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.3,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  )
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(0,0,0,${clamp(intensity / 100)})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

function applyScanLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(intensity / 100)
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()
}

function applyChromatic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(ctx.canvas, 0, 0)
  const img = octx.getImageData(0, 0, w, h)
  const data = img.data
  const shift = Math.max(1, Math.round((intensity / 100) * 8))
  const out = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const ri = (y * w + Math.max(0, x - shift)) * 4
      const bi = (y * w + Math.min(w - 1, x + shift)) * 4
      out.data[i] = data[ri]
      out.data[i + 1] = data[i + 1]
      out.data[i + 2] = data[bi]
      out.data[i + 3] = data[i + 3]
    }
  }
  ctx.putImageData(out, 0, 0)
}

function applyBloom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')!
  octx.drawImage(ctx.canvas, 0, 0)
  octx.globalCompositeOperation = 'source-in'
  octx.fillStyle = 'rgba(255,255,255,0.5)'
  octx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = clamp(intensity / 100)
  ctx.filter = `blur(${Math.max(2, intensity / 3)}px)`
  ctx.drawImage(off, 0, 0)
  ctx.filter = 'none'
  ctx.restore()
}

function applyFilmGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(intensity / 100) * 0.6
  const count = Math.floor((w * h) / 400)
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const v = Math.floor(Math.random() * 255)
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random()})`
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.restore()
}

function applyGlitch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  if (Math.random() > intensity / 100) return
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')!
  octx.drawImage(ctx.canvas, 0, 0)
  const bands = 3 + Math.floor(Math.random() * 4)
  for (let i = 0; i < bands; i++) {
    const y = Math.random() * h
    const bh = 2 + Math.random() * 20
    const dx = (Math.random() - 0.5) * 40
    ctx.drawImage(off, dx, y, w, bh, 0, y, w, bh)
  }
}

function applyPixelate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  const size = Math.max(2, Math.round((intensity / 100) * 16))
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d')!
  octx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(off, 0, 0, w / size, h / size)
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(off, 0, 0, w / size, h / size, 0, 0, w, h)
}

function applyHalftone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(ctx.canvas, 0, 0)
  const img = octx.getImageData(0, 0, w, h)
  ctx.clearRect(0, 0, w, h)
  const step = Math.max(3, Math.round((intensity / 100) * 10))
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4
      const lum = (0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2]) / 255
      const r = step * 0.5 * (1 - lum)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${img.data[i]},${img.data[i + 1]},${img.data[i + 2]})`
      ctx.fill()
    }
  }
}

function applyFilmDust(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
) {
  ctx.save()
  ctx.globalAlpha = clamp(intensity / 100) * 0.5
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 0.5 + Math.random() * 2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'
    ctx.fill()
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Lights + mask                                                       */
/* ------------------------------------------------------------------ */

function applyLights(
  ctx: CanvasRenderingContext2D,
  config: AsciiArtConfig,
  w: number,
  h: number,
  time: number,
) {
  if (!config.lights?.enabled || !config.lights.points.length) return
  for (const p of config.lights.points) {
    const x = p.x * w
    const y = p.y * h
    const r = Math.max(1, p.radius * Math.max(w, h))
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    const pulse = 0.7 + 0.3 * Math.sin(time * 2 + x)
    grad.addColorStop(0, `rgba(255,255,255,${clamp((p.intensity / 100) * pulse)})`)
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }
}

function applyMask(
  ctx: CanvasRenderingContext2D,
  config: AsciiArtConfig,
  maskImage: HTMLImageElement | null,
  w: number,
  h: number,
) {
  if (!config.mask?.enabled || !maskImage) return
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const octx = off.getContext('2d', { willReadFrequently: true })!
  octx.drawImage(maskImage, 0, 0, w, h)
  if (config.mask.invert) {
    const img = octx.getImageData(0, 0, w, h)
    const d = img.data
    for (let i = 3; i < d.length; i += 4) d[i] = 255 - d[i]
    octx.putImageData(img, 0, 0)
  }
  ctx.save()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(off, 0, 0)
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function renderAsciiFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: AsciiArtConfig,
  time: number,
  width: number,
  height: number,
  maskImage: HTMLImageElement | null = null,
) {
  ctx.clearRect(0, 0, width, height)
  drawBackground(ctx, img, config, width, height)
  const cells = sampleCells(img, config.cellSize, width, height)
  drawCells(ctx, cells, config, time, width, height)
  applyColorAdjustments(ctx, config, width, height)
  applyBlur(ctx, config, width, height)
  applyPostEffects(ctx, config, width, height, time)
  applyLights(ctx, config, width, height, time)
  applyMask(ctx, config, maskImage, width, height)
}