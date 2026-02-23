/**
 * Flaw Detection Module Exports
 */

// Types
export type {
  FlawSeverity,
  BodyPart,
  FlawCategory,
  DetectedFlaw,
  FlawDetectionInput,
  FlawDetectionResult,
  FlawDetectionFunction,
} from './flawTypes';

// Registry
export {
  flawRegistry,
  getFlawDetector,
  detectFlaws,
  isFlawDetectionSupported,
  getSupportedSportsForFlaws,
} from './flawRegistry';

// Basketball
export {
  detectBasketballFlaws,
  hasInjuryRisk,
} from './basketballFlaws';