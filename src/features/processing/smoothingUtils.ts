/**
 * Landmark Smoothing Utilities
 * 
 * Functions for reducing noise in pose landmark data using
 * moving average and other smoothing techniques.
 */

import { NormalizedLandmark, PoseFrame } from '@/features/pose'

// ==========================================
// TYPES
// ==========================================

export interface SmoothingConfig {
  /** Window size for moving average (must be odd number) */
  windowSize: number
  /** Whether to preserve edge frames exactly */
  preserveEdges: boolean
  /** Minimum visibility to include in smoothing */
  minVisibility: number
  /** Whether to smooth visibility values too */
  smoothVisibility: boolean
}

// ==========================================
// DEFAULT CONFIG
// ==========================================

const DEFAULT_SMOOTHING_CONFIG: SmoothingConfig = {
  windowSize: 5,
  preserveEdges: true,
  minVisibility: 0.3,
  smoothVisibility: false,
}

// ==========================================
// MOVING AVERAGE
// ==========================================

/**
 * Apply moving average to a single numeric array
 * 
 * How moving average works:
 * For each value, take the average of surrounding values within window
 * 
 * Example with window=3:
 * Input:  [10, 12, 11, 15, 13]
 * 
 * Position 0: (10 + 12) / 2 = 11 (only right neighbor available)
 * Position 1: (10 + 12 + 11) / 3 = 11
 * Position 2: (12 + 11 + 15) / 3 = 12.67
 * Position 3: (11 + 15 + 13) / 3 = 13
 * Position 4: (15 + 13) / 2 = 14 (only left neighbor available)
 * 
 * Output: [11, 11, 12.67, 13, 14]
 */
export function movingAverage(
  values: number[],
  windowSize: number = 5,
  preserveEdges: boolean = true
): number[] {
  if (values.length === 0) return []
  if (values.length === 1) return [...values]
  if (windowSize <= 1) return [...values]

  // Ensure window size is odd for symmetric smoothing
  const effectiveWindow = windowSize % 2 === 0 ? windowSize + 1 : windowSize
  const halfWindow = Math.floor(effectiveWindow / 2)

  const smoothed: number[] = new Array(values.length)

  for (let i = 0; i < values.length; i++) {
    // Calculate window bounds
    const start = Math.max(0, i - halfWindow)
    const end = Math.min(values.length - 1, i + halfWindow)

    // Preserve edges if configured
    if (preserveEdges && (i < halfWindow || i >= values.length - halfWindow)) {
      smoothed[i] = values[i]
      continue
    }

    // Calculate average within window
    let sum = 0
    let count = 0

    for (let j = start; j <= end; j++) {
      const value = values[j]
      // Skip NaN or undefined values
      if (!isNaN(value) && value !== undefined) {
        sum += value
        count++
      }
    }

    smoothed[i] = count > 0 ? sum / count : values[i]
  }

  return smoothed
}

/**
 * Apply weighted moving average (center has more weight)
 * Uses Gaussian-like weighting
 */
export function weightedMovingAverage(
  values: number[],
  windowSize: number = 5
): number[] {
  if (values.length === 0) return []
  if (values.length === 1) return [...values]
  if (windowSize <= 1) return [...values]

  const effectiveWindow = windowSize % 2 === 0 ? windowSize + 1 : windowSize
  const halfWindow = Math.floor(effectiveWindow / 2)

  // Generate Gaussian-like weights
  const weights: number[] = []
  for (let i = -halfWindow; i <= halfWindow; i++) {
    // Simple triangle weights (can be replaced with actual Gaussian)
    weights.push(halfWindow + 1 - Math.abs(i))
  }
  const weightSum = weights.reduce((a, b) => a + b, 0)

  const smoothed: number[] = new Array(values.length)

  for (let i = 0; i < values.length; i++) {
    let sum = 0
    let totalWeight = 0

    for (let j = -halfWindow; j <= halfWindow; j++) {
      const idx = i + j
      if (idx >= 0 && idx < values.length) {
        const weight = weights[j + halfWindow]
        const value = values[idx]
        if (!isNaN(value) && value !== undefined) {
          sum += value * weight
          totalWeight += weight
        }
      }
    }

    smoothed[i] = totalWeight > 0 ? sum / totalWeight : values[i]
  }

  return smoothed
}

// ==========================================
// LANDMARK SMOOTHING
// ==========================================

/**
 * Extract a specific coordinate from all frames for a specific landmark
 */
function extractCoordinateTimeSeries(
  frames: PoseFrame[],
  landmarkIndex: number,
  coordinate: 'x' | 'y' | 'z'
): number[] {
  return frames.map((frame) => {
    const landmark = frame.landmarks[landmarkIndex]
    if (!landmark) return 0
    return landmark[coordinate]
  })
}

/**
 * Extract visibility time series for a specific landmark
 */
function extractVisibilityTimeSeries(
  frames: PoseFrame[],
  landmarkIndex: number
): number[] {
  return frames.map((frame) => {
    const landmark = frame.landmarks[landmarkIndex]
    return landmark?.visibility ?? 0
  })
}

/**
 * Smooth a single landmark across all frames
 */
function smoothSingleLandmark(
  frames: PoseFrame[],
  landmarkIndex: number,
  config: SmoothingConfig
): NormalizedLandmark[] {
  // Extract time series for each coordinate
  const xValues = extractCoordinateTimeSeries(frames, landmarkIndex, 'x')
  const yValues = extractCoordinateTimeSeries(frames, landmarkIndex, 'y')
  const zValues = extractCoordinateTimeSeries(frames, landmarkIndex, 'z')
  const visValues = extractVisibilityTimeSeries(frames, landmarkIndex)

  // Apply smoothing
  const smoothedX = movingAverage(xValues, config.windowSize, config.preserveEdges)
  const smoothedY = movingAverage(yValues, config.windowSize, config.preserveEdges)
  const smoothedZ = movingAverage(zValues, config.windowSize, config.preserveEdges)
  const smoothedVis = config.smoothVisibility
    ? movingAverage(visValues, config.windowSize, config.preserveEdges)
    : visValues

  // Reconstruct landmarks
  return frames.map((_, frameIndex) => ({
    x: smoothedX[frameIndex],
    y: smoothedY[frameIndex],
    z: smoothedZ[frameIndex],
    visibility: smoothedVis[frameIndex],
  }))
}

/**
 * Smooth all landmarks across all frames
 * Returns new array without modifying original
 */
export function smoothLandmarkFrames(
  frames: PoseFrame[],
  config: Partial<SmoothingConfig> = {}
): PoseFrame[] {
  const fullConfig = { ...DEFAULT_SMOOTHING_CONFIG, ...config }

  if (frames.length < fullConfig.windowSize) {
    console.warn('[smoothingUtils] Not enough frames for smoothing, returning original')
    return frames.map((frame) => ({
      ...frame,
      landmarks: [...frame.landmarks],
    }))
  }

  const numLandmarks = frames[0]?.landmarks?.length ?? 0
  if (numLandmarks === 0) {
    console.warn('[smoothingUtils] No landmarks in frames')
    return frames
  }

  // Smooth each landmark independently
  const smoothedLandmarksByIndex: NormalizedLandmark[][] = []
  
  for (let landmarkIdx = 0; landmarkIdx < numLandmarks; landmarkIdx++) {
    smoothedLandmarksByIndex.push(
      smoothSingleLandmark(frames, landmarkIdx, fullConfig)
    )
  }

  // Reconstruct frames with smoothed landmarks
  const smoothedFrames: PoseFrame[] = frames.map((frame, frameIndex) => ({
    frameNumber: frame.frameNumber,
    timestamp: frame.timestamp,
    confidence: frame.confidence,
    landmarks: smoothedLandmarksByIndex.map(
      (landmarkTimeSeries) => landmarkTimeSeries[frameIndex]
    ),
  }))

  console.log('[smoothingUtils] Smoothed', frames.length, 'frames with window size', fullConfig.windowSize)

  return smoothedFrames
}

// ==========================================
// VELOCITY SMOOTHING
// ==========================================

/**
 * Calculate smoothed velocity for a coordinate time series
 * Velocity = change in position over time
 */
export function calculateSmoothedVelocity(
  positions: number[],
  fps: number,
  smoothingWindow: number = 3
): number[] {
  if (positions.length < 2) return []

  const dt = 1 / fps
  const velocities: number[] = []

  // Calculate raw velocities using central difference where possible
  for (let i = 0; i < positions.length; i++) {
    if (i === 0) {
      // Forward difference at start
      velocities.push((positions[1] - positions[0]) / dt)
    } else if (i === positions.length - 1) {
      // Backward difference at end
      velocities.push((positions[i] - positions[i - 1]) / dt)
    } else {
      // Central difference in middle
      velocities.push((positions[i + 1] - positions[i - 1]) / (2 * dt))
    }
  }

  // Smooth the velocities
  return movingAverage(velocities, smoothingWindow, false)
}

/**
 * Calculate acceleration from velocity
 */
export function calculateAcceleration(
  velocities: number[],
  fps: number
): number[] {
  if (velocities.length < 2) return []

  const dt = 1 / fps
  const accelerations: number[] = []

  for (let i = 0; i < velocities.length; i++) {
    if (i === 0) {
      accelerations.push((velocities[1] - velocities[0]) / dt)
    } else if (i === velocities.length - 1) {
      accelerations.push((velocities[i] - velocities[i - 1]) / dt)
    } else {
      accelerations.push((velocities[i + 1] - velocities[i - 1]) / (2 * dt))
    }
  }

  return accelerations
}

// ==========================================
// EXPORTS
// ==========================================

export {
  DEFAULT_SMOOTHING_CONFIG,
  extractCoordinateTimeSeries,
  extractVisibilityTimeSeries,
}