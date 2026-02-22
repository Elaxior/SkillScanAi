/**
 * Metrics Types for SkillScan AI
 * 
 * These types define the structure of AI analysis output.
 * Strong typing here ensures UI components receive consistent data.
 */

// ==========================================
// POSE LANDMARKS
// ==========================================

/**
 * Single pose landmark point
 * Coordinates are normalized (0-1) relative to image dimensions
 */
export interface LandmarkPoint {
  /** X coordinate (0-1) */
  x: number
  /** Y coordinate (0-1) */
  y: number
  /** Z coordinate (depth, 0-1) - may not be available */
  z?: number
  /** Visibility/confidence score (0-1) */
  visibility: number
  /** Landmark name (e.g., 'left_shoulder') */
  name?: string
}

/**
 * Full body pose for a single frame
 */
export interface Landmark {
  /** Frame number */
  frame: number
  /** Timestamp in video (seconds) */
  timestamp: number
  /** All detected landmark points */
  points: LandmarkPoint[]
  /** Overall pose confidence */
  confidence: number
}

// ==========================================
// PERFORMANCE METRICS
// ==========================================

/**
 * Collection of metric values
 * Keys are metric names, values are scores (typically 0-100)
 */
export type Metrics = Record<string, number | null>

/**
 * Detailed metric with metadata
 */
export interface MetricDetail {
  /** Metric identifier */
  id: string
  /** Display name */
  name: string
  /** Current value (0-100) */
  value: number
  /** Target/optimal value */
  target?: number
  /** Unit of measurement */
  unit?: string
  /** Category grouping */
  category: MetricCategory
  /** Trend compared to previous sessions */
  trend?: 'up' | 'down' | 'stable'
  /** Detailed description */
  description?: string
}

/**
 * Metric display metadata
 * Describes how a metric should be named, measured, and interpreted.
 * Enables UI components to render metrics without sport-specific logic
 * and prepares the scoring engine for flaw detection and comparison.
 */
export interface MetricMetadata {
  /** Display name */
  name: string
  /** Unit of measurement */
  unit: string
  /** Ideal range [min, max] */
  idealRange?: [number, number]
  /** Description of what this metric measures */
  description: string
  /** Higher is better, lower is better, or target a range? */
  direction: 'higher' | 'lower' | 'range'
}

/**
 * Metric categories for grouping
 */
export enum MetricCategory {
  FORM = 'form',
  POWER = 'power',
  TIMING = 'timing',
  BALANCE = 'balance',
  CONSISTENCY = 'consistency',
  SPEED = 'speed',
  ACCURACY = 'accuracy',
}

// ==========================================
// TECHNIQUE FLAWS
// ==========================================

/**
 * Severity levels for technique flaws
 */
export enum FlawSeverity {
  /** Minor issue, slight improvement possible */
  LOW = 'low',
  /** Noticeable issue, should address */
  MEDIUM = 'medium',
  /** Significant issue, priority fix */
  HIGH = 'high',
  /** Critical issue, may cause injury or major performance loss */
  CRITICAL = 'critical',
}

/**
 * Detected technique flaw
 */
export interface Flaw {
  /** Flaw identifier */
  id: string
  /** Short title */
  title: string
  /** Detailed description */
  description: string
  /** How severe the flaw is */
  severity: FlawSeverity
  /** Body part(s) involved */
  bodyParts: string[]
  /** Frame range where flaw occurs */
  frameRange?: [number, number]
  /** Timestamp range in video (seconds) */
  timeRange?: [number, number]
  /** Suggested correction */
  correction: string
  /** Drill/exercise to fix this */
  drill?: string
  /** Confidence of detection (0-1) */
  confidence: number
}

// ==========================================
// COMPARISON DATA
// ==========================================

/**
 * Comparison between user and professional
 */
export interface Comparison {
  /** Metric being compared */
  metricId: string
  /** User's value */
  userValue: number
  /** Professional's value */
  proValue: number
  /** Difference (user - pro) */
  difference: number
  /** Percentage difference */
  percentageDiff: number
}

// ==========================================
// ANALYSIS RESULT
// ==========================================

/**
 * Complete analysis result from AI
 */
export interface AnalysisResult {
  /** Session ID this belongs to */
  sessionId: string
  /** Overall score (0-100) */
  overallScore: number
  /** Score breakdown by category */
  categoryScores: Record<MetricCategory, number>
  /** All detected metrics */
  metrics: MetricDetail[]
  /** All detected flaws */
  flaws: Flaw[]
  /** Comparisons to professional data */
  comparisons: Comparison[]
  /** Frame-by-frame landmarks */
  landmarks: Landmark[]
  /** Analysis timestamp */
  analyzedAt: number
  /** Model version used */
  modelVersion: string
}

// ==========================================
// SCORE HELPERS
// ==========================================

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): 'danger' | 'warning' | 'success' {
  if (score < 50) return 'danger'
  if (score < 75) return 'warning'
  return 'success'
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 50) return 'Needs Work'
  return 'Poor'
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: FlawSeverity): 'warning' | 'danger' {
  switch (severity) {
    case FlawSeverity.CRITICAL:
    case FlawSeverity.HIGH:
      return 'danger'
    default:
      return 'warning'
  }
}