/**
 * Badminton Flaw Detection Engine
 *
 * Rule-based detection of technique flaws for badminton actions:
 * smash, clear, drop_shot, serve.
 */

import type {
    DetectedFlaw,
    FlawDetectionInput,
    FlawDetectionResult,
} from './flawTypes';

// ============================================================================
// YouTube Resources
// ============================================================================

const YT = {
    smashTechnique: {
        url: 'https://www.youtube.com/watch?v=J7BtEWnAHZ0',
        title: 'Badminton Smash Technique - Arm Swing & Contact',
    },
    clearTechnique: {
        url: 'https://www.youtube.com/watch?v=q43OfE7amL0',
        title: 'How to Play a Perfect Badminton Clear',
    },
    dropShot: {
        url: 'https://www.youtube.com/watch?v=mhJSBj7sJxg',
        title: 'Badminton Drop Shot - Technique & Disguise',
    },
    serveTechnique: {
        url: 'https://www.youtube.com/watch?v=4xF1SHRwFp0',
        title: 'Badminton Serve Technique - Short & Long',
    },
    footwork: {
        url: 'https://www.youtube.com/watch?v=RqRCWSSvsBU',
        title: 'Badminton Footwork & Balance Drills',
    },
    trunkRotation: {
        url: 'https://www.youtube.com/watch?v=8BF9vDeQsOI',
        title: 'Hip Rotation for Racket Sports Power',
    },
    wristSpeed: {
        url: 'https://www.youtube.com/watch?v=PIRdE9oW9bc',
        title: 'Badminton Wrist Flick & Speed Exercises',
    },
} as const;

// ============================================================================
// Shared helpers
// ============================================================================

function detectLowElbow(
    elbowAngle: number | null,
    actionPrefix: string,
    threshold = 140,
    idealRange = '155–177°'
): DetectedFlaw | null {
    if (elbowAngle === null || !Number.isFinite(elbowAngle)) return null;
    if (elbowAngle < threshold) {
        return {
            id: `${actionPrefix}_low_elbow_extension`,
            title: 'Arm Not Fully Extended at Contact',
            description: `Elbow angle at contact is ${elbowAngle.toFixed(1)}°. A straighter arm produces more power and reach.`,
            severity: elbowAngle < 115 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['elbow', 'shoulder'],
            actualValue: elbowAngle,
            threshold,
            idealRange,
            correction:
                'Extend your racket arm fully at the moment of contact. Think of "reaching" past the shuttle, not hitting at it.',
            youtubeUrl: YT.smashTechnique.url,
            youtubeTitle: YT.smashTechnique.title,
            confidence: Math.min(1, (threshold - elbowAngle) / 25),
        };
    }
    return null;
}

function detectLowContactHeight(
    contactHeight: number | null,
    actionPrefix: string,
    threshold: number,
    idealRange: string
): DetectedFlaw | null {
    if (contactHeight === null || !Number.isFinite(contactHeight)) return null;
    if (contactHeight < threshold) {
        return {
            id: `${actionPrefix}_low_contact_height`,
            title: 'Low Contact Point',
            description: `Contact height is ${contactHeight.toFixed(0)}% of body height. Higher contact improves shuttle angle.`,
            severity: contactHeight < threshold - 18 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['shoulder', 'elbow', 'wrist'],
            actualValue: contactHeight,
            threshold,
            idealRange,
            correction:
                'Time your footwork so you arrive underneath the shuttle. Reach at your maximum extension point.',
            youtubeUrl: YT.smashTechnique.url,
            youtubeTitle: YT.smashTechnique.title,
            confidence: Math.min(1, (threshold - contactHeight) / 20),
        };
    }
    return null;
}

function detectLowFollowThrough(
    followThrough: number | null,
    actionPrefix: string,
    sourceVideo: { url: string; title: string }
): DetectedFlaw | null {
    if (followThrough === null || !Number.isFinite(followThrough)) return null;
    if (followThrough < 45) {
        return {
            id: `${actionPrefix}_poor_follow_through`,
            title: 'Incomplete Follow-Through',
            description: `Follow-through score is ${followThrough.toFixed(0)}/100. Stopping your swing early reduces power and consistency.`,
            severity: followThrough < 25 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['wrist', 'elbow', 'shoulder'],
            actualValue: followThrough,
            threshold: 45,
            idealRange: '65–100',
            correction:
                'Let your arm swing fully across your body after contact. The follow-through protects your shoulder and adds spin/pace.',
            youtubeUrl: sourceVideo.url,
            youtubeTitle: sourceVideo.title,
            confidence: Math.min(1, (45 - followThrough) / 35),
        };
    }
    return null;
}

function detectLowTrunkRotation(
    trunkRotation: number | null,
    actionPrefix: string,
    threshold = 15
): DetectedFlaw | null {
    if (trunkRotation === null || !Number.isFinite(trunkRotation)) return null;
    if (trunkRotation < threshold) {
        return {
            id: `${actionPrefix}_low_trunk_rotation`,
            title: 'Insufficient Hip & Shoulder Rotation',
            description: `Trunk rotation is only ${trunkRotation.toFixed(1)}°. Hip-shoulder separation is the primary power source in racket sports.`,
            severity: 'medium',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['hip', 'torso', 'shoulder'],
            actualValue: trunkRotation,
            threshold,
            idealRange: '25–60°',
            correction:
                'Load your hips by turning your non-dominant side toward the shuttle first, then uncoil hips before your arm swings.',
            youtubeUrl: YT.trunkRotation.url,
            youtubeTitle: YT.trunkRotation.title,
            confidence: Math.min(1, (threshold - trunkRotation) / 15),
        };
    }
    return null;
}

function detectPoorBodyAlignment(
    score: number | null,
    actionPrefix: string
): DetectedFlaw | null {
    if (score === null || !Number.isFinite(score)) return null;
    if (score < 55) {
        return {
            id: `${actionPrefix}_poor_body_alignment`,
            title: 'Poor Body Posture',
            description: `Body alignment score is ${score.toFixed(0)}/100. Excessive trunk lean reduces power and court vision.`,
            severity: score < 35 ? 'high' : 'medium',
            category: 'balance',
            injuryRisk: score < 35,
            injuryDetails:
                score < 35
                    ? 'Extreme lean puts strain on the lower back and hamstrings in fast-movement contexts.'
                    : undefined,
            affectedBodyParts: ['torso', 'hip'],
            actualValue: score,
            threshold: 55,
            idealRange: '65–100',
            correction:
                'Stay tall through your strokes. A slight forward lean is fine, but keep your core engaged.',
            youtubeUrl: YT.footwork.url,
            youtubeTitle: YT.footwork.title,
            confidence: Math.min(1, (55 - score) / 30),
        };
    }
    return null;
}

function detectLowStability(
    score: number | null,
    actionPrefix: string
): DetectedFlaw | null {
    if (score === null || !Number.isFinite(score)) return null;
    if (score < 60) {
        return {
            id: `${actionPrefix}_low_stability`,
            title: 'Unstable Base',
            description: `Stability score is ${score.toFixed(0)}/100. Lateral sway bleeds power from your shot.`,
            severity: score < 40 ? 'high' : 'medium',
            category: 'balance',
            injuryRisk: score < 40,
            injuryDetails:
                score < 40
                    ? 'Significant body sway during racket-sport strokes increases knee and ankle strain risk.'
                    : undefined,
            affectedBodyParts: ['hip', 'ankle', 'knee'],
            actualValue: score,
            threshold: 60,
            idealRange: '75–100',
            correction:
                'Ground yourself with a wide, stable stance before each stroke. Return to a balanced ready position after each shot.',
            youtubeUrl: YT.footwork.url,
            youtubeTitle: YT.footwork.title,
            confidence: Math.min(1, (60 - score) / 30),
        };
    }
    return null;
}

// ============================================================================
// Smash
// ============================================================================

function detectSmashFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    const elbowFlaw = detectLowElbow(metrics.elbowAtContact ?? null, 'badminton_smash');
    if (elbowFlaw) flaws.push(elbowFlaw);

    const heightFlaw = detectLowContactHeight(
        metrics.contactHeight ?? null,
        'badminton_smash',
        80,
        '90–125% of body height'
    );
    if (heightFlaw) flaws.push(heightFlaw);

    const rotationFlaw = detectLowTrunkRotation(metrics.trunkRotation ?? null, 'badminton_smash');
    if (rotationFlaw) flaws.push(rotationFlaw);

    // Low wrist snap speed
    const wristSpeed = metrics.wristSpeed ?? null;
    if (wristSpeed !== null && Number.isFinite(wristSpeed) && wristSpeed < 40) {
        flaws.push({
            id: 'badminton_smash_low_wrist_speed',
            title: 'Slow Wrist Snap',
            description: `Wrist speed score is ${wristSpeed.toFixed(0)}/100. A faster wrist snap is the key to a sharp smash.`,
            severity: wristSpeed < 20 ? 'high' : 'medium',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['wrist'],
            actualValue: wristSpeed,
            threshold: 40,
            idealRange: '60–100',
            correction:
                'Keep your wrist cocked back until just before contact, then snap it forward explosively. Practice shadow strokes focusing on a late, fast wrist action.',
            youtubeUrl: YT.wristSpeed.url,
            youtubeTitle: YT.wristSpeed.title,
            drill: {
                name: 'Wrist Flick Against Shuttle',
                description:
                    'Hold a shuttle in your non-racket hand. Flick it upward with only your racket wrist. Increase speed over 50 reps.',
                duration: '3 minutes',
            },
            confidence: Math.min(1, (40 - wristSpeed) / 30),
        });
    }

    const followFlaw = detectLowFollowThrough(
        metrics.followThrough ?? null,
        'badminton_smash',
        YT.smashTechnique
    );
    if (followFlaw) flaws.push(followFlaw);

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'badminton_smash');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    return buildResult(flaws, 6, 'smash');
}

// ============================================================================
// Clear
// ============================================================================

function detectClearFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    const elbowFlaw = detectLowElbow(
        metrics.elbowAtContact ?? null,
        'badminton_clear',
        135,
        '150–177°'
    );
    if (elbowFlaw) flaws.push(elbowFlaw);

    const heightFlaw = detectLowContactHeight(
        metrics.contactHeight ?? null,
        'badminton_clear',
        75,
        '82–118% of body height'
    );
    if (heightFlaw) flaws.push(heightFlaw);

    const rotationFlaw = detectLowTrunkRotation(metrics.trunkRotation ?? null, 'badminton_clear', 12);
    if (rotationFlaw) flaws.push(rotationFlaw);

    const followFlaw = detectLowFollowThrough(
        metrics.followThrough ?? null,
        'badminton_clear',
        YT.clearTechnique
    );
    if (followFlaw) flaws.push(followFlaw);

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'badminton_clear');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    return buildResult(flaws, 5, 'clear');
}

// ============================================================================
// Drop Shot
// ============================================================================

function detectDropShotFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    // Contact height for drop shot: should be moderately high but not as extreme as smash
    const heightFlaw = detectLowContactHeight(
        metrics.contactHeight ?? null,
        'badminton_drop_shot',
        55,
        '65–98% of body height'
    );
    if (heightFlaw) flaws.push(heightFlaw);

    // Elbow angle for drop shot: can be slightly bent for control
    const elbowAngle = metrics.elbowAngle ?? null;
    if (elbowAngle !== null && Number.isFinite(elbowAngle) && elbowAngle < 100) {
        flaws.push({
            id: 'badminton_drop_shot_elbow_too_bent',
            title: 'Elbow Too Bent for Drop Shot',
            description: `Elbow angle is only ${elbowAngle.toFixed(1)}°. This limits racket reach and shot disguise.`,
            severity: 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['elbow'],
            actualValue: elbowAngle,
            threshold: 100,
            idealRange: '118–162°',
            correction:
                'Your arm should be comfortably extended — not straight, but not cramped. Think of "guiding" the shuttle over the net.',
            youtubeUrl: YT.dropShot.url,
            youtubeTitle: YT.dropShot.title,
            confidence: Math.min(1, (100 - elbowAngle) / 30),
        });
    }

    const rotationFlaw = detectLowTrunkRotation(metrics.trunkRotation ?? null, 'badminton_drop_shot', 8);
    if (rotationFlaw) flaws.push(rotationFlaw);

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'badminton_drop_shot');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    const stabilityFlaw = detectLowStability(metrics.stability ?? null, 'badminton_drop_shot');
    if (stabilityFlaw) flaws.push(stabilityFlaw);

    return buildResult(flaws, 5, 'drop shot');
}

// ============================================================================
// Serve
// ============================================================================

function detectBadmintonServeFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    const stabilityFlaw = detectLowStability(metrics.stability ?? null, 'badminton_serve');
    if (stabilityFlaw) flaws.push(stabilityFlaw);

    // Elbow angle: typically a slight bend for short serve, more extension for long serve
    const elbowAngle = metrics.elbowAtContact ?? null;
    if (elbowAngle !== null && Number.isFinite(elbowAngle)) {
        if (elbowAngle < 95) {
            flaws.push({
                id: 'badminton_serve_elbow_too_bent',
                title: 'Elbow Too Bent at Serve',
                description: `Elbow angle at serve contact is ${elbowAngle.toFixed(1)}°. This cramps the swing and reduces consistency.`,
                severity: 'medium',
                category: 'form',
                injuryRisk: false,
                affectedBodyParts: ['elbow'],
                actualValue: elbowAngle,
                threshold: 95,
                idealRange: '120–165°',
                correction:
                    'Relax your arm into a comfortable semi-extended position. Let the shuttle drop to a consistent toss height before striking.',
                youtubeUrl: YT.serveTechnique.url,
                youtubeTitle: YT.serveTechnique.title,
                confidence: Math.min(1, (95 - elbowAngle) / 40),
            });
        }
    }

    const followFlaw = detectLowFollowThrough(
        metrics.followThrough ?? null,
        'badminton_serve',
        YT.serveTechnique
    );
    if (followFlaw) flaws.push(followFlaw);

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'badminton_serve');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    return buildResult(flaws, 4, 'serve');
}

// ============================================================================
// Builder
// ============================================================================

function buildResult(
    flaws: DetectedFlaw[],
    rulesEvaluated: number,
    action: string
): FlawDetectionResult {
    const injuryFlaws = flaws.filter((f) => f.injuryRisk);
    let overallInjuryRisk: FlawDetectionResult['overallInjuryRisk'] = 'none';
    if (injuryFlaws.some((f) => f.severity === 'high')) overallInjuryRisk = 'high';
    else if (injuryFlaws.length > 1) overallInjuryRisk = 'moderate';
    else if (injuryFlaws.length === 1) overallInjuryRisk = 'low';

    const summary =
        flaws.length === 0
            ? `Great ${action}! No significant form flaws detected.`
            : `${flaws.length} flaw${flaws.length > 1 ? 's' : ''} detected in your badminton ${action}.`;

    return { flaws, rulesEvaluated, overallInjuryRisk, summary };
}

// ============================================================================
// Main export
// ============================================================================

export function detectBadmintonFlaws(
    input: FlawDetectionInput
): FlawDetectionResult {
    const { action } = input;
    console.log('[BadmintonFlaws] Detecting flaws for action:', action);

    switch (action) {
        case 'smash': return detectSmashFlaws(input);
        case 'clear': return detectClearFlaws(input);
        case 'drop_shot': return detectDropShotFlaws(input);
        case 'serve': return detectBadmintonServeFlaws(input);
        default:
            console.warn('[BadmintonFlaws] Unknown action:', action);
            return {
                flaws: [],
                rulesEvaluated: 0,
                overallInjuryRisk: 'none',
                summary: `Flaw detection for badminton action "${action}" is not supported.`,
            };
    }
}
