/**
 * Basketball Flaw Detection Engine
 * 
 * Rule-based detection of technique flaws and injury risks
 * for basketball actions, starting with the jump shot.
 * 
 * Each rule evaluates a specific metric against biomechanical
 * best practices and safety thresholds.
 */

import type {
  DetectedFlaw,
  FlawDetectionInput,
  FlawDetectionResult,
  FlawSeverity,
  FlawRule,
} from './flawTypes';

// ============================================================================
// YOUTUBE EDUCATIONAL RESOURCES
// ============================================================================

/**
 * Curated YouTube videos for technique correction
 * 
 * Why hardcode these?
 * - Quality control: Only verified, helpful content
 * - Stability: Links less likely to break than search results
 * - Relevance: Videos specifically address the flaw
 * 
 * Note: These should be periodically validated and updated
 */
const YOUTUBE_RESOURCES = {
  releaseAngle: {
    url: 'https://www.youtube.com/watch?v=t7CzXHuGpBw',
    title: 'How to Get Perfect Arc on Your Shot - ShotMechanics',
  },
  elbowAlignment: {
    url: 'https://www.youtube.com/watch?v=bX4LFxkiPvU',
    title: 'Fix Your Elbow Position - Pro Shot Mechanics',
  },
  kneeExtension: {
    url: 'https://www.youtube.com/watch?v=XcMj8VTdwKc',
    title: 'Use Your Legs in Your Shot - Basketball Training',
  },
  stability: {
    url: 'https://www.youtube.com/watch?v=gT0kslvtnlI',
    title: 'Balance & Footwork for Shooters - Coach Frikki',
  },
  jumpHeight: {
    url: 'https://www.youtube.com/watch?v=zzB8YBLJB1s',
    title: 'Increase Your Vertical for Better Shooting',
  },
  followThrough: {
    url: 'https://www.youtube.com/watch?v=mvSHaFB8lPA',
    title: 'Perfect Your Follow Through - Shooting Drills',
  },
  releaseTiming: {
    url: 'https://www.youtube.com/watch?v=eo1tppqCMjE',
    title: 'Shot Timing and Rhythm - Pro Tips',
  },
} as const;

// ============================================================================
// FLAW DETECTION RULES
// ============================================================================

/**
 * Low Release Angle Detection
 * 
 * A flat shot (low release angle) has several problems:
 * - Smaller target window (front of rim acts as barrier)
 * - Less margin for error on distance
 * - Harder to swish (ball enters at steep angle)
 * 
 * Pro shooters typically release at 50-55°
 * Below 42° is considered problematic
 */
function detectLowReleaseAngle(
  releaseAngle: number | null
): DetectedFlaw | null {
  if (releaseAngle === null || !Number.isFinite(releaseAngle)) {
    return null;
  }

  // Low release angle threshold
  if (releaseAngle < 42) {
    return {
      id: 'basketball_jumpshot_low_release_angle',
      title: 'Low Release Angle',
      description: `Your release angle is ${releaseAngle.toFixed(1)}°, which creates a flat shot trajectory. This reduces your margin for error and makes it harder to score consistently.`,
      severity: 'medium',
      category: 'form',
      injuryRisk: false,
      affectedBodyParts: ['wrist', 'elbow'],
      actualValue: releaseAngle,
      threshold: 42,
      idealRange: '50-55°',
      correction: 'Focus on pushing the ball upward, not forward. Imagine shooting over a tall defender. Your guide hand should release cleanly without pushing sideways.',
      youtubeUrl: YOUTUBE_RESOURCES.releaseAngle.url,
      youtubeTitle: YOUTUBE_RESOURCES.releaseAngle.title,
      drill: {
        name: 'One-Hand Form Shooting',
        description: 'Stand 3 feet from basket. Shoot with only your shooting hand, focusing on high arc. Make 20 in a row.',
        duration: '5 minutes',
      },
      confidence: Math.min(1, (42 - releaseAngle) / 15), // Higher confidence the more below threshold
    };
  }

  // Very high release angle (less common but still an issue)
  if (releaseAngle > 65) {
    return {
      id: 'basketball_jumpshot_high_release_angle',
      title: 'Excessive Release Angle',
      description: `Your release angle is ${releaseAngle.toFixed(1)}°, which creates a very steep shot. This requires more force and reduces range.`,
      severity: 'low',
      category: 'form',
      injuryRisk: false,
      affectedBodyParts: ['wrist', 'elbow'],
      actualValue: releaseAngle,
      threshold: 65,
      idealRange: '50-55°',
      correction: 'Your arc is too high. Focus on a more direct path to the basket while maintaining smooth follow-through.',
      youtubeUrl: YOUTUBE_RESOURCES.releaseAngle.url,
      youtubeTitle: YOUTUBE_RESOURCES.releaseAngle.title,
      confidence: Math.min(1, (releaseAngle - 65) / 15),
    };
  }

  return null;
}

/**
 * Elbow Angle Detection
 * 
 * Elbow position is critical for shooting consistency:
 * 
 * TOO EXTENDED (>175°):
 * - "Locked" elbow limits wrist snap
 * - Reduces control over ball
 * - INJURY RISK: Hyperextension strain on elbow joint
 * 
 * TOO BENT (<130°):
 * - "Pushing" motion instead of shooting
 * - Less power, more effort required
 * - Inconsistent release point
 */
function detectElbowAngleIssues(
  elbowAngle: number | null
): DetectedFlaw | null {
  if (elbowAngle === null || !Number.isFinite(elbowAngle)) {
    return null;
  }

  // Excessive elbow lock (hyperextension risk)
  if (elbowAngle > 175) {
    return {
      id: 'basketball_jumpshot_elbow_hyperextension',
      title: 'Elbow Hyperextension',
      description: `Your elbow angle at release is ${elbowAngle.toFixed(1)}°, approaching full lock. This limits your wrist snap and control.`,
      severity: 'medium',
      category: 'injury_risk',
      injuryRisk: true,
      injuryDetails: 'Repeated hyperextension of the elbow during shooting can lead to elbow strain, tendinitis, and long-term joint damage. The elbow joint is not designed to support force at full extension.',
      affectedBodyParts: ['elbow'],
      actualValue: elbowAngle,
      threshold: 175,
      idealRange: '150-170°',
      correction: 'Maintain a slight bend in your elbow at release. This allows for proper follow-through and reduces joint stress. Think "extend, don\'t lock."',
      youtubeUrl: YOUTUBE_RESOURCES.elbowAlignment.url,
      youtubeTitle: YOUTUBE_RESOURCES.elbowAlignment.title,
      drill: {
        name: 'Elbow Position Drill',
        description: 'Practice your shooting motion in slow-motion, stopping at release. Check that you can see a slight bend in your elbow in a mirror.',
        duration: '3 minutes',
      },
      confidence: Math.min(1, (elbowAngle - 175) / 5),
    };
  }

  // Under-extended elbow (pushing shot)
  if (elbowAngle < 130) {
    return {
      id: 'basketball_jumpshot_elbow_underextension',
      title: 'Under-Extended Elbow',
      description: `Your elbow angle at release is only ${elbowAngle.toFixed(1)}°. You're pushing the ball rather than shooting it.`,
      severity: 'high',
      category: 'form',
      injuryRisk: false,
      affectedBodyParts: ['elbow', 'shoulder'],
      actualValue: elbowAngle,
      threshold: 130,
      idealRange: '150-170°',
      correction: 'Extend your shooting arm more fully toward the basket. The power should come from your legs, allowing your arm to extend naturally.',
      youtubeUrl: YOUTUBE_RESOURCES.elbowAlignment.url,
      youtubeTitle: YOUTUBE_RESOURCES.elbowAlignment.title,
      drill: {
        name: 'Extension Form Shooting',
        description: 'Close to the basket, focus on full arm extension on each shot. Freeze your follow-through to check position.',
        duration: '5 minutes',
      },
      confidence: Math.min(1, (130 - elbowAngle) / 20),
    };
  }

  return null;
}

/**
 * Knee Angle Detection
 * 
 * Knee angle at peak jump indicates power transfer efficiency:
 * 
 * TOO BENT (<110°):
 * - Power leak: didn't fully extend through the jump
 * - Less elevation = easier to block
 * - Indicates rushing the shot
 * 
 * PROPERLY EXTENDED (160-180°):
 * - Full power transfer from legs
 * - Maximum elevation
 * - Stable platform for upper body
 */
function detectKneeAngleIssues(
  kneeAngle: number | null
): DetectedFlaw | null {
  if (kneeAngle === null || !Number.isFinite(kneeAngle)) {
    return null;
  }

  // Severely bent knees at peak (significant power loss)
  if (kneeAngle < 110) {
    return {
      id: 'basketball_jumpshot_knee_underextension_severe',
      title: 'Poor Knee Extension',
      description: `Your knee angle at peak jump is only ${kneeAngle.toFixed(1)}°. You're not fully using your legs to power the shot.`,
      severity: 'high',
      category: 'power',
      injuryRisk: false,
      affectedBodyParts: ['knee', 'hip'],
      actualValue: kneeAngle,
      threshold: 110,
      idealRange: '160-180°',
      correction: 'Drive through your legs more explosively. Your legs should be nearly straight at the peak of your jump. This generates power so your arms don\'t have to work as hard.',
      youtubeUrl: YOUTUBE_RESOURCES.kneeExtension.url,
      youtubeTitle: YOUTUBE_RESOURCES.kneeExtension.title,
      drill: {
        name: 'Jump & Freeze',
        description: 'Practice jumping and freezing at the peak. Check your leg position. Repeat 10 times, focusing on full extension.',
        duration: '3 minutes',
      },
      confidence: Math.min(1, (110 - kneeAngle) / 30),
    };
  }

  // Moderately bent knees (some power loss)
  if (kneeAngle < 140) {
    return {
      id: 'basketball_jumpshot_knee_underextension_moderate',
      title: 'Incomplete Leg Drive',
      description: `Your knee angle at peak is ${kneeAngle.toFixed(1)}°. You could generate more power with fuller extension.`,
      severity: 'medium',
      category: 'power',
      injuryRisk: false,
      affectedBodyParts: ['knee'],
      actualValue: kneeAngle,
      threshold: 140,
      idealRange: '160-180°',
      correction: 'Focus on pushing through the floor and extending your legs fully. The jump should feel explosive, not rushed.',
      youtubeUrl: YOUTUBE_RESOURCES.kneeExtension.url,
      youtubeTitle: YOUTUBE_RESOURCES.kneeExtension.title,
      confidence: Math.min(1, (140 - kneeAngle) / 30),
    };
  }

  return null;
}

/**
 * Jump Height Detection
 * 
 * Low jump height can indicate:
 * - Fatigue
 * - Lack of power generation
 * - Rushing the shot
 * - Poor timing
 * 
 * Note: This is lower priority because some shooters
 * (especially on free throws) intentionally minimize jump
 */
function detectLowJumpHeight(
  jumpHeight: number | null
): DetectedFlaw | null {
  if (jumpHeight === null || !Number.isFinite(jumpHeight)) {
    return null;
  }

  // Very low jump (essentially no elevation)
  if (jumpHeight < 0.03) {
    return {
      id: 'basketball_jumpshot_minimal_jump',
      title: 'Minimal Jump Height',
      description: `Your jump height is only ${(jumpHeight * 100).toFixed(1)}% of body height. This makes your shot easier to block.`,
      severity: 'low',
      category: 'power',
      injuryRisk: false,
      affectedBodyParts: ['knee', 'ankle'],
      actualValue: jumpHeight,
      threshold: 0.03,
      idealRange: '8-15% of body height',
      correction: 'Focus on getting more elevation on your shot. Use your legs to jump up, not forward. This creates a higher release point.',
      youtubeUrl: YOUTUBE_RESOURCES.jumpHeight.url,
      youtubeTitle: YOUTUBE_RESOURCES.jumpHeight.title,
      confidence: Math.min(1, (0.05 - jumpHeight) / 0.05),
    };
  }

  // Low jump
  if (jumpHeight < 0.05) {
    return {
      id: 'basketball_jumpshot_low_jump',
      title: 'Low Jump Height',
      description: `Your jump height is ${(jumpHeight * 100).toFixed(1)}% of body height. More elevation would improve your shot.`,
      severity: 'low',
      category: 'power',
      injuryRisk: false,
      affectedBodyParts: ['knee', 'ankle'],
      actualValue: jumpHeight,
      threshold: 0.05,
      idealRange: '8-15% of body height',
      correction: 'Work on your vertical leap and timing. The jump should be part of your natural shooting rhythm.',
      youtubeUrl: YOUTUBE_RESOURCES.jumpHeight.url,
      youtubeTitle: YOUTUBE_RESOURCES.jumpHeight.title,
      confidence: Math.min(1, (0.08 - jumpHeight) / 0.08),
    };
  }

  return null;
}

/**
 * Stability Index Detection
 * 
 * Low stability indicates lateral movement during the shot:
 * 
 * MODERATE INSTABILITY (<70):
 * - Inconsistent aim
 * - Muscle compensation required
 * 
 * SEVERE INSTABILITY (<60):
 * - High inconsistency
 * - INJURY RISK: Increased ankle/knee strain from
 *   landing off-balance
 */
function detectStabilityIssues(
  stabilityIndex: number | null
): DetectedFlaw | null {
  if (stabilityIndex === null || !Number.isFinite(stabilityIndex)) {
    return null;
  }

  // Severe instability (injury risk)
  if (stabilityIndex < 60) {
    return {
      id: 'basketball_jumpshot_severe_instability',
      title: 'Severe Balance Issues',
      description: `Your stability index is ${stabilityIndex.toFixed(0)}/100. Significant lateral movement is affecting your shot and could cause injury.`,
      severity: 'high',
      category: 'balance',
      injuryRisk: true,
      injuryDetails: 'Landing off-balance after a jump shot puts excessive stress on your ankles and knees. This increases the risk of sprains, ACL injuries, and chronic joint problems.',
      affectedBodyParts: ['ankle', 'knee', 'hip'],
      actualValue: stabilityIndex,
      threshold: 60,
      idealRange: '85-100',
      correction: 'Focus on shooting straight up and down. Your feet should land close to where they took off. Practice with your feet shoulder-width apart.',
      youtubeUrl: YOUTUBE_RESOURCES.stability.url,
      youtubeTitle: YOUTUBE_RESOURCES.stability.title,
      drill: {
        name: 'Balance Landing Drill',
        description: 'Jump straight up, land softly in the same spot, hold for 2 seconds. Repeat 15 times. Progress to jumping and shooting.',
        duration: '5 minutes',
      },
      confidence: Math.min(1, (60 - stabilityIndex) / 30),
    };
  }

  // Moderate instability
  if (stabilityIndex < 75) {
    return {
      id: 'basketball_jumpshot_moderate_instability',
      title: 'Balance Needs Improvement',
      description: `Your stability index is ${stabilityIndex.toFixed(0)}/100. Some lateral movement is reducing your consistency.`,
      severity: 'medium',
      category: 'balance',
      injuryRisk: false,
      affectedBodyParts: ['ankle', 'hip'],
      actualValue: stabilityIndex,
      threshold: 75,
      idealRange: '85-100',
      correction: 'Work on core strength and footwork. Square your shoulders to the basket before shooting.',
      youtubeUrl: YOUTUBE_RESOURCES.stability.url,
      youtubeTitle: YOUTUBE_RESOURCES.stability.title,
      confidence: Math.min(1, (75 - stabilityIndex) / 20),
    };
  }

  return null;
}

/**
 * Follow-Through Detection
 */
function detectFollowThroughIssues(
  followThroughScore: number | null
): DetectedFlaw | null {
  if (followThroughScore === null || !Number.isFinite(followThroughScore)) {
    return null;
  }

  // Poor follow-through
  if (followThroughScore < 40) {
    return {
      id: 'basketball_jumpshot_poor_followthrough',
      title: 'Incomplete Follow-Through',
      description: `Your follow-through score is ${followThroughScore.toFixed(0)}/100. You're not finishing your shot properly.`,
      severity: 'medium',
      category: 'form',
      injuryRisk: false,
      affectedBodyParts: ['wrist', 'elbow'],
      actualValue: followThroughScore,
      threshold: 40,
      idealRange: '70-100',
      correction: 'Hold your follow-through until the ball reaches the basket. Your wrist should be relaxed and pointing down (the "gooseneck" position).',
      youtubeUrl: YOUTUBE_RESOURCES.followThrough.url,
      youtubeTitle: YOUTUBE_RESOURCES.followThrough.title,
      drill: {
        name: 'Freeze Follow-Through',
        description: 'Shoot and hold your follow-through for 3 seconds after every shot. Practice until it feels natural.',
        duration: '5 minutes',
      },
      confidence: Math.min(1, (50 - followThroughScore) / 50),
    };
  }

  return null;
}

/**
 * Release Timing Detection
 */
function detectReleaseTimingIssues(
  releaseTimingMs: number | null
): DetectedFlaw | null {
  if (releaseTimingMs === null || !Number.isFinite(releaseTimingMs)) {
    return null;
  }

  // Releasing too late (after peak, on the way down)
  if (releaseTimingMs > 80) {
    return {
      id: 'basketball_jumpshot_late_release',
      title: 'Late Release',
      description: `You're releasing the ball ${releaseTimingMs.toFixed(0)}ms after your jump's peak. This reduces power and control.`,
      severity: 'medium',
      category: 'timing',
      injuryRisk: false,
      affectedBodyParts: ['wrist', 'elbow'],
      actualValue: releaseTimingMs,
      threshold: 80,
      idealRange: '-50ms to 0ms (at or before peak)',
      correction: 'Release the ball at or slightly before the peak of your jump. This uses your upward momentum to help power the shot.',
      youtubeUrl: YOUTUBE_RESOURCES.releaseTiming.url,
      youtubeTitle: YOUTUBE_RESOURCES.releaseTiming.title,
      confidence: Math.min(1, (releaseTimingMs - 50) / 100),
    };
  }

  // Releasing too early (well before peak)
  if (releaseTimingMs < -120) {
    return {
      id: 'basketball_jumpshot_early_release',
      title: 'Very Early Release',
      description: `You're releasing the ball ${Math.abs(releaseTimingMs).toFixed(0)}ms before your jump's peak. You may be rushing your shot.`,
      severity: 'low',
      category: 'timing',
      injuryRisk: false,
      affectedBodyParts: ['wrist', 'elbow'],
      actualValue: releaseTimingMs,
      threshold: -120,
      idealRange: '-50ms to 0ms (at or before peak)',
      correction: 'Take your time on the shot. Let your jump develop before releasing. This adds power without requiring more arm strength.',
      youtubeUrl: YOUTUBE_RESOURCES.releaseTiming.url,
      youtubeTitle: YOUTUBE_RESOURCES.releaseTiming.title,
      confidence: Math.min(1, (-120 - releaseTimingMs) / 80),
    };
  }

  return null;
}

// ============================================================================
// DRIBBLING FLAW RULES
// ============================================================================

function detectStraightKnee(kneeBendScore: number | null): DetectedFlaw | null {
  if (kneeBendScore === null) return null;
  if (kneeBendScore >= 35) return null; // Adequate stance depth

  const severity: FlawSeverity = kneeBendScore < 15 ? 'high' : 'medium';

  return {
    id: 'straight_knee_dribble',
    severity,
    category: 'form',
    affectedBodyParts: ['knee', 'hip'],
    title: 'Standing Too Upright',
    description: `Your dribbling stance is too upright (stance depth score ${Math.round(kneeBendScore)}/100). A proper dribbling stance requires bent knees and lowered hips for quick reaction and ball protection.`,
    actualValue: kneeBendScore,
    threshold: 35,
    idealRange: '50–100 (low, bent-knee stance)',
    correction: 'Bend your knees to lower your centre of gravity. Imagine sitting back into a quarter-squat. This improves explosiveness, balance, and makes you harder to defend.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wSxbTnBFKa8',
    youtubeTitle: 'Proper Dribbling Stance - Basketball IQ',
    injuryRisk: false,
    confidence: Math.min(1, (35 - kneeBendScore) / 20),
  };
}

function detectNarrowDribblingStance(stanceWidth: number | null): DetectedFlaw | null {
  if (stanceWidth === null) return null;
  if (stanceWidth >= 70) return null;

  return {
    id: 'narrow_stance_dribble',
    severity: 'medium',
    category: 'balance',
    affectedBodyParts: ['ankle', 'knee', 'hip'],
    title: 'Stance Too Narrow',
    description: `Your feet are close together while dribbling (≈${Math.round(stanceWidth)}% shoulder width). A narrow stance reduces stability and makes you easier to knock off balance.`,
    actualValue: stanceWidth,
    threshold: 70,
    idealRange: '85–125% of shoulder width',
    correction: 'Widen your stance to at least shoulder width. Plant your feet firmly with toes slightly out to create a solid, balanced base for ball-handling.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wSxbTnBFKa8',
    youtubeTitle: 'Improve Your Dribbling Stance - Basketball Training',
    injuryRisk: false,
    confidence: Math.min(1, (70 - stanceWidth) / 20),
  };
}

function detectWideDribblingStance(stanceWidth: number | null): DetectedFlaw | null {
  if (stanceWidth === null) return null;
  if (stanceWidth <= 220) return null; // Wide stances are common in drills

  return {
    id: 'wide_stance_dribble',
    severity: 'low',
    category: 'balance',
    affectedBodyParts: ['ankle', 'knee'],
    title: 'Stance Extremely Wide',
    description: `Your feet are extremely wide (≈${Math.round(stanceWidth)}% shoulder width). While wide stances are normal in drills, this excessive width limits lateral explosiveness.`,
    actualValue: stanceWidth,
    threshold: 220,
    idealRange: '70–180% of shoulder width',
    correction: 'Bring your feet slightly closer together. This lets you explode in any direction without the extra step needed from a super-wide base.',
    youtubeUrl: 'https://www.youtube.com/watch?v=wSxbTnBFKa8',
    youtubeTitle: 'Dribbling Footwork Fundamentals',
    injuryRisk: false,
    confidence: Math.min(1, (stanceWidth - 220) / 40),
  };
}

function detectPoorDribblingBalance(balanceScore: number | null): DetectedFlaw | null {
  if (balanceScore === null) return null;
  if (balanceScore >= 55) return null;

  const severity: FlawSeverity = balanceScore < 35 ? 'high' : 'medium';

  return {
    id: 'poor_balance_dribble',
    severity,
    category: 'balance',
    affectedBodyParts: ['hip', 'torso', 'full_body'],
    title: 'Inconsistent Body Balance',
    description: `Your body sways significantly while dribbling (balance score ${Math.round(balanceScore)}/100). Lateral movement without purpose tips off defenders and reduces control.`,
    actualValue: balanceScore,
    threshold: 55,
    idealRange: '70–100 (minimal sway)',
    correction: 'Focus on keeping your torso still over your base. Practice stationary dribbling drills — dribble in place while keeping your hips centred.',
    youtubeUrl: 'https://www.youtube.com/watch?v=gT0kslvtnlI',
    youtubeTitle: 'Balance and Body Control While Dribbling',
    injuryRisk: false,
    confidence: Math.min(1, (55 - balanceScore) / 25),
  };
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detects all basketball jump shot flaws based on metrics
 * 
 * This is the main entry point for basketball flaw detection.
 * It evaluates each metric against biomechanical rules and
 * returns a comprehensive list of detected issues.
 * 
 * @param input - Metrics and context for flaw detection
 * @returns Complete flaw detection result
 */
export function detectBasketballFlaws(
  input: FlawDetectionInput
): FlawDetectionResult {
  const { metrics, action } = input;
  const flaws: DetectedFlaw[] = [];
  let rulesEvaluated = 0;

  console.log('[BasketballFlaws] Starting flaw detection for action:', action);

  // ── Dribbling-specific flaw detection ──────────────────────────
  if (action === 'dribbling') {
    rulesEvaluated++;
    const kneeFlaw = detectStraightKnee(metrics.kneeBendScore ?? null);
    if (kneeFlaw) flaws.push(kneeFlaw);

    rulesEvaluated++;
    const narrowFlaw = detectNarrowDribblingStance(metrics.stanceWidth ?? null);
    if (narrowFlaw) flaws.push(narrowFlaw);

    rulesEvaluated++;
    const wideFlaw = detectWideDribblingStance(metrics.stanceWidth ?? null);
    if (wideFlaw) flaws.push(wideFlaw);

    rulesEvaluated++;
    const balanceFlaw = detectPoorDribblingBalance(metrics.balanceScore ?? null);
    if (balanceFlaw) flaws.push(balanceFlaw);

    const injuryFlaws = flaws.filter((f) => f.injuryRisk);
    const highSeverityFlaws = flaws.filter((f) => f.severity === 'high');
    const overallInjuryRisk: FlawDetectionResult['overallInjuryRisk'] = 'none';

    flaws.sort((a, b) => {
      const severityOrder: Record<FlawSeverity, number> = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    let summary: string;
    if (flaws.length === 0) {
      summary = 'Great dribbling stance! No significant form issues detected.';
    } else if (highSeverityFlaws.length > 0) {
      summary = `Detected ${flaws.length} issue(s) with your dribbling posture, including ${highSeverityFlaws.length} high-priority item(s).`;
    } else {
      summary = `Detected ${flaws.length} minor issue(s) to improve your dribbling form.`;
    }

    return { flaws, rulesEvaluated, overallInjuryRisk, summary };
  }

  // Layup uses overall jump/stability — return empty for now
  if (action === 'layup') {
    return {
      flaws: [],
      rulesEvaluated: 0,
      overallInjuryRisk: 'none',
      summary: 'Layup technique evaluation focuses on scoring metrics above.',
    };
  }

  // Only process jump_shot / free_throw below
  if (action !== 'jump_shot' && action !== 'free_throw') {
    console.log('[BasketballFlaws] Action not supported yet:', action);
    return {
      flaws: [],
      rulesEvaluated: 0,
      overallInjuryRisk: 'none',
      summary: `Flaw detection for ${action} is not yet available.`,
    };
  }

  // Run each detection rule
  // Each rule increments rulesEvaluated and may add to flaws

  // Rule 1: Release Angle
  rulesEvaluated++;
  const releaseAngleFlaw = detectLowReleaseAngle(metrics.releaseAngle ?? null);
  if (releaseAngleFlaw) {
    flaws.push(releaseAngleFlaw);
  }

  // Rule 2: Elbow Angle
  rulesEvaluated++;
  const elbowFlaw = detectElbowAngleIssues(metrics.elbowAngleAtRelease ?? null);
  if (elbowFlaw) {
    flaws.push(elbowFlaw);
  }

  // Rule 3: Knee Angle
  rulesEvaluated++;
  const kneeFlaw = detectKneeAngleIssues(metrics.kneeAngleAtPeak ?? null);
  if (kneeFlaw) {
    flaws.push(kneeFlaw);
  }

  // Rule 4: Jump Height
  rulesEvaluated++;
  const jumpFlaw = detectLowJumpHeight(metrics.jumpHeightNormalized ?? null);
  if (jumpFlaw) {
    flaws.push(jumpFlaw);
  }

  // Rule 5: Stability
  rulesEvaluated++;
  const stabilityFlaw = detectStabilityIssues(metrics.stabilityIndex ?? null);
  if (stabilityFlaw) {
    flaws.push(stabilityFlaw);
  }

  // Rule 6: Follow-Through
  rulesEvaluated++;
  const followThroughFlaw = detectFollowThroughIssues(
    metrics.followThroughScore ?? null
  );
  if (followThroughFlaw) {
    flaws.push(followThroughFlaw);
  }

  // Rule 7: Release Timing
  rulesEvaluated++;
  const timingFlaw = detectReleaseTimingIssues(metrics.releaseTimingMs ?? null);
  if (timingFlaw) {
    flaws.push(timingFlaw);
  }

  // Calculate overall injury risk
  const injuryFlaws = flaws.filter((f) => f.injuryRisk);
  const highSeverityFlaws = flaws.filter((f) => f.severity === 'high');

  let overallInjuryRisk: FlawDetectionResult['overallInjuryRisk'] = 'none';
  if (injuryFlaws.some((f) => f.severity === 'high')) {
    overallInjuryRisk = 'high';
  } else if (injuryFlaws.length > 1) {
    overallInjuryRisk = 'moderate';
  } else if (injuryFlaws.length === 1) {
    overallInjuryRisk = 'low';
  }

  // Sort flaws by severity and injury risk
  flaws.sort((a, b) => {
    // Injury risks first
    if (a.injuryRisk !== b.injuryRisk) {
      return a.injuryRisk ? -1 : 1;
    }
    // Then by severity
    const severityOrder: Record<FlawSeverity, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Generate summary
  let summary: string;
  if (flaws.length === 0) {
    summary = 'Great job! No significant technique issues detected.';
  } else if (injuryFlaws.length > 0) {
    summary = `Detected ${flaws.length} issue(s), including ${injuryFlaws.length} potential injury risk(s). Address these for safety.`;
  } else if (highSeverityFlaws.length > 0) {
    summary = `Detected ${flaws.length} issue(s), including ${highSeverityFlaws.length} high-priority item(s) to work on.`;
  } else {
    summary = `Detected ${flaws.length} minor issue(s) to improve your technique.`;
  }

  console.log('[BasketballFlaws] Detection complete:', {
    flawCount: flaws.length,
    rulesEvaluated,
    overallInjuryRisk,
  });

  return {
    flaws,
    rulesEvaluated,
    overallInjuryRisk,
    summary,
  };
}

/**
 * Quick check for any injury risks
 * Useful for showing warning icons without full analysis
 */
export function hasInjuryRisk(metrics: Record<string, number | null>): boolean {
  // Check elbow hyperextension
  if (metrics.elbowAngleAtRelease && metrics.elbowAngleAtRelease > 175) {
    return true;
  }

  // Check severe instability
  if (metrics.stabilityIndex && metrics.stabilityIndex < 60) {
    return true;
  }

  return false;
}