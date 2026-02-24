/**
 * Results Dashboard Constants
 * 
 * Hardcoded comparison values based on sports science research
 * and analysis of amateur vs professional athletes.
 */

import type { MetricDisplayConfig } from './types';

/**
 * Basketball Jump Shot Metric Configurations
 * 
 * These values represent:
 * - Amateur Average: Typical recreational player
 * - Pro Range: NBA/Professional level
 */
export const BASKETBALL_JUMPSHOT_METRICS: MetricDisplayConfig[] = [
  {
    key: 'releaseAngle',
    label: 'Release Angle',
    unit: '°',
    icon: '📐',
    description: 'Ball trajectory angle at release',
    idealRange: [50, 55],
    amateurAverage: 44,
    proRange: [52, 55],
    format: 'integer',
    higherIsBetter: false, // Optimal is within range
  },
  {
    key: 'elbowAngleAtRelease',
    label: 'Elbow Angle',
    unit: '°',
    icon: '💪',
    description: 'Arm extension at release',
    idealRange: [150, 170],
    amateurAverage: 142,
    proRange: [160, 170],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    key: 'kneeAngleAtPeak',
    label: 'Knee Extension',
    unit: '°',
    icon: '🦵',
    description: 'Leg drive at peak jump',
    idealRange: [160, 180],
    amateurAverage: 145,
    proRange: [170, 180],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    key: 'jumpHeightNormalized',
    label: 'Jump Height',
    unit: '%',
    icon: '⬆️',
    description: 'Vertical displacement',
    idealRange: [8, 15],
    amateurAverage: 6,
    proRange: [12, 18],
    format: 'percentage',
    higherIsBetter: true,
  },
  {
    key: 'stabilityIndex',
    label: 'Stability',
    unit: '/100',
    icon: '⚖️',
    description: 'Balance during shot',
    idealRange: [85, 100],
    amateurAverage: 68,
    proRange: [90, 100],
    format: 'integer',
    higherIsBetter: true,
  },
  {
    key: 'followThroughScore',
    label: 'Follow Through',
    unit: '/100',
    icon: '✋',
    description: 'Shot completion quality',
    idealRange: [80, 100],
    amateurAverage: 55,
    proRange: [85, 100],
    format: 'integer',
    higherIsBetter: true,
  },
];

// ============================================================================
// Volleyball Metrics
// ============================================================================

export const VOLLEYBALL_SPIKE_METRICS: MetricDisplayConfig[] = [
  { key: 'elbowAtContact', label: 'Arm Extension', unit: '°', icon: '💪', description: 'Elbow angle at spike contact', idealRange: [155, 177], amateurAverage: 138, proRange: [162, 177], format: 'integer', higherIsBetter: true },
  { key: 'contactHeight', label: 'Contact Height', unit: '%', icon: '⬆️', description: 'Wrist height as % of body height', idealRange: [85, 115], amateurAverage: 75, proRange: [95, 115], format: 'integer', higherIsBetter: true },
  { key: 'armSwingScore', label: 'Arm Swing', unit: '/100', icon: '🔄', description: 'Arm swing speed & efficiency', idealRange: [65, 100], amateurAverage: 48, proRange: [75, 100], format: 'integer', higherIsBetter: true },
  { key: 'jumpHeight', label: 'Jump Height', unit: '%', icon: '🦘', description: 'Vertical displacement', idealRange: [7, 20], amateurAverage: 5, proRange: [12, 22], format: 'percentage', higherIsBetter: true },
  { key: 'trunkRotation', label: 'Trunk Rotation', unit: '°', icon: '🔃', description: 'Hip-shoulder separation angle', idealRange: [25, 60], amateurAverage: 15, proRange: [35, 60], format: 'integer', higherIsBetter: false },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Postural alignment score', idealRange: [70, 100], amateurAverage: 58, proRange: [80, 100], format: 'integer', higherIsBetter: true },
  { key: 'stability', label: 'Stability', unit: '/100', icon: '🏋️', description: 'Base stability during movement', idealRange: [75, 100], amateurAverage: 60, proRange: [85, 100], format: 'integer', higherIsBetter: true },
];

export const VOLLEYBALL_SERVE_METRICS: MetricDisplayConfig[] = [
  { key: 'elbowAtContact', label: 'Arm Extension', unit: '°', icon: '💪', description: 'Elbow angle at serve contact', idealRange: [155, 177], amateurAverage: 135, proRange: [160, 177], format: 'integer', higherIsBetter: true },
  { key: 'contactHeight', label: 'Contact Height', unit: '%', icon: '⬆️', description: 'Contact height as % of body height', idealRange: [78, 110], amateurAverage: 70, proRange: [90, 110], format: 'integer', higherIsBetter: true },
  { key: 'trunkRotation', label: 'Trunk Rotation', unit: '°', icon: '🔃', description: 'Body rotation through serve', idealRange: [20, 55], amateurAverage: 12, proRange: [28, 50], format: 'integer', higherIsBetter: false },
  { key: 'followThrough', label: 'Follow Through', unit: '/100', icon: '✋', description: 'Serve completion quality', idealRange: [70, 100], amateurAverage: 50, proRange: [80, 100], format: 'integer', higherIsBetter: true },
  { key: 'stability', label: 'Stability', unit: '/100', icon: '⚖️', description: 'Stance stability during serve', idealRange: [80, 100], amateurAverage: 65, proRange: [88, 100], format: 'integer', higherIsBetter: true },
];

export const VOLLEYBALL_BLOCK_METRICS: MetricDisplayConfig[] = [
  { key: 'jumpHeight', label: 'Jump Height', unit: '%', icon: '🦘', description: 'Vertical displacement', idealRange: [5, 18], amateurAverage: 3, proRange: [10, 20], format: 'percentage', higherIsBetter: true },
  { key: 'armExtension', label: 'Arm Extension', unit: '°', icon: '💪', description: 'Average elbow angle at block', idealRange: [155, 177], amateurAverage: 138, proRange: [162, 177], format: 'integer', higherIsBetter: true },
  { key: 'handHeight', label: 'Hand Height', unit: '%', icon: '✋', description: 'Wrist height as % of body height', idealRange: [85, 115], amateurAverage: 72, proRange: [95, 115], format: 'integer', higherIsBetter: true },
  { key: 'handSymmetry', label: 'Hand Symmetry', unit: '/100', icon: '🤲', description: 'Equal height of both hands', idealRange: [80, 100], amateurAverage: 60, proRange: [88, 100], format: 'integer', higherIsBetter: true },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Posture while blocking', idealRange: [68, 100], amateurAverage: 55, proRange: [78, 100], format: 'integer', higherIsBetter: true },
];

export const VOLLEYBALL_SET_METRICS: MetricDisplayConfig[] = [
  { key: 'handSymmetry', label: 'Hand Symmetry', unit: '/100', icon: '🤲', description: 'Equal hand contact quality', idealRange: [78, 100], amateurAverage: 58, proRange: [88, 100], format: 'integer', higherIsBetter: true },
  { key: 'elbowAngle', label: 'Elbow Bend', unit: '°', icon: '💪', description: 'Setting arm elbow angle', idealRange: [90, 135], amateurAverage: 75, proRange: [95, 130], format: 'integer', higherIsBetter: false },
  { key: 'contactHeight', label: 'Set Height', unit: '%', icon: '⬆️', description: 'Setting contact height', idealRange: [80, 110], amateurAverage: 68, proRange: [88, 110], format: 'integer', higherIsBetter: true },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Posture while setting', idealRange: [72, 100], amateurAverage: 60, proRange: [80, 100], format: 'integer', higherIsBetter: true },
  { key: 'stability', label: 'Stability', unit: '/100', icon: '🏋️', description: 'Stance stability while setting', idealRange: [75, 100], amateurAverage: 62, proRange: [85, 100], format: 'integer', higherIsBetter: true },
];

// ============================================================================
// Badminton Metrics
// ============================================================================

export const BADMINTON_SMASH_METRICS: MetricDisplayConfig[] = [
  { key: 'elbowAtContact', label: 'Arm Extension', unit: '°', icon: '💪', description: 'Elbow angle at smash contact', idealRange: [155, 177], amateurAverage: 138, proRange: [162, 177], format: 'integer', higherIsBetter: true },
  { key: 'contactHeight', label: 'Contact Height', unit: '%', icon: '⬆️', description: 'Racket contact height', idealRange: [90, 125], amateurAverage: 78, proRange: [100, 125], format: 'integer', higherIsBetter: true },
  { key: 'trunkRotation', label: 'Trunk Rotation', unit: '°', icon: '🔃', description: 'Hip-shoulder rotation', idealRange: [25, 60], amateurAverage: 15, proRange: [32, 58], format: 'integer', higherIsBetter: false },
  { key: 'wristSpeed', label: 'Wrist Speed', unit: '/100', icon: '⚡', description: 'Wrist snap speed score', idealRange: [60, 100], amateurAverage: 42, proRange: [72, 100], format: 'integer', higherIsBetter: true },
  { key: 'followThrough', label: 'Follow Through', unit: '/100', icon: '✋', description: 'Smash completion quality', idealRange: [65, 100], amateurAverage: 48, proRange: [78, 100], format: 'integer', higherIsBetter: true },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Postural alignment', idealRange: [65, 100], amateurAverage: 55, proRange: [75, 100], format: 'integer', higherIsBetter: true },
];

export const BADMINTON_CLEAR_METRICS: MetricDisplayConfig[] = [
  { key: 'elbowAtContact', label: 'Arm Extension', unit: '°', icon: '💪', description: 'Elbow angle at clear contact', idealRange: [152, 177], amateurAverage: 135, proRange: [160, 177], format: 'integer', higherIsBetter: true },
  { key: 'contactHeight', label: 'Contact Height', unit: '%', icon: '⬆️', description: 'Contact height as % of body height', idealRange: [85, 115], amateurAverage: 74, proRange: [95, 115], format: 'integer', higherIsBetter: true },
  { key: 'trunkRotation', label: 'Trunk Rotation', unit: '°', icon: '🔃', description: 'Body rotation through clear', idealRange: [20, 58], amateurAverage: 12, proRange: [28, 55], format: 'integer', higherIsBetter: false },
  { key: 'followThrough', label: 'Follow Through', unit: '/100', icon: '✋', description: 'Clear completion quality', idealRange: [70, 100], amateurAverage: 50, proRange: [80, 100], format: 'integer', higherIsBetter: true },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Posture during clear', idealRange: [65, 100], amateurAverage: 55, proRange: [75, 100], format: 'integer', higherIsBetter: true },
];

export const BADMINTON_DROP_SHOT_METRICS: MetricDisplayConfig[] = [
  { key: 'contactHeight', label: 'Contact Height', unit: '%', icon: '⬆️', description: 'Drop contact height', idealRange: [65, 95], amateurAverage: 55, proRange: [72, 95], format: 'integer', higherIsBetter: false },
  { key: 'elbowAngle', label: 'Elbow Angle', unit: '°', icon: '💪', description: 'Elbow angle for control', idealRange: [120, 160], amateurAverage: 105, proRange: [128, 158], format: 'integer', higherIsBetter: false },
  { key: 'trunkRotation', label: 'Trunk Rotation', unit: '°', icon: '🔃', description: 'Body rotation on drop', idealRange: [12, 45], amateurAverage: 8, proRange: [18, 42], format: 'integer', higherIsBetter: false },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Postural control', idealRange: [68, 100], amateurAverage: 55, proRange: [78, 100], format: 'integer', higherIsBetter: true },
  { key: 'stability', label: 'Stability', unit: '/100', icon: '🏋️', description: 'Balanced stance', idealRange: [72, 100], amateurAverage: 58, proRange: [82, 100], format: 'integer', higherIsBetter: true },
];

export const BADMINTON_SERVE_METRICS: MetricDisplayConfig[] = [
  { key: 'stability', label: 'Stability', unit: '/100', icon: '⚖️', description: 'Stance stability during serve', idealRange: [82, 100], amateurAverage: 65, proRange: [90, 100], format: 'integer', higherIsBetter: true },
  { key: 'elbowAtContact', label: 'Elbow Angle', unit: '°', icon: '💪', description: 'Elbow angle at serve contact', idealRange: [122, 162], amateurAverage: 100, proRange: [130, 160], format: 'integer', higherIsBetter: false },
  { key: 'followThrough', label: 'Follow Through', unit: '/100', icon: '✋', description: 'Serve completion quality', idealRange: [62, 100], amateurAverage: 48, proRange: [75, 100], format: 'integer', higherIsBetter: true },
  { key: 'bodyAlignment', label: 'Body Alignment', unit: '/100', icon: '⚖️', description: 'Posture during serve', idealRange: [72, 100], amateurAverage: 58, proRange: [82, 100], format: 'integer', higherIsBetter: true },
];

// ============================================================================
// Basketball extra actions
// ============================================================================

export const BASKETBALL_LAYUP_METRICS: MetricDisplayConfig[] = [
  { key: 'approachSpeed', label: 'Approach Speed', unit: '/100', icon: '🏃', description: 'Drive speed into layup', idealRange: [60, 100], amateurAverage: 45, proRange: [72, 100], format: 'integer', higherIsBetter: true },
  { key: 'takeoffAngle', label: 'Takeoff Angle', unit: '°', icon: '📐', description: 'Jump angle toward basket', idealRange: [55, 80], amateurAverage: 48, proRange: [60, 78], format: 'integer', higherIsBetter: false },
  { key: 'peakHeight', label: 'Peak Height', unit: '%', icon: '⬆️', description: 'Jump height during layup', idealRange: [6, 18], amateurAverage: 4, proRange: [10, 20], format: 'percentage', higherIsBetter: true },
  { key: 'stabilityIndex', label: 'Body Control', unit: '/100', icon: '⚖️', description: 'Control during approach and finish', idealRange: [70, 100], amateurAverage: 55, proRange: [82, 100], format: 'integer', higherIsBetter: true },
  { key: 'finishHandPosition', label: 'Finish Height', unit: '%', icon: '✋', description: 'Finishing hand height', idealRange: [80, 110], amateurAverage: 68, proRange: [90, 110], format: 'integer', higherIsBetter: true },
];

export const BASKETBALL_DRIBBLING_METRICS: MetricDisplayConfig[] = [
  { key: 'kneeBendScore', label: 'Knee Bend Depth', unit: '/100', icon: '🦵', description: 'How low hips are relative to body height — higher = deeper, better stance', idealRange: [50, 100], amateurAverage: 35, proRange: [65, 100], format: 'integer', higherIsBetter: true },
  { key: 'balanceScore', label: 'Balance', unit: '/100', icon: '⚖️', description: 'Lateral body stability while dribbling', idealRange: [55, 100], amateurAverage: 45, proRange: [75, 100], format: 'integer', higherIsBetter: true },
  { key: 'stanceWidth', label: 'Stance Width', unit: '%', icon: '↔️', description: 'Foot separation relative to shoulder width', idealRange: [70, 180], amateurAverage: 90, proRange: [90, 160], format: 'integer', higherIsBetter: false },
  { key: 'trunkLean', label: 'Body Tilt', unit: '°', icon: '📐', description: 'Lateral trunk tilt angle', idealRange: [0, 20], amateurAverage: 8, proRange: [2, 15], format: 'integer', higherIsBetter: false },
];

/**
 * Get metric configurations by sport/action
 */
export function getMetricConfigs(
  sport: string,
  action: string
): MetricDisplayConfig[] {
  if (sport === 'basketball') {
    if (action === 'jump_shot' || action === 'free_throw') return BASKETBALL_JUMPSHOT_METRICS;
    if (action === 'layup') return BASKETBALL_LAYUP_METRICS;
    if (action === 'dribbling') return BASKETBALL_DRIBBLING_METRICS;
  }

  if (sport === 'volleyball') {
    if (action === 'spike') return VOLLEYBALL_SPIKE_METRICS;
    if (action === 'serve') return VOLLEYBALL_SERVE_METRICS;
    if (action === 'block') return VOLLEYBALL_BLOCK_METRICS;
    if (action === 'set') return VOLLEYBALL_SET_METRICS;
  }

  if (sport === 'badminton') {
    if (action === 'smash') return BADMINTON_SMASH_METRICS;
    if (action === 'clear') return BADMINTON_CLEAR_METRICS;
    if (action === 'drop_shot') return BADMINTON_DROP_SHOT_METRICS;
    if (action === 'serve') return BADMINTON_SERVE_METRICS;
  }

  return [];
}

/**
 * Grade thresholds
 */
export const GRADE_THRESHOLDS = {
  'A+': 97,
  'A': 93,
  'A-': 90,
  'B+': 87,
  'B': 83,
  'B-': 80,
  'C+': 77,
  'C': 73,
  'C-': 70,
  'D+': 67,
  'D': 63,
  'D-': 60,
  'F': 0,
} as const;

/**
 * Performance levels
 */
export const PERFORMANCE_LEVELS = {
  excellent: { min: 90, label: 'Excellent', color: 'text-green-400' },
  good: { min: 80, label: 'Good', color: 'text-emerald-400' },
  average: { min: 70, label: 'Average', color: 'text-yellow-400' },
  belowAverage: { min: 60, label: 'Below Average', color: 'text-orange-400' },
  needsWork: { min: 50, label: 'Needs Improvement', color: 'text-red-400' },
  developing: { min: 0, label: 'Developing', color: 'text-red-500' },
} as const;

/**
 * Get grade from score
 */
export function getGradeFromScore(score: number): string {
  for (const [grade, threshold] of Object.entries(GRADE_THRESHOLDS)) {
    if (score >= threshold) return grade;
  }
  return 'F';
}

/**
 * Get performance level from score
 */
export function getPerformanceLevel(score: number): {
  label: string;
  color: string;
} {
  for (const level of Object.values(PERFORMANCE_LEVELS)) {
    if (score >= level.min) {
      return { label: level.label, color: level.color };
    }
  }
  return { label: 'Developing', color: 'text-red-500' };
}