/**
 * Flaw Detection Type Definitions
 * 
 * These types define the structure of detected technique flaws,
 * injury risks, and improvement suggestions.
 * 
 * Why structured flaw objects?
 * 
 * 1. UI SCALING: Components render flaws generically without sport-specific logic
 * 2. LOCALIZATION: id-based lookup enables translation of title/description
 * 3. ANALYTICS: Track which flaws are most common across users
 * 4. EXTENSIBILITY: Add new fields (drills, video refs) without breaking changes
 * 5. TESTING: Each flaw can be unit tested independently
 */

/**
 * Severity levels for detected flaws
 * 
 * LOW: Minor issue, doesn't significantly impact performance
 * MEDIUM: Notable issue, should be addressed for improvement
 * HIGH: Critical issue, significantly impacts performance or safety
 */
export type FlawSeverity = 'low' | 'medium' | 'high';

/**
 * Body parts that can be involved in a flaw
 * Used for highlighting in skeleton overlay and targeted coaching
 */
export type BodyPart =
  | 'wrist'
  | 'elbow'
  | 'shoulder'
  | 'hip'
  | 'knee'
  | 'ankle'
  | 'torso'
  | 'head'
  | 'full_body';

/**
 * Category of flaw for grouping and filtering
 */
export type FlawCategory =
  | 'form'           // Technique form issues
  | 'power'          // Power generation issues
  | 'balance'        // Balance and stability issues
  | 'timing'         // Timing and coordination issues
  | 'injury_risk';   // Potential injury risks

/**
 * Detected flaw with full context
 * 
 * This is the primary output of the flaw detection engine.
 * Each flaw contains all information needed for display and coaching.
 */
export interface DetectedFlaw {
  /**
   * Unique identifier for this flaw type
   * Format: sport_action_issue (e.g., 'basketball_jumpshot_low_release')
   * Used for: Analytics, localization lookups, deduplication
   */
  id: string;

  /**
   * Human-readable title
   * Short and descriptive (max 40 chars recommended)
   */
  title: string;

  /**
   * Detailed description of the flaw
   * Explains what was detected and why it matters
   */
  description: string;

  /**
   * Severity level
   * Determines visual styling and prioritization
   */
  severity: FlawSeverity;

  /**
   * Category for grouping
   */
  category: FlawCategory;

  /**
   * Whether this flaw poses injury risk
   * 
   * When true, the flaw should be:
   * - Highlighted with warning styling
   * - Prioritized in the flaw list
   * - Accompanied by safety information
   */
  injuryRisk: boolean;

  /**
   * Specific injury risks if applicable
   */
  injuryDetails?: string;

  /**
   * Body parts affected by this flaw
   * Used for skeleton overlay highlighting
   */
  affectedBodyParts: BodyPart[];

  /**
   * The actual metric value that triggered this flaw
   */
  actualValue?: number;

  /**
   * The threshold that was violated
   */
  threshold?: number;

  /**
   * The ideal/target range for this metric
   */
  idealRange?: string;

  /**
   * Coaching tip for correction
   * Actionable advice the user can apply
   */
  correction: string;

  /**
   * YouTube video URL for technique fix
   * 
   * Why include this?
   * - Visual learning is highly effective for motor skills
   * - Users can self-correct without a coach
   * - Increases engagement and app value
   * - Educational content builds trust
   */
  youtubeUrl?: string;

  /**
   * YouTube video title for accessibility
   */
  youtubeTitle?: string;

  /**
   * Optional drill recommendation
   */
  drill?: {
    name: string;
    description: string;
    duration: string;
  };

  /**
   * Confidence in this detection (0-1)
   * Based on metric validity and clarity of violation
   */
  confidence: number;

  /**
   * Frame index where flaw is most visible (if applicable)
   */
  keyFrame?: number;
}

/**
 * Input for flaw detection functions
 */
export interface FlawDetectionInput {
  /** Calculated metrics */
  metrics: Record<string, number | null>;
  /** Score breakdown for context */
  scoreBreakdown?: Record<string, number>;
  /** Keyframes for temporal context */
  keyframes?: {
    peakJump: number | null;
    release: number | null;
    start: number | null;
    end: number | null;
  };
  /** Action being analyzed */
  action: string;
}

/**
 * Result of flaw detection
 */
export interface FlawDetectionResult {
  /** Array of detected flaws */
  flaws: DetectedFlaw[];
  /** Number of potential flaws checked */
  rulesEvaluated: number;
  /** Overall injury risk level */
  overallInjuryRisk: 'none' | 'low' | 'moderate' | 'high';
  /** Summary message */
  summary: string;
}

/**
 * Flaw detection function signature
 */
export type FlawDetectionFunction = (input: FlawDetectionInput) => FlawDetectionResult;

/**
 * Flaw rule definition (internal use)
 */
export interface FlawRule {
  /** Rule ID matching flaw ID */
  id: string;
  /** Metric key to evaluate */
  metricKey: string;
  /** Condition type */
  condition: 'lessThan' | 'greaterThan' | 'outside';
  /** Threshold value(s) */
  threshold: number | [number, number];
  /** Flaw template if condition is met */
  flaw: Omit<DetectedFlaw, 'actualValue' | 'threshold' | 'confidence'>;
}