/**
 * Canvas Drawing Utilities for Pose Visualization
 * 
 * Pure functions for drawing landmarks and skeleton connections.
 * Separated from components for testability and reusability.
 */

import { NormalizedLandmark, LandmarkIndex } from './types'

// ==========================================
// TYPES
// ==========================================

export interface DrawingOptions {
  /** Color for landmarks */
  landmarkColor?: string
  /** Color for connections */
  connectionColor?: string
  /** Radius of landmark circles */
  landmarkRadius?: number
  /** Width of connection lines */
  connectionWidth?: number
  /** Enable glow effect */
  enableGlow?: boolean
  /** Glow color */
  glowColor?: string
  /** Glow blur amount */
  glowBlur?: number
  /** Minimum visibility to draw landmark */
  minVisibility?: number
  /** Draw only key landmarks (not face details) */
  keyLandmarksOnly?: boolean
}

export interface Point {
  x: number
  y: number
  visibility?: number
}

// ==========================================
// DEFAULT OPTIONS
// ==========================================

const DEFAULT_OPTIONS: Required<DrawingOptions> = {
  landmarkColor: '#00FF00',
  connectionColor: '#00FF00',
  landmarkRadius: 5,
  connectionWidth: 2,
  enableGlow: true,
  glowColor: '#00FF00',
  glowBlur: 10,
  minVisibility: 0.5,
  keyLandmarksOnly: false,
}

// ==========================================
// POSE CONNECTIONS
// ==========================================

/**
 * MediaPipe Pose landmark connections
 * Each tuple represents [startIndex, endIndex]
 */
export const POSE_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  // Face (optional - can skip for cleaner look)
  [LandmarkIndex.NOSE, LandmarkIndex.LEFT_EYE_INNER],
  [LandmarkIndex.LEFT_EYE_INNER, LandmarkIndex.LEFT_EYE],
  [LandmarkIndex.LEFT_EYE, LandmarkIndex.LEFT_EYE_OUTER],
  [LandmarkIndex.LEFT_EYE_OUTER, LandmarkIndex.LEFT_EAR],
  [LandmarkIndex.NOSE, LandmarkIndex.RIGHT_EYE_INNER],
  [LandmarkIndex.RIGHT_EYE_INNER, LandmarkIndex.RIGHT_EYE],
  [LandmarkIndex.RIGHT_EYE, LandmarkIndex.RIGHT_EYE_OUTER],
  [LandmarkIndex.RIGHT_EYE_OUTER, LandmarkIndex.RIGHT_EAR],
  [LandmarkIndex.MOUTH_LEFT, LandmarkIndex.MOUTH_RIGHT],

  // Torso
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.RIGHT_SHOULDER],
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_HIP],
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_HIP],
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.RIGHT_HIP],

  // Left arm
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_ELBOW],
  [LandmarkIndex.LEFT_ELBOW, LandmarkIndex.LEFT_WRIST],
  [LandmarkIndex.LEFT_WRIST, LandmarkIndex.LEFT_PINKY],
  [LandmarkIndex.LEFT_WRIST, LandmarkIndex.LEFT_INDEX],
  [LandmarkIndex.LEFT_WRIST, LandmarkIndex.LEFT_THUMB],
  [LandmarkIndex.LEFT_PINKY, LandmarkIndex.LEFT_INDEX],

  // Right arm
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_ELBOW],
  [LandmarkIndex.RIGHT_ELBOW, LandmarkIndex.RIGHT_WRIST],
  [LandmarkIndex.RIGHT_WRIST, LandmarkIndex.RIGHT_PINKY],
  [LandmarkIndex.RIGHT_WRIST, LandmarkIndex.RIGHT_INDEX],
  [LandmarkIndex.RIGHT_WRIST, LandmarkIndex.RIGHT_THUMB],
  [LandmarkIndex.RIGHT_PINKY, LandmarkIndex.RIGHT_INDEX],

  // Left leg
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.LEFT_KNEE],
  [LandmarkIndex.LEFT_KNEE, LandmarkIndex.LEFT_ANKLE],
  [LandmarkIndex.LEFT_ANKLE, LandmarkIndex.LEFT_HEEL],
  [LandmarkIndex.LEFT_HEEL, LandmarkIndex.LEFT_FOOT_INDEX],
  [LandmarkIndex.LEFT_ANKLE, LandmarkIndex.LEFT_FOOT_INDEX],

  // Right leg
  [LandmarkIndex.RIGHT_HIP, LandmarkIndex.RIGHT_KNEE],
  [LandmarkIndex.RIGHT_KNEE, LandmarkIndex.RIGHT_ANKLE],
  [LandmarkIndex.RIGHT_ANKLE, LandmarkIndex.RIGHT_HEEL],
  [LandmarkIndex.RIGHT_HEEL, LandmarkIndex.RIGHT_FOOT_INDEX],
  [LandmarkIndex.RIGHT_ANKLE, LandmarkIndex.RIGHT_FOOT_INDEX],
]

/**
 * Key body connections (no face details)
 * For cleaner visualization
 */
export const KEY_POSE_CONNECTIONS: [LandmarkIndex, LandmarkIndex][] = [
  // Torso
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.RIGHT_SHOULDER],
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_HIP],
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_HIP],
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.RIGHT_HIP],

  // Left arm
  [LandmarkIndex.LEFT_SHOULDER, LandmarkIndex.LEFT_ELBOW],
  [LandmarkIndex.LEFT_ELBOW, LandmarkIndex.LEFT_WRIST],

  // Right arm
  [LandmarkIndex.RIGHT_SHOULDER, LandmarkIndex.RIGHT_ELBOW],
  [LandmarkIndex.RIGHT_ELBOW, LandmarkIndex.RIGHT_WRIST],

  // Left leg
  [LandmarkIndex.LEFT_HIP, LandmarkIndex.LEFT_KNEE],
  [LandmarkIndex.LEFT_KNEE, LandmarkIndex.LEFT_ANKLE],

  // Right leg
  [LandmarkIndex.RIGHT_HIP, LandmarkIndex.RIGHT_KNEE],
  [LandmarkIndex.RIGHT_KNEE, LandmarkIndex.RIGHT_ANKLE],

  // Nose to shoulders (for head orientation)
  [LandmarkIndex.NOSE, LandmarkIndex.LEFT_SHOULDER],
  [LandmarkIndex.NOSE, LandmarkIndex.RIGHT_SHOULDER],
]

/**
 * Key landmark indices for simplified skeleton
 */
export const KEY_LANDMARK_INDICES = [
  LandmarkIndex.NOSE,
  LandmarkIndex.LEFT_SHOULDER,
  LandmarkIndex.RIGHT_SHOULDER,
  LandmarkIndex.LEFT_ELBOW,
  LandmarkIndex.RIGHT_ELBOW,
  LandmarkIndex.LEFT_WRIST,
  LandmarkIndex.RIGHT_WRIST,
  LandmarkIndex.LEFT_HIP,
  LandmarkIndex.RIGHT_HIP,
  LandmarkIndex.LEFT_KNEE,
  LandmarkIndex.RIGHT_KNEE,
  LandmarkIndex.LEFT_ANKLE,
  LandmarkIndex.RIGHT_ANKLE,
]

/**
 * Line widths for different body parts
 */
const CONNECTION_WIDTHS: Partial<Record<string, number>> = {
  // Arms - thicker for emphasis
  [`${LandmarkIndex.LEFT_SHOULDER}-${LandmarkIndex.LEFT_ELBOW}`]: 3,
  [`${LandmarkIndex.LEFT_ELBOW}-${LandmarkIndex.LEFT_WRIST}`]: 3,
  [`${LandmarkIndex.RIGHT_SHOULDER}-${LandmarkIndex.RIGHT_ELBOW}`]: 3,
  [`${LandmarkIndex.RIGHT_ELBOW}-${LandmarkIndex.RIGHT_WRIST}`]: 3,
  
  // Torso - medium
  [`${LandmarkIndex.LEFT_SHOULDER}-${LandmarkIndex.RIGHT_SHOULDER}`]: 2.5,
  [`${LandmarkIndex.LEFT_HIP}-${LandmarkIndex.RIGHT_HIP}`]: 2.5,
}

// ==========================================
// SCALING FUNCTIONS
// ==========================================

/**
 * Scale a normalized landmark point to canvas coordinates
 */
export function scaleLandmark(
  point: NormalizedLandmark,
  width: number,
  height: number
): Point {
  return {
    x: point.x * width,
    y: point.y * height,
    visibility: point.visibility,
  }
}

/**
 * Scale all landmarks to canvas coordinates
 */
export function scaleLandmarks(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): Point[] {
  return landmarks.map((lm) => scaleLandmark(lm, width, height))
}

// ==========================================
// CANVAS UTILITIES
// ==========================================

/**
 * Clear the entire canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

/**
 * Setup glow effect on context
 */
export function setupGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number
): void {
  ctx.shadowColor = color
  ctx.shadowBlur = blur
}

/**
 * Remove glow effect from context
 */
export function clearGlow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

/**
 * Draw a single landmark as a circle
 */
export function drawLandmark(
  ctx: CanvasRenderingContext2D,
  point: Point,
  options: Partial<DrawingOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Skip low visibility points
  if (point.visibility !== undefined && point.visibility < opts.minVisibility) {
    return
  }

  ctx.beginPath()
  ctx.arc(point.x, point.y, opts.landmarkRadius, 0, Math.PI * 2)
  ctx.fillStyle = opts.landmarkColor
  ctx.fill()
}

/**
 * Draw all landmarks as circles
 */
export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: Partial<DrawingOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const scaledLandmarks = scaleLandmarks(landmarks, width, height)

  // Setup glow if enabled
  if (opts.enableGlow) {
    setupGlow(ctx, opts.glowColor, opts.glowBlur)
  }

  // Determine which landmarks to draw
  const indicesToDraw = opts.keyLandmarksOnly
    ? KEY_LANDMARK_INDICES
    : Array.from({ length: landmarks.length }, (_, i) => i)

  // Draw each landmark
  for (const index of indicesToDraw) {
    const point = scaledLandmarks[index]
    if (point) {
      drawLandmark(ctx, point, opts)
    }
  }

  // Clear glow
  if (opts.enableGlow) {
    clearGlow(ctx)
  }
}

/**
 * Draw a single connection line between two landmarks
 */
export function drawConnection(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  options: Partial<DrawingOptions> = {},
  customWidth?: number
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Skip if either point has low visibility
  if (
    (start.visibility !== undefined && start.visibility < opts.minVisibility) ||
    (end.visibility !== undefined && end.visibility < opts.minVisibility)
  ) {
    return
  }

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = opts.connectionColor
  ctx.lineWidth = customWidth ?? opts.connectionWidth
  ctx.lineCap = 'round'
  ctx.stroke()
}

/**
 * Draw all skeleton connections
 */
export function drawConnections(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: Partial<DrawingOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const scaledLandmarks = scaleLandmarks(landmarks, width, height)

  // Setup glow if enabled
  if (opts.enableGlow) {
    setupGlow(ctx, opts.glowColor, opts.glowBlur / 2) // Less glow for lines
  }

  // Choose connection set
  const connections = opts.keyLandmarksOnly
    ? KEY_POSE_CONNECTIONS
    : POSE_CONNECTIONS

  // Draw each connection
  for (const [startIdx, endIdx] of connections) {
    const start = scaledLandmarks[startIdx]
    const end = scaledLandmarks[endIdx]

    if (start && end) {
      // Get custom width for this connection
      const connectionKey = `${startIdx}-${endIdx}`
      const reverseKey = `${endIdx}-${startIdx}`
      const customWidth =
        CONNECTION_WIDTHS[connectionKey] ?? CONNECTION_WIDTHS[reverseKey]

      drawConnection(ctx, start, end, opts, customWidth)
    }
  }

  // Clear glow
  if (opts.enableGlow) {
    clearGlow(ctx)
  }
}

/**
 * Draw complete skeleton (connections + landmarks)
 * Draws connections first, then landmarks on top
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: Partial<DrawingOptions> = {}
): void {
  // Draw connections first (underneath)
  drawConnections(ctx, landmarks, width, height, options)

  // Draw landmarks on top
  drawLandmarks(ctx, landmarks, width, height, options)
}

/**
 * Draw skeleton with different colors for left/right sides
 */
export function drawSkeletonWithSides(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: Partial<DrawingOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const scaledLandmarks = scaleLandmarks(landmarks, width, height)

  // Color scheme
  const leftColor = '#00FFFF'  // Cyan for left side
  const rightColor = '#FF00FF' // Magenta for right side
  const centerColor = '#00FF00' // Green for center

  // Setup glow
  if (opts.enableGlow) {
    setupGlow(ctx, opts.glowColor, opts.glowBlur / 2)
  }

  // Determine which landmarks are left, right, or center
  const isLeftLandmark = (idx: LandmarkIndex) =>
    [1, 2, 3, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31].includes(idx)
  const isRightLandmark = (idx: LandmarkIndex) =>
    [4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].includes(idx)

  // Draw connections
  const connections = opts.keyLandmarksOnly
    ? KEY_POSE_CONNECTIONS
    : POSE_CONNECTIONS

  for (const [startIdx, endIdx] of connections) {
    const start = scaledLandmarks[startIdx]
    const end = scaledLandmarks[endIdx]

    if (!start || !end) continue
    if (start.visibility !== undefined && start.visibility < opts.minVisibility) continue
    if (end.visibility !== undefined && end.visibility < opts.minVisibility) continue

    // Determine color based on landmarks
    let color = centerColor
    if (isLeftLandmark(startIdx) && isLeftLandmark(endIdx)) {
      color = leftColor
    } else if (isRightLandmark(startIdx) && isRightLandmark(endIdx)) {
      color = rightColor
    }

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = color
    ctx.lineWidth = opts.connectionWidth
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  // Draw landmarks
  const indicesToDraw = opts.keyLandmarksOnly
    ? KEY_LANDMARK_INDICES
    : Array.from({ length: landmarks.length }, (_, i) => i)

  for (const index of indicesToDraw) {
    const point = scaledLandmarks[index]
    if (!point) continue
    if (point.visibility !== undefined && point.visibility < opts.minVisibility) continue

    // Determine color
    let color = centerColor
    if (isLeftLandmark(index)) {
      color = leftColor
    } else if (isRightLandmark(index)) {
      color = rightColor
    }

    ctx.beginPath()
    ctx.arc(point.x, point.y, opts.landmarkRadius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  // Clear glow
  if (opts.enableGlow) {
    clearGlow(ctx)
  }
}

// ==========================================
// WHY SEPARATING DRAWING LOGIC HELPS
// ==========================================

/**
 * Benefits of separated drawing utilities:
 * 
 * 1. TESTABILITY
 *    - Can test drawing functions in isolation
 *    - No React component needed for unit tests
 *    - Easy to verify coordinate calculations
 * 
 * 2. REUSABILITY
 *    - Same functions for live preview and playback
 *    - Can be used in different components
 *    - Easy to create variations (with/without glow, etc.)
 * 
 * 3. MAINTAINABILITY
 *    - Drawing code separate from React lifecycle
 *    - Easy to modify colors, styles without touching components
 *    - Clear separation of concerns
 * 
 * 4. PERFORMANCE
 *    - Functions don't create React overhead
 *    - No closures capturing component state
 *    - Direct canvas manipulation
 * 
 * 5. CUSTOMIZATION
 *    - Options object allows easy style changes
 *    - Different themes for different contexts
 *    - Sport-specific color schemes possible
 */