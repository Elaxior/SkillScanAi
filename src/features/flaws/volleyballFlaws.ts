/**
 * Volleyball Flaw Detection Engine
 *
 * Rule-based detection of technique flaws for volleyball actions:
 * spike, serve, block, set.
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
    armSwing: {
        url: 'https://www.youtube.com/watch?v=wFfOxMV_X0Y',
        title: 'Volleyball Arm Swing Technique - Better at Beach',
    },
    spikeContact: {
        url: 'https://www.youtube.com/watch?v=zOYCFzlA5J4',
        title: 'How to Hit a Volleyball - Contact Point & Arm Swing',
    },
    jumpTraining: {
        url: 'https://www.youtube.com/watch?v=wzS1gq2LIUY',
        title: 'Volleyball Jump Training - Increase Your Vertical',
    },
    trunkRotation: {
        url: 'https://www.youtube.com/watch?v=8BF9vDeQsOI',
        title: 'Hip & Trunk Rotation for Volleyball Spikes',
    },
    bodyBalance: {
        url: 'https://www.youtube.com/watch?v=JHzC4pCaHUQ',
        title: 'Balance & Posture for Volleyball - Coaching Basics',
    },
    serveTechnique: {
        url: 'https://www.youtube.com/watch?v=KzWbdx6mbgw',
        title: 'How to Serve a Volleyball - Overhand Float Serve',
    },
    blockTechnique: {
        url: 'https://www.youtube.com/watch?v=mLnU0EcO3fA',
        title: 'Volleyball Blocking Technique - Penetration & Timing',
    },
    settingHands: {
        url: 'https://www.youtube.com/watch?v=0YJZqnm-F0o',
        title: 'Volleyball Setting: Hand Position & Symmetry',
    },
} as const;

// ============================================================================
// Shared single-metric detectors
// ============================================================================

function detectLowElbow(
    elbowAngle: number | null,
    actionPrefix: string,
    idealRange = '155–175°',
    threshold = 140
): DetectedFlaw | null {
    if (elbowAngle === null || !Number.isFinite(elbowAngle)) return null;
    if (elbowAngle < threshold) {
        return {
            id: `${actionPrefix}_low_elbow_extension`,
            title: 'Arm Not Fully Extended',
            description: `Your elbow angle at contact is ${elbowAngle.toFixed(1)}°. Full extension generates more power and control.`,
            severity: elbowAngle < 115 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['elbow', 'shoulder'],
            actualValue: elbowAngle,
            threshold,
            idealRange,
            correction:
                'Fully extend your hitting arm at contact. Think of reaching up and through the ball at the highest point.',
            youtubeUrl: YT.spikeContact.url,
            youtubeTitle: YT.spikeContact.title,
            drill: {
                name: 'Wall Touch Extension Drill',
                description:
                    'Stand arm-width from a wall, reach your hitting arm up the wall repeatedly, feeling full straightening each time.',
                duration: '3 minutes',
            },
            confidence: Math.min(1, (threshold - elbowAngle) / 25),
        };
    }
    return null;
}

function detectLowContactHeight(
    contactHeight: number | null,
    actionPrefix: string,
    threshold = 75
): DetectedFlaw | null {
    if (contactHeight === null || !Number.isFinite(contactHeight)) return null;
    if (contactHeight < threshold) {
        return {
            id: `${actionPrefix}_low_contact_height`,
            title: 'Low Contact Point',
            description: `Your contact height is ${contactHeight.toFixed(0)}% of body height — lower than ideal. Hitting higher improves angle and reduces blocking.`,
            severity: contactHeight < 60 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['shoulder', 'elbow', 'wrist'],
            actualValue: contactHeight,
            threshold,
            idealRange: '85–115% of body height',
            correction:
                'Jump earlier and reach at your maximum height. Time your approach so you contact the ball at the peak of your jump.',
            youtubeUrl: YT.spikeContact.url,
            youtubeTitle: YT.spikeContact.title,
            confidence: Math.min(1, (threshold - contactHeight) / 20),
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
            description: `Your body alignment score is ${score.toFixed(0)}/100. Excessive trunk lean reduces power transfer.`,
            severity: score < 35 ? 'high' : 'medium',
            category: 'balance',
            injuryRisk: score < 35,
            injuryDetails:
                score < 35
                    ? 'Extreme forward lean puts stress on the lower back and increases the risk of muscle strain during explosive movements.'
                    : undefined,
            affectedBodyParts: ['torso', 'hip'],
            actualValue: score,
            threshold: 55,
            idealRange: '70–100',
            correction:
                'Keep your torso upright as you approach. Lean forward slightly into the ball but avoid collapsing at the waist.',
            youtubeUrl: YT.bodyBalance.url,
            youtubeTitle: YT.bodyBalance.title,
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
            description: `Stability score is ${score.toFixed(0)}/100. Lateral hip sway is disrupting your power chain.`,
            severity: score < 40 ? 'high' : 'medium',
            category: 'balance',
            injuryRisk: score < 40,
            injuryDetails:
                score < 40
                    ? 'Significant lateral movement during explosive actions increases ankle-sprain and knee-injury risk.'
                    : undefined,
            affectedBodyParts: ['hip', 'ankle', 'knee'],
            actualValue: score,
            threshold: 60,
            idealRange: '75–100',
            correction:
                'Plant your feet firmly just before contact. Keep your hips square and drive power upward, not sideways.',
            youtubeUrl: YT.bodyBalance.url,
            youtubeTitle: YT.bodyBalance.title,
            confidence: Math.min(1, (60 - score) / 30),
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
            title: 'Insufficient Hip Rotation',
            description: `Trunk rotation detected is only ${trunkRotation.toFixed(1)}°. Full hip-shoulder separation adds power.`,
            severity: 'medium',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['hip', 'torso', 'shoulder'],
            actualValue: trunkRotation,
            threshold,
            idealRange: '25–60°',
            correction:
                'Load your hips during your approach step, then uncoil as your arm swings. Think "hips first, then arm."',
            youtubeUrl: YT.trunkRotation.url,
            youtubeTitle: YT.trunkRotation.title,
            confidence: Math.min(1, (threshold - trunkRotation) / 15),
        };
    }
    return null;
}

// ============================================================================
// Spike
// ============================================================================

function detectSpikeFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    const elbowFlaw = detectLowElbow(metrics.elbowAtContact ?? null, 'volleyball_spike');
    if (elbowFlaw) flaws.push(elbowFlaw);

    const heightFlaw = detectLowContactHeight(metrics.contactHeight ?? null, 'volleyball_spike', 78);
    if (heightFlaw) flaws.push(heightFlaw);

    // Low arm swing speed
    const armSwing = metrics.armSwingScore ?? null;
    if (armSwing !== null && Number.isFinite(armSwing) && armSwing < 45) {
        flaws.push({
            id: 'volleyball_spike_slow_arm_swing',
            title: 'Slow Arm Swing',
            description: `Arm swing score is ${armSwing.toFixed(0)}/100. More whip speed generates a harder spike.`,
            severity: armSwing < 25 ? 'high' : 'medium',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['shoulder', 'elbow', 'wrist'],
            actualValue: armSwing,
            threshold: 45,
            idealRange: '65–100',
            correction:
                'Accelerate your elbow pull-back before swinging through. Keep a relaxed wrist until contact, then snap.',
            youtubeUrl: YT.armSwing.url,
            youtubeTitle: YT.armSwing.title,
            drill: {
                name: 'Towel Snap Drill',
                description:
                    'Hold a small towel and practice arm-swing motion, focusing on a sharp wrist snap at the end.',
                duration: '3 minutes',
            },
            confidence: Math.min(1, (45 - armSwing) / 30),
        });
    }

    // Low jump
    const jumpHeight = metrics.jumpHeight ?? null;
    if (jumpHeight !== null && Number.isFinite(jumpHeight) && jumpHeight < 0.04) {
        flaws.push({
            id: 'volleyball_spike_low_jump',
            title: 'Low Spike Jump Height',
            description: `Jump height is ${(jumpHeight * 100).toFixed(1)}% of body height — limits attack angle.`,
            severity: 'low',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['knee', 'ankle'],
            actualValue: jumpHeight,
            threshold: 0.04,
            idealRange: '7–20% of body height',
            correction:
                'Use a full 3- or 4-step approach to build momentum. Plant hard on your last step and explode upward.',
            youtubeUrl: YT.jumpTraining.url,
            youtubeTitle: YT.jumpTraining.title,
            confidence: Math.min(1, (0.07 - jumpHeight) / 0.07),
        });
    }

    const rotationFlaw = detectLowTrunkRotation(metrics.trunkRotation ?? null, 'volleyball_spike');
    if (rotationFlaw) flaws.push(rotationFlaw);

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'volleyball_spike');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    const stabilityFlaw = detectLowStability(metrics.stability ?? null, 'volleyball_spike');
    if (stabilityFlaw) flaws.push(stabilityFlaw);

    return buildResult(flaws, 7, 'spike');
}

// ============================================================================
// Serve
// ============================================================================

function detectServeFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    const elbowFlaw = detectLowElbow(metrics.elbowAtContact ?? null, 'volleyball_serve', '155–175°', 135);
    if (elbowFlaw) flaws.push(elbowFlaw);

    const heightFlaw = detectLowContactHeight(metrics.contactHeight ?? null, 'volleyball_serve', 72);
    if (heightFlaw) flaws.push(heightFlaw);

    const rotationFlaw = detectLowTrunkRotation(metrics.trunkRotation ?? null, 'volleyball_serve', 12);
    if (rotationFlaw) flaws.push(rotationFlaw);

    const followThrough = metrics.followThrough ?? null;
    if (followThrough !== null && Number.isFinite(followThrough) && followThrough < 50) {
        flaws.push({
            id: 'volleyball_serve_poor_follow_through',
            title: 'Incomplete Follow-Through',
            description: `Follow-through score is ${followThrough.toFixed(0)}/100. Cutting short the swing reduces speed and consistency.`,
            severity: 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['elbow', 'wrist', 'shoulder'],
            actualValue: followThrough,
            threshold: 50,
            idealRange: '70–100',
            correction:
                'Let your arm continue across your body after contact. The follow-through should naturally pull you into a balanced ready position.',
            youtubeUrl: YT.serveTechnique.url,
            youtubeTitle: YT.serveTechnique.title,
            confidence: Math.min(1, (50 - followThrough) / 40),
        });
    }

    const stabilityFlaw = detectLowStability(metrics.stability ?? null, 'volleyball_serve');
    if (stabilityFlaw) flaws.push(stabilityFlaw);

    return buildResult(flaws, 5, 'serve');
}

// ============================================================================
// Block
// ============================================================================

function detectBlockFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    // Low jump
    const jumpHeight = metrics.jumpHeight ?? null;
    if (jumpHeight !== null && Number.isFinite(jumpHeight) && jumpHeight < 0.03) {
        flaws.push({
            id: 'volleyball_block_low_jump',
            title: 'Low Block Jump Height',
            description: `Jump height is ${(jumpHeight * 100).toFixed(1)}% of body height. Higher blocks are harder to tip around.`,
            severity: 'medium',
            category: 'power',
            injuryRisk: false,
            affectedBodyParts: ['knee', 'ankle'],
            actualValue: jumpHeight,
            threshold: 0.03,
            idealRange: '5–18% of body height',
            correction:
                "Bend knees lower into a ready squat before the block. Use a two-foot explosive jump timed with the attacker's arm swing.",
            youtubeUrl: YT.jumpTraining.url,
            youtubeTitle: YT.jumpTraining.title,
            confidence: Math.min(1, (0.05 - jumpHeight) / 0.05),
        });
    }

    // Low arm extension at block
    const armExtension = metrics.armExtension ?? null;
    if (armExtension !== null && Number.isFinite(armExtension) && armExtension < 140) {
        flaws.push({
            id: 'volleyball_block_low_arm_extension',
            title: 'Arms Not Fully Extended',
            description: `Average arm extension is ${armExtension.toFixed(1)}°. Straighter arms create a wider block surface.`,
            severity: armExtension < 115 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['elbow', 'shoulder'],
            actualValue: armExtension,
            threshold: 140,
            idealRange: '155–177°',
            correction:
                'Push your arms straight up over the net, pressing actively over rather than just reaching up.',
            youtubeUrl: YT.blockTechnique.url,
            youtubeTitle: YT.blockTechnique.title,
            confidence: Math.min(1, (140 - armExtension) / 30),
        });
    }

    // Low hand height
    const handHeight = metrics.handHeight ?? null;
    if (handHeight !== null && Number.isFinite(handHeight) && handHeight < 78) {
        flaws.push({
            id: 'volleyball_block_low_hand_height',
            title: 'Block Too Low',
            description: `Hand height at block is ${handHeight.toFixed(0)}% of body height. Higher hands reduce gaps for attacker.`,
            severity: 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['wrist', 'elbow', 'shoulder'],
            actualValue: handHeight,
            threshold: 78,
            idealRange: '85–115% of body height',
            correction:
                'Reach over the net as high as possible. Focus on a quick, snapping block motion to get maximum penetration.',
            youtubeUrl: YT.blockTechnique.url,
            youtubeTitle: YT.blockTechnique.title,
            confidence: Math.min(1, (78 - handHeight) / 20),
        });
    }

    // Poor hand symmetry
    const handSymmetry = metrics.handSymmetry ?? null;
    if (handSymmetry !== null && Number.isFinite(handSymmetry) && handSymmetry < 60) {
        flaws.push({
            id: 'volleyball_block_asymmetric_hands',
            title: 'Uneven Hand Position',
            description: `Hand symmetry is ${handSymmetry.toFixed(0)}/100. Uneven hands create gaps the attacker can exploit.`,
            severity: 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['wrist', 'elbow'],
            actualValue: handSymmetry,
            threshold: 60,
            idealRange: '80–100',
            correction:
                'Keep both hands at equal height with spread fingers. Think of forming a wall, not reaching with one hand.',
            youtubeUrl: YT.blockTechnique.url,
            youtubeTitle: YT.blockTechnique.title,
            confidence: Math.min(1, (60 - handSymmetry) / 30),
        });
    }

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'volleyball_block');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    return buildResult(flaws, 5, 'block');
}

// ============================================================================
// Set
// ============================================================================

function detectSetFlaws(input: FlawDetectionInput): FlawDetectionResult {
    const { metrics } = input;
    const flaws: DetectedFlaw[] = [];

    // Poor hand symmetry (critical for setting)
    const handSymmetry = metrics.handSymmetry ?? null;
    if (handSymmetry !== null && Number.isFinite(handSymmetry) && handSymmetry < 55) {
        flaws.push({
            id: 'volleyball_set_asymmetric_hands',
            title: 'Asymmetric Hand Contact',
            description: `Hand symmetry score is ${handSymmetry.toFixed(0)}/100. Uneven hands cause directional errors in your set.`,
            severity: handSymmetry < 35 ? 'high' : 'medium',
            category: 'form',
            injuryRisk: false,
            affectedBodyParts: ['wrist', 'elbow'],
            actualValue: handSymmetry,
            threshold: 55,
            idealRange: '80–100',
            correction:
                'Form a triangle with your thumbs and index fingers before contact. Both hands must touch the ball simultaneously.',
            youtubeUrl: YT.settingHands.url,
            youtubeTitle: YT.settingHands.title,
            drill: {
                name: 'Wall Setting Drill',
                description:
                    'Set a volleyball against a wall repeatedly. Focus on equal pressure from both hands and consistent release.',
                duration: '5 minutes',
            },
            confidence: Math.min(1, (55 - handSymmetry) / 30),
        });
    }

    // Elbow angle for setting (should be moderately bent, not locked or fully bent)
    const elbowAngle = metrics.elbowAngle ?? null;
    if (elbowAngle !== null && Number.isFinite(elbowAngle)) {
        if (elbowAngle < 70) {
            flaws.push({
                id: 'volleyball_set_elbow_too_bent',
                title: 'Arms Too Bent',
                description: `Elbow angle during set is only ${elbowAngle.toFixed(1)}°. Elbows should be comfortably bent, not cramped.`,
                severity: 'medium',
                category: 'form',
                injuryRisk: false,
                affectedBodyParts: ['elbow', 'shoulder'],
                actualValue: elbowAngle,
                threshold: 70,
                idealRange: '90–135°',
                correction:
                    'Keep your elbows out and forward, about shoulder width. Avoid pulling them into your body.',
                youtubeUrl: YT.settingHands.url,
                youtubeTitle: YT.settingHands.title,
                confidence: Math.min(1, (70 - elbowAngle) / 25),
            });
        } else if (elbowAngle > 155) {
            flaws.push({
                id: 'volleyball_set_elbow_too_straight',
                title: 'Arms Too Straight for Setting',
                description: `Elbow angle is ${elbowAngle.toFixed(1)}°. Straighter arms during the set reduce touch sensitivity.`,
                severity: 'low',
                category: 'form',
                injuryRisk: false,
                affectedBodyParts: ['elbow'],
                actualValue: elbowAngle,
                threshold: 155,
                idealRange: '90–135°',
                correction:
                    'Relax into a comfortable bend (like holding a ball above your head) to maintain touch and control.',
                youtubeUrl: YT.settingHands.url,
                youtubeTitle: YT.settingHands.title,
                confidence: Math.min(1, (elbowAngle - 155) / 20),
            });
        }
    }

    const alignmentFlaw = detectPoorBodyAlignment(metrics.bodyAlignment ?? null, 'volleyball_set');
    if (alignmentFlaw) flaws.push(alignmentFlaw);

    const stabilityFlaw = detectLowStability(metrics.stability ?? null, 'volleyball_set');
    if (stabilityFlaw) flaws.push(stabilityFlaw);

    return buildResult(flaws, 4, 'set');
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
            : `${flaws.length} flaw${flaws.length > 1 ? 's' : ''} detected in your volleyball ${action}.`;

    return { flaws, rulesEvaluated, overallInjuryRisk, summary };
}

// ============================================================================
// Main export
// ============================================================================

export function detectVolleyballFlaws(
    input: FlawDetectionInput
): FlawDetectionResult {
    const { action } = input;
    console.log('[VolleyballFlaws] Detecting flaws for action:', action);

    switch (action) {
        case 'spike': return detectSpikeFlaws(input);
        case 'serve': return detectServeFlaws(input);
        case 'block': return detectBlockFlaws(input);
        case 'set': return detectSetFlaws(input);
        default:
            console.warn('[VolleyballFlaws] Unknown action:', action);
            return {
                flaws: [],
                rulesEvaluated: 0,
                overallInjuryRisk: 'none',
                summary: `Flaw detection for volleyball action "${action}" is not supported.`,
            };
    }
}
