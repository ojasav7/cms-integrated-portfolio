import { useEffect, useRef } from 'react'
import type { AsciiArtConfig } from './config'
import { renderAsciiFrame } from './engine'

interface AsciiArtProps {
  src: string
  config: AsciiArtConfig
  className?: string
  alt?: string
  /** Pause the render loop (e.g. while off-screen). */
  paused?: boolean
}

export function AsciiArt({ src, config, className, alt, paused }: AsciiArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const maskRef = useRef<HTMLImageElement | null>(null)
  const configRef = useRef(config)
  const pausedRef = useRef(paused)
  const visibleRef = useRef(true)
  configRef.current = config
  pausedRef.current = paused

  // Load the source photo.
  useEffect(() => {
    imgRef.current = null
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      imgRef.current = img
    }
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  // Load the optional reveal mask.
  useEffect(() => {
    maskRef.current = null
    const maskUrl = config.mask?.enabled ? config.mask.dataUrl : null
    if (!maskUrl) return
    const m = new Image()
    m.src = maskUrl
    m.onload = () => {
      maskRef.current = m
    }
    return () => {
      m.onload = null
    }
  }, [config.mask?.enabled, config.mask?.dataUrl])

  // Pause the (expensive) render loop while the canvas is off-screen.
  useEffect(() => {
    const el = canvasRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((e) => e.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = true
    let cssW = 0
    let cssH = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      cssW = Math.max(1, Math.round(rect.width))
      cssH = Math.max(1, Math.round(rect.height))
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(cssW * dpr))
      canvas.height = Math.max(1, Math.round(cssH * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const loop = (time: number) => {
      if (!running) return
      const img = imgRef.current
      if (img && img.complete && img.naturalWidth > 0) {
        if (!pausedRef.current && visibleRef.current) {
          renderAsciiFrame(
            ctx,
            img,
            configRef.current,
            time / 1000,
            cssW,
            cssH,
            maskRef.current,
          )
        }
      } else {
        // Nothing loaded yet — keep the canvas transparent.
        ctx.clearRect(0, 0, cssW, cssH)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={alt ?? 'ASCII art'}
    />
  )
}
