/**
 * Shared types for the sport-specific metric engine
 * 
 * This module defines the common interfaces that all sport adapters must implement,
 * ensuring consistent data flow and type safety across the entire metric system.
 */

import type { NormalizedLandmark } from '@mediapipe/pose';

/**
 * Keyframe indices detected during video processing
 * Each value represents a frame index or null if not detected
 */
export interface KeyframeData {
  /** Frame index of peak jump height */
  peakJump: number | null;
  /** Frame index of ball/shuttlecock release */
  release: number | null;
  /** Frame index of motion initiation */
  start: number | null;
  /** Frame index of motion completion */
  end: number | null;
}

/**
 * Input data required for metric calculation
 * This is the standardized input format for all sport adapters
 */
export interface MetricCalculationInput {
  /** Array of pose frames, each containing 33 landmarks */
  smoothedFrames: NormalizedLandmark[][];
  /** Detected keyframe indices */
  keyframes: KeyframeData;
  /** Video frames per second */
  fps: number;
  /** Specific action being analyzed (e.g., 'jump_shot', 'spike') */
  action: string;
  /** Optional: User height in centimeters for real-world measurements */
  userHeightCm?: number | null;
}

/**
 * Generic metric result type
 * All sport-specific metrics extend this base type
 */
export type MetricResult = Record<string, number | null>;

/**
 * Sport metric calculator function signature
 * Each sport adapter must export a function matching this signature
 */
export type SportMetricCalculator = (input: MetricCalculationInput) => MetricResult;

/**
 * Registry type mapping sport identifiers to their calculators
 */
export type SportMetricRegistry = Record<string, SportMetricCalculator>;