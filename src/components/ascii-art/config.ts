/**
 * "dd" ASCII-art effect — config schema, defaults and option lists.
 *
 * The schema mirrors the 21st.dev "dd" ASCII-art recipe so the two are
 * drop-in compatible: same keys, same ranges (0-100 etc.), same semantics.
 */

export interface AsciiTonePoint {
  x: number
  y: number
}

export interface AsciiPfxSetting {
  enabled: boolean
  intensity: number
}

export interface AsciiLightPoint {
  x: number // normalized 0..1
  y: number // normalized 0..1
  radius: number
  intensity: number
}

export interface AsciiMaskShape {
  type: string
  points: number[][]
  color?: string
  size?: number
}

export interface AsciiMaskConfig {
  enabled: boolean
  tool: string
  brushSize: number
  showOverlay: boolean
  invert: boolean
  dataUrl: string | null
  shapes: AsciiMaskShape[]
}

export interface AsciiArtConfig {
  renderMode: string
  bgMode: string
  bgBlur: number
  bgOpacity: number
  cellSize: number
  coverage: number
  invert: boolean
  styleBlend: string
  charSet: string
  customChars: string
  brightness: number
  contrast: number
  edgeEmphasis: number
  density: number
  toneCurve: AsciiTonePoint[]
  tint: string
  tintOpacity: number
  overlayBlend: string
  saturation: number
  grayscale: number
  blurType: string
  blurAmount: number
  blurAngle: number
  directionalBothSides: boolean
  tiltFocus: number
  tiltPosition: number
  tiltFeather: number
  lensFocus: number
  blurCenterX: number
  blurCenterY: number
  progressivePosition: number
  progressiveReverse: boolean
  pfx: Record<string, AsciiPfxSetting>
  animated: boolean
  animStyle: string
  animSpeed: { enabled: boolean; intensity: number }
  animIntensity: { enabled: boolean; intensity: number }
  lights: { enabled: boolean; points: AsciiLightPoint[] }
  mask: AsciiMaskConfig
}

/** The exact parameter set from the 21st.dev recipe. */
export const DEFAULT_ASCII_CONFIG: AsciiArtConfig = {
  renderMode: 'characters',
  bgMode: 'blur',
  bgBlur: 0,
  bgOpacity: 92,
  cellSize: 13,
  coverage: 100,
  invert: false,
  styleBlend: 'source-over',
  charSet: 'standard',
  customChars: '',
  brightness: 0,
  contrast: 115,
  edgeEmphasis: 0,
  density: 0,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  tint: '#d8b46a',
  tintOpacity: 38,
  overlayBlend: 'soft-light',
  saturation: 100,
  grayscale: 28,
  blurType: 'off',
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: {
    vignette: { enabled: true, intensity: 55 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: true, intensity: 45 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: 'ripple',
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] },
  mask: {
    enabled: false,
    tool: 'freehand',
    brushSize: 30,
    showOverlay: false,
    invert: false,
    dataUrl: null,
    shapes: [],
  },
}

export const RENDER_MODES = [
  'characters',
  'dither',
  'mosaic',
  'pixel',
  'dots',
  'cross',
  'diamond',
  'voxel',
  'lego',
  'mixed',
  'lines',
  'diagonal',
  'braille',
  'hexdump',
  'matrix',
  'rings',
  'hearts',
  'stars',
  'hexagons',
  'triangles',
  'bubbles',
  'hatch',
  'contour',
  'halfblocks',
] as const

export const BG_MODES = [
  { value: 'blur', label: 'Blurred photo' },
  { value: 'original', label: 'Original photo' },
  { value: 'solid', label: 'Solid color' },
  { value: 'none', label: 'None / transparent' },
] as const

export const CHAR_SETS = [
  { value: 'standard', label: 'Standard' },
  { value: 'block', label: 'Blocks' },
  { value: 'binary', label: 'Binary' },
  { value: 'hex', label: 'Hex' },
  { value: 'braille', label: 'Braille' },
  { value: 'ascii', label: 'ASCII (full)' },
  { value: 'custom', label: 'Custom' },
] as const

export const BLEND_MODES = [
  'source-over',
  'multiply',
  'screen',
  'overlay',
  'soft-light',
  'hard-light',
  'color-dodge',
  'color-burn',
] as const

export const OVERLAY_BLENDS = [
  'soft-light',
  'overlay',
  'multiply',
  'screen',
  'hard-light',
  'color-dodge',
] as const

export const BLUR_TYPES = [
  { value: 'off', label: 'Off' },
  { value: 'gaussian', label: 'Gaussian' },
  { value: 'motion', label: 'Motion' },
  { value: 'tilt', label: 'Tilt-shift' },
  { value: 'lens', label: 'Lens' },
  { value: 'progressive', label: 'Progressive' },
] as const

export const ANIM_STYLES = [
  'wave',
  'pulse',
  'shimmer',
  'ripple',
  'flicker',
] as const
