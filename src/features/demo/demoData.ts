/**
 * Precomputed Demo Data
 * 
 * This file contains realistic, pre-calculated analysis results
 * that can be used when demo mode is enabled or as a fallback
 * when live processing fails.
 * 
 * All data structures match the real pipeline output exactly,
 * ensuring seamless integration with all UI components.
 */

import type { NormalizedLandmark } from '@mediapipe/pose';
import type { DetectedFlaw } from '@/features/flaws';
import type { SessionKeyframes } from '@/store';
import { Sport } from '@/types';

// ============================================================================
// DEMO VIDEO
// ============================================================================

/**
 * Demo video URL
 * For production, host on CDN or Firebase Storage
 * For development, place in /public folder
 */
export const DEMO_VIDEO_URL = '/demo/basketball-jumpshot.mp4';

/**
 * Demo video metadata
 */
export const DEMO_VIDEO_METADATA = {
  duration: 3.5, // seconds
  fps: 30,
  frameCount: 105,
  width: 720,
  height: 1280,
  sport: Sport.BASKETBALL,
  action: 'jump_shot',
};

// ============================================================================
// DEMO LANDMARKS (Simplified - Key Frames Only)
// ============================================================================

/**
 * Generate a single landmark point
 */
function createLandmark(
  x: number,
  y: number,
  z: number = 0,
  visibility: number = 0.99
): NormalizedLandmark {
  return { x, y, z, visibility };
}

/**
 * Demo release frame landmarks (33 points)
 * Represents ideal jump shot form at release
 */
export const DEMO_RELEASE_FRAME: NormalizedLandmark[] = [
  // Face (0-10)
  createLandmark(0.50, 0.18),    // 0: nose
  createLandmark(0.48, 0.15),    // 1: left_eye_inner
  createLandmark(0.47, 0.15),    // 2: left_eye
  createLandmark(0.46, 0.15),    // 3: left_eye_outer
  createLandmark(0.52, 0.15),    // 4: right_eye_inner
  createLandmark(0.53, 0.15),    // 5: right_eye
  createLandmark(0.54, 0.15),    // 6: right_eye_outer
  createLandmark(0.45, 0.16),    // 7: left_ear
  createLandmark(0.55, 0.16),    // 8: right_ear
  createLandmark(0.49, 0.21),    // 9: mouth_left
  createLandmark(0.51, 0.21),    // 10: mouth_right

  // Upper body (11-22)
  createLandmark(0.42, 0.30),    // 11: left_shoulder
  createLandmark(0.58, 0.30),    // 12: right_shoulder
  createLandmark(0.38, 0.38),    // 13: left_elbow
  createLandmark(0.56, 0.19),    // 14: right_elbow (shooting arm, elevated)
  createLandmark(0.35, 0.42),    // 15: left_wrist
  createLandmark(0.54, 0.09),    // 16: right_wrist (release point)
  createLandmark(0.34, 0.43),    // 17: left_pinky
  createLandmark(0.33, 0.42),    // 18: left_index
  createLandmark(0.33, 0.43),    // 19: left_thumb
  createLandmark(0.53, 0.07),    // 20: right_pinky
  createLandmark(0.55, 0.07),    // 21: right_index
  createLandmark(0.54, 0.08),    // 22: right_thumb

  // Lower body (23-32)
  createLandmark(0.45, 0.52),    // 23: left_hip
  createLandmark(0.55, 0.52),    // 24: right_hip
  createLandmark(0.44, 0.72),    // 25: left_knee
  createLandmark(0.56, 0.72),    // 26: right_knee
  createLandmark(0.43, 0.90),    // 27: left_ankle
  createLandmark(0.57, 0.90),    // 28: right_ankle
  createLandmark(0.42, 0.93),    // 29: left_heel
  createLandmark(0.41, 0.91),    // 30: left_foot_index
  createLandmark(0.58, 0.93),    // 31: right_heel
  createLandmark(0.59, 0.91),    // 32: right_foot_index
];

/**
 * Generate interpolated frames for smooth animation
 * In demo mode, we generate ~100 frames for realistic playback
 */
export function generateDemoLandmarks(frameCount: number = 105): NormalizedLandmark[][] {
  const frames: NormalizedLandmark[][] = [];

  // Generate frames with slight variations for realism
  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount;
    const frame = DEMO_RELEASE_FRAME.map((landmark, idx) => {
      // Add subtle movement based on frame position
      const jumpPhase = Math.sin(progress * Math.PI); // 0 -> 1 -> 0 (jump arc)
      const yOffset = idx >= 23 ? -jumpPhase * 0.05 : -jumpPhase * 0.08; // Upper body moves more

      // Add tiny random noise for realism
      const noise = () => (Math.random() - 0.5) * 0.005;

      return createLandmark(
        landmark.x + noise(),
        landmark.y + yOffset + noise(),
        landmark.z,
        landmark.visibility
      );
    });
    frames.push(frame);
  }

  return frames;
}

// ============================================================================
// DEMO KEYFRAMES
// ============================================================================

/**
 * Demo keyframe indices
 */
export const DEMO_KEYFRAMES: SessionKeyframes = {
  start: 15,      // Frame where motion begins
  peakJump: 55,   // Frame at peak of jump
  release: 60,    // Frame at ball release
  end: 90,        // Frame where motion ends
};

// ============================================================================
// DEMO METRICS
// ============================================================================

/**
 * Demo metrics - Realistic values for a good amateur shooter
 */
export const DEMO_METRICS: Record<string, number | null> = {
  releaseAngle: 52.3,           // Optimal range: 50-55°
  elbowAngleAtRelease: 162.5,   // Optimal range: 150-170°
  kneeAngleAtPeak: 168.2,       // Optimal range: 160-180°
  jumpHeightNormalized: 0.11,   // 11% of body height
  stabilityIndex: 87,           // Out of 100
  followThroughScore: 78,       // Out of 100
  releaseTimingMs: -25,         // 25ms before peak (good timing)
};

// ============================================================================
// DEMO SCORE
// ============================================================================

/**
 * Demo overall score
 */
export const DEMO_SCORE = 84;

/**
 * Demo score breakdown by metric
 */
export const DEMO_SCORE_BREAKDOWN: Record<string, number> = {
  releaseAngle: 95,
  elbowAngleAtRelease: 88,
  kneeAngleAtPeak: 92,
  jumpHeightNormalized: 72,
  stabilityIndex: 82,
  followThroughScore: 68,
};

/**
 * Demo confidence level
 */
export const DEMO_CONFIDENCE = 0.94;

// ============================================================================
// DEMO FLAWS
// ============================================================================

/**
 * Demo detected flaws - Realistic issues for feedback
 */
export const DEMO_FLAWS: DetectedFlaw[] = [
  {
    id: 'basketball_jumpshot_followthrough_incomplete',
    title: 'Follow-Through Could Be Stronger',
    description: 'Your follow-through score is 78/100. Extending your wrist more after release would improve consistency.',
    severity: 'low',
    category: 'form',
    injuryRisk: false,
    affectedBodyParts: ['wrist', 'elbow'],
    actualValue: 78,
    threshold: 80,
    idealRange: '80-100',
    correction: 'Hold your follow-through position for a moment after release. Your wrist should be relaxed and pointing down like a "gooseneck."',
    youtubeUrl: 'https://www.youtube.com/watch?v=mvSHaFB8lPA',
    youtubeTitle: 'Perfect Your Follow Through - Shooting Drills',
    drill: {
      name: 'Freeze Follow-Through Drill',
      description: 'After each shot, hold your follow-through for 3 seconds. Practice until it feels natural.',
      duration: '5 minutes',
    },
    confidence: 0.85,
  },
  {
    id: 'basketball_jumpshot_jump_moderate',
    title: 'Good Jump Height',
    description: 'Your jump height is 11% of body height - within acceptable range but could be improved for a higher release point.',
    severity: 'low',
    category: 'power',
    injuryRisk: false,
    affectedBodyParts: ['knee', 'ankle'],
    actualValue: 0.11,
    threshold: 0.12,
    idealRange: '12-15%',
    correction: 'Focus on explosive leg drive. Your legs should feel like springs pushing you up.',
    youtubeUrl: 'https://www.youtube.com/watch?v=zzB8YBLJB1s',
    youtubeTitle: 'Increase Your Vertical for Better Shooting',
    confidence: 0.78,
  },
];

// ============================================================================
// DEMO HISTORY (For Progress Chart)
// ============================================================================

/**
 * Demo session history for chart display
 */
export const DEMO_SESSION_HISTORY = [
  { date: '7 days ago', score: 72, sessionId: 'demo-1' },
  { date: '5 days ago', score: 75, sessionId: 'demo-2' },
  { date: '4 days ago', score: 71, sessionId: 'demo-3' },
  { date: '3 days ago', score: 78, sessionId: 'demo-4' },
  { date: '2 days ago', score: 80, sessionId: 'demo-5' },
  { date: 'Yesterday', score: 82, sessionId: 'demo-6' },
  { date: 'Today', score: 84, sessionId: 'demo-7' },
];

/**
 * Demo progress stats
 */
export const DEMO_PROGRESS_STATS = {
  totalSessions: 7,
  averageScore: 77,
  bestScore: 84,
  latestScore: 84,
  overallImprovement: 16.7,
  weeklyImprovement: 12.5,
  trend: 'improving' as const,
  sessionsThisWeek: 7,
};

// ============================================================================
// COMPLETE DEMO SESSION
// ============================================================================

/**
 * Complete demo session object ready for injection
 */
export const DEMO_SESSION = {
  videoUrl: DEMO_VIDEO_URL,
  videoDuration: DEMO_VIDEO_METADATA.duration,
  fps: DEMO_VIDEO_METADATA.fps,
  sport: DEMO_VIDEO_METADATA.sport,
  action: DEMO_VIDEO_METADATA.action,
  landmarks: generateDemoLandmarks(),
  smoothedFrames: generateDemoLandmarks(),
  keyframes: DEMO_KEYFRAMES,
  metrics: DEMO_METRICS,
  score: DEMO_SCORE,
  scoreBreakdown: DEMO_SCORE_BREAKDOWN,
  scoreConfidence: DEMO_CONFIDENCE,
  flaws: DEMO_FLAWS,
};

/**
 * Get demo data for a specific component
 */
export function getDemoData() {
  return {
    session: DEMO_SESSION,
    history: DEMO_SESSION_HISTORY,
    stats: DEMO_PROGRESS_STATS,
  };
}