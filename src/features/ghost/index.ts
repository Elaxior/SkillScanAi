/**
 * Ghost Overlay Module Exports
 */

// Components
export { GhostOverlay } from './GhostOverlay';

// Utilities
export {
  calculatePointDistance,
  calculateJointDeviation,
  calculateFrameDeviation,
  getMajorDeviationJoints,
  getRegionAlignment,
  formatDeviation,
  getDeviationSeverity,
  DEFAULT_DEVIATION_THRESHOLD,
} from './deviationUtils';

// Ideal Poses
export {
  IDEAL_JUMPSHOT_RELEASE,
  IDEAL_FREETHROW_RELEASE,
  JOINT_NAMES,
  KEY_FORM_JOINTS,
  getIdealBasketballPose,
  getIdealPose,
} from './ideaBasketballPose';

// Types
export type {
  NormalizedPoint,
  JointDeviation,
  FrameDeviation,
  GhostOverlayConfig,
  GhostOverlayProps,
} from './types';