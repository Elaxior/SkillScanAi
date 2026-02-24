/**
 * Ghost Overlay Type Definitions
 */

import type { NormalizedLandmark } from '@mediapipe/pose';

/**
 * A point in normalized coordinate space (0-1)
 */
export interface NormalizedPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

/**
 * Deviation information for a single joint
 */
export interface JointDeviation {
  /** Landmark index */
  index: number;
  /** Joint name for display */
  name: string;
  /** Euclidean distance from ideal (normalized) */
  distance: number;
  /** Whether deviation exceeds highlight threshold */
  isSignificant: boolean;
  /** User's actual position */
  userPoint: NormalizedPoint;
  /** Ideal position */
  idealPoint: NormalizedPoint;
}

/**
 * Frame-level deviation analysis
 */
export interface FrameDeviation {
  /** Overall average deviation */
  averageDeviation: number;
  /** Maximum single-joint deviation */
  maxDeviation: number;
  /** Joints with significant deviation */
  significantJoints: JointDeviation[];
  /** All joint deviations */
  allJoints: JointDeviation[];
  /** Overall alignment score (0-100) */
  alignmentScore: number;
}

/**
 * Ghost overlay configuration
 */
export interface GhostOverlayConfig {
  /** Whether ghost is enabled */
  enabled: boolean;
  /** Opacity of ghost skeleton (0-1) */
  opacity: number;
  /** Color of ideal skeleton */
  idealColor: string;
  /** Color of deviation highlights */
  deviationColor: string;
  /** Threshold for significant deviation */
  deviationThreshold: number;
  /** Whether to show deviation indicators */
  showDeviationMarkers: boolean;
  /** Whether to show connection lines between user and ideal */
  showConnectionLines: boolean;
}

/**
 * Props for GhostOverlay component
 */
export interface GhostOverlayProps {
  /** User's current frame landmarks */
  userFrame: NormalizedLandmark[];
  /** Ideal pose landmarks */
  idealFrame: NormalizedLandmark[];
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Configuration options */
  config?: Partial<GhostOverlayConfig>;
}