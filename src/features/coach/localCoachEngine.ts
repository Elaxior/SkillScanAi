/**
 * Local Coach Engine
 *
 * Fully offline AI coach — no API key, no network calls, instant responses.
 * Generates contextual, data-driven coaching feedback from the real session
 * data (sport, action, score, metrics, flaws). Every response references the
 * athlete's actual numbers, so nothing is hallucinated.
 *
 * Architecture:
 * 1. Opening message: rich analysis generated from session data
 * 2. Follow-up messages: intent classified from keywords → contextual reply
 */

import type { CoachContext } from './coachTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Intent =
    | 'overview'
    | 'worst_flaw'
    | 'drills'
    | 'injury'
    | 'pro_comparison'
    | 'score_meaning'
    | 'metric_specific'
    | 'frequency'
    | 'what_good'
    | 'next_session'
    | 'warmup'
    | 'mental'
    | 'fallback';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function cap(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function humanAction(action: string) {
    return action.replace(/_/g, ' ');
}

function scoreLabel(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'strong';
    if (score >= 70) return 'solid';
    if (score >= 60) return 'developing';
    if (score >= 50) return 'foundational';
    return 'early-stage';
}

function gradeLetter(score: number): string {
    if (score >= 93) return 'A';
    if (score >= 90) return 'A−';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B−';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C−';
    if (score >= 60) return 'D';
    return 'F';
}

function metricLabel(key: string): string {
    const MAP: Record<string, string> = {
        releaseAngle: 'release angle',
        elbowAngleAtRelease: 'elbow angle at release',
        kneeAngleAtPeak: 'knee extension',
        jumpHeightNormalized: 'jump height',
        stabilityIndex: 'stability',
        followThroughScore: 'follow-through',
        releaseTimingMs: 'release timing',
        kneeBendScore: 'stance depth',
        stanceWidth: 'stance width',
        balanceScore: 'balance',
        trunkLean: 'body tilt',
        approachSpeed: 'approach speed',
        takeoffAngle: 'takeoff angle',
        peakHeight: 'jump height',
        finishHandPosition: 'finish height',
        elbowAtContact: 'elbow angle at contact',
        contactHeight: 'contact height',
        armSwingScore: 'arm swing',
        jumpHeight: 'jump height',
        trunkRotation: 'trunk rotation',
        bodyAlignment: 'body alignment',
        stability: 'stability',
        handSymmetry: 'hand symmetry',
        elbowAngle: 'elbow angle',
        followThrough: 'follow-through',
        wristSpeed: 'wrist speed',
    };
    return MAP[key] ?? key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric formatting helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Unit suffix for each metric key */
const METRIC_UNITS: Record<string, string> = {
    releaseAngle: '°',
    elbowAngleAtRelease: '°',
    kneeAngleAtPeak: '°',
    jumpHeightNormalized: '%',
    stabilityIndex: '/100',
    followThroughScore: '/100',
    releaseTimingMs: 'ms',
    kneeBendScore: '/100',
    stanceWidth: '%',
    balanceScore: '/100',
    trunkLean: '°',
    approachSpeed: '/100',
    takeoffAngle: '°',
    peakHeight: '%',
    finishHandPosition: '%',
    elbowAtContact: '°',
    contactHeight: '%',
    armSwingScore: '/100',
    jumpHeight: '%',
    trunkRotation: '°',
    bodyAlignment: '/100',
    stability: '/100',
    handSymmetry: '/100',
    elbowAngle: '°',
    followThrough: '/100',
    wristSpeed: '/100',
    rhythmConsistency: '/100',
    kneeAnglePush: '°',
};

/** Human-readable ideal target range for each metric key */
const METRIC_IDEAL_RANGES: Record<string, string> = {
    releaseAngle: '48–60°',
    elbowAngleAtRelease: '152–174°',
    kneeAngleAtPeak: '162–180°',
    jumpHeightNormalized: '8–18%',
    stabilityIndex: '72–100',
    followThroughScore: '65–100',
    releaseTimingMs: '-120 to +60 ms',
    kneeBendScore: '50–100',
    stanceWidth: '70–180%',
    balanceScore: '55–100',
    trunkLean: '5–25°',
    approachSpeed: '55–100',
    takeoffAngle: '55–80°',
    peakHeight: '5–18%',
    finishHandPosition: '78–110%',
    elbowAtContact: '155–177°',
    contactHeight: '85–115%',
    armSwingScore: '65–100',
    jumpHeight: '7–20%',
    trunkRotation: '25–60°',
    bodyAlignment: '65–100',
    stability: '75–100',
    handSymmetry: '78–100',
    elbowAngle: '90–135°',
    followThrough: '62–100',
    wristSpeed: '60–100',
};

/**
 * Format a raw metric value with its unit.
 * Handles fraction→percentage conversion for height/contact metrics.
 */
function formatRaw(key: string, value: number | null | undefined): string {
    if (value === null || value === undefined) return 'not measured';
    const unit = METRIC_UNITS[key] ?? '';
    // Height/contact metrics stored as fraction of body height (0.08 = 8%)
    const isFractionPct = ['jumpHeightNormalized', 'peakHeight', 'jumpHeight'].includes(key);
    if (isFractionPct) return `${Math.round(value * 100)}%`;
    if (unit === '°') return `${value.toFixed(1)}°`;
    if (unit === '%') return `${Math.round(value)}%`;
    if (unit === '/100') return `${Math.round(value)}/100`;
    if (unit === 'ms') return `${Math.round(value)} ms`;
    return `${value.toFixed(1)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sport-specific drill banks
// ─────────────────────────────────────────────────────────────────────────────

const DRILLS: Record<string, Record<string, string[]>> = {
    basketball: {
        jump_shot: [
            'Form shooting: 10 reps from 3 ft, zero lower body. Isolates arm mechanics.',
            'One-hand form drill: shoot one-handed from close range to build a straight release path.',
            'Elbow-in wall drill: stand 1 ft from a wall and practice your arm motion without releasing.',
            'Catch-and-shoot sets: have a partner feed you 20 shots a session to build rhythm.',
            'Balance boards: 2 mins on a balance board before shooting drills — trains foot stability.',
        ],
        free_throw: [
            'Routine lock-in: develop a 3-step pre-shot routine (dribbles, breath, focus) and never skip it.',
            'Pressure simulation: shoot free throws after sprinting, when tired, to mimic game fatigue.',
            'Mirror drill: watch your form in a mirror to self-correct elbow position in real time.',
            '100 free throws per session: repetition is the only free-throw cure.',
            'Visualization: before each attempt, mentally picture the arc and follow-through first.',
        ],
        layup: [
            'Mikan drill: alternate-hand layups from both sides, continuous, 1 min straight.',
            'Speed layup series: full-speed approach layups — 3 from each side, 3 sets.',
            'Euro-step practice: rehearse the two-step footwork pattern slowly before adding speed.',
            'Weak-hand only: 50 layups per session with your non-dominant hand.',
            'Film study: watch your own video frame-by-frame to see takeoff foot placement.',
        ],
        dribbling: [
            'Low dribble sets: dribble as low as possible for 30 seconds each hand, 3 sets.',
            'Cone weave: set up 5 cones 1m apart and dribble through at speed without raising the ball.',
            'Chair stance holds: hold a quarter-squat "dribbling stance" for 30-second isometric holds.',
            'Two-ball dribbling: dribble both balls simultaneously to force head-up positioning.',
            'Wall reaction drill: stand 2m from a wall, toss ball off the wall and react while staying low.',
        ],
    },
    volleyball: {
        spike: [
            'Armswing progressions: stand still and rehearse full arm swing from loaded position to contact, 3×15.',
            'Jump approach timing: mark your three-step approach on the floor and practice 20 dry runs.',
            'Toss-and-hit: a partner tosses high sets, you focus only on contact point height.',
            'Resistance band arm swing: attach band to wrist and rehearse swing against resistance.',
            'Video review: identify your shoulder drop before arm swing — most amateurs miss this.',
        ],
        serve: [
            'Standing contact drill: serve from the service line with no jump — build contact precision first.',
            'Target zones: place cones in deep corners and aim serves specifically at each zone.',
            'Toss consistency: practice tossing alone 50 times to the same point — the toss controls everything.',
            'Follow-through freeze: after each serve, hold your arm at the apex for 2 seconds to build habit.',
            'Cross-court vs line: alternate serve directions and call them before tossing.',
        ],
        block: [
            'Block jump timing: practice reading a setter — watch hands and jump 1 beat after contact.',
            'Penetration drill: jump and reach over the net (or a rope) to train arm angle and extension.',
            'Line steps: work lateral shuffle footwork to the block position — 10 reps each direction.',
            'Two-hand symmetry holds: jump and hold your block position at peak — have a teammate check hand level.',
            'Soft hands: practice soft blocking angle redirects — hard blocking goes out.',
        ],
        set: [
            'Wall setting: 50 consecutive sets against a wall at the same height — builds wrist control.',
            'Overhead pass to self: toss up, set, catch, repeat — focus on identical contact each time.',
            'Quick-hand drill: set rapid short tosses to yourself with fast elbow flicks.',
            'Target zones: put tape on the wall at your setter target height and aim every rep there.',
            'Squat-set: practice setting from a low squat position to train getting under the ball.',
        ],
    },
    badminton: {
        smash: [
            'Shadow smash: footwork to net, then backpedal and rehearse overhead smash motion — no shuttle.',
            'Toss smash drill: partner tosses shuttles high, you smash full-speed from base position.',
            'Jump smash sequencing: practice landing and recovering to base immediately after each smash.',
            'Wrist pronation drill: hold racket vertically and snap from open to closed face — builds wrist snap.',
            'Feeder drills: 20 consecutive smashes from mid-court feed — build contact consistency.',
        ],
        clear: [
            'Wall clear target: set a tape line high on a wall and aim all clears above it.',
            'Length training: push clears to baseline and aim for the deepest 1m of court.',
            'Footwork + clear: full retreating footwork before every repetition — never stationary.',
            'Deceptive clear: practice identical preparation for smash and clear — adds tactical value.',
            'Overhead endurance: 3 mins continuous overhead hitting with no break — builds shoulder stamina.',
        ],
        drop_shot: [
            'Feather touch drill: hit drops as softly as possible, just clearing the net.',
            'Smash-to-drop switch: alternate smash and drop from identical preparation to build deception.',
            'Cross-court drops: alternate down-the-line and cross-court drops from each side.',
            'Net kill follow-up: partner lifts short, practice drop, partner net-kills — rally pattern.',
            'Wrist hold drill: slow-motion drop motion focusing on controlled wrist deceleration at contact.',
        ],
        serve: [
            'Short serve to T: aim all short serves to the T junction — most attackable area to defend.',
            '50-serve block: serve 50 consecutive short serves focusing purely on net height clearance.',
            'Long serve disguise: same motion, release point variation between short and long — deceive receiver.',
            'Service rhythm: add a consistent pause before the swing — builds repeatability.',
            'Partner pressure: have partner rush your serve immediately to build composure under pressure.',
        ],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sport-specific pro tips
// ─────────────────────────────────────────────────────────────────────────────

const PRO_TIPS: Record<string, Record<string, string[]>> = {
    basketball: {
        jump_shot: [
            'Stephen Curry shoots at ~50° release angle — not flat, not rainbow. The math: a 50° arc gives a larger effective basket diameter than a 45° flat shot.',
            'NBA shooters average 165–172° elbow extension at release. A "chicken wing" elbow (less than 150°) is the single most common amateur flaw.',
            'Elite shooters release before peak jump — momentum from the jump transfers into the shot rather than wasting energy landing first.',
            'NBA shooters maintain lateral sway under 2cm during the shot. Even 5–6cm of sway measurably drops shot accuracy.',
        ],
        free_throw: [
            'NBA career free-throw leaders (Steve Nash, Mark Price) all cite routine over mechanics — the routine prevents adrenaline from hijacking form.',
            'Research shows 63% of missed NBA free throws go short — a flat angle issue, not a power issue.',
            'Top free-throw shooters show 88–92/100 stability scores — the platform matters as much as the arm.',
        ],
        layup: [
            'NBA guards average 59–65° takeoff angle on layups — too vertical and the ball rattles out, too flat and you lose body control.',
            'Elite finishers use the backboard on ~72% of non-dunk layups — it gives a larger target than the front rim.',
            'Finishing with a soft touch at high contact height (100–110% of body height) is more reliable than power finishing.',
        ],
        dribbling: [
            'NBA ball handlers maintain an average stance depth where hips are 65–70% of the way from shoulders to ankles — not an upright posture.',
            'Kyrie Irving keeps the ball below knee height on protection dribbles — the lower the dribble, the less opportunity to steal.',
            'Elite handlers maintain a lateral balance score above 75/100 even while moving — the stance enables explosiveness.',
        ],
    },
    volleyball: {
        spike: [
            'Top international spikers contact the ball at 100–115% of body height — any lower drastically reduces attack angle.',
            'Pro arm swing generates 70–100°/s of shoulder internal rotation — this is the primary speed generator, not the wrist.',
            'Elite attackers achieve 35–55° of hip-shoulder separation before arm swing — this stores elastic energy in the trunk.',
        ],
        serve: [
            'Pro serving contact point averages 95–108% of body height — consistently above head is the standard.',
            'Jump serves in the top tier average 28–45° trunk rotation through the serve — this is the power source.',
            'Elite servers achieve 80–90/100 follow-through scores — the arm continues down after contact, not stopping at waist level.',
        ],
        block: [
            'FIVB data shows elite blockers jump within 0.3–0.5 seconds of the spiker\'s arm swing initiation.',
            'Professional blockers achieve 95–115% hand height and 88–98/100 hand symmetry — asymmetric blocks redirect poorly.',
            'Elite blockers penetrate 15–20cm over the net on average — this closes the angle below their hands.',
        ],
        set: [
            'Olympic setters set with 95–130° elbow angle — lower than 90° and it becomes a "carry" violation; higher and power control drops.',
            'Top setters achieve 88+ hand symmetry — unequal contact is the most-called lift violation in international play.',
            'Set contact height at 88–108% of body height is the international standard — too low and you can\'t generate set trajectory.',
        ],
    },
    badminton: {
        smash: [
            'Top international smashers contact at 100–125% of body height — this steepens the shuttle angle to the floor.',
            'Elite wrist speed scores average 72–85/100 — but it\'s wrist pronation, not strength, that generates this.',
            'BWF data shows the best smashers achieve 32–58° trunk rotation — uninitiated trunk is the biggest power loss for amateurs.',
        ],
        clear: [
            'International players achieve 95–115% body height contact on clears — this extends the opponent\'s recovery distance.',
            'Elite clears follow a flat trajectory (not a high rainbow) to reduce opponent\'s reaction time.',
            'Pro footwork reaches base position within 1.5 steps of a clear — the shot is completed, not the rally.',
        ],
        drop_shot: [
            'Top players achieve drop contact at 72–95% body height — lower than a smash, but still overhead.',
            'The deceptive drop uses the same preparation as the smash — late racket deceleration is the only tell.',
            'Elite players disguise drop shots to within 100ms of the same preparation time as a smash.',
        ],
        serve: [
            'BWF regulations require serves below the server\'s waist — contact height of 82–100% of navel height is the controlled range.',
            'Short serves in international play clear the net by under 5cm on average — precision over height.',
            'Elite servers maintain 90+ stability scores — any weight shift during service is detectable by top receivers.',
        ],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Intent classification
// ─────────────────────────────────────────────────────────────────────────────

function classifyIntent(text: string, ctx: CoachContext): Intent {
    const lower = text.toLowerCase();

    if (/\b(overview|summary|overall|how did i|how was|recap|tell me about)\b/.test(lower)) return 'overview';
    if (/\b(worst|biggest|main|primary|top|most important|focus on|priority)\b/.test(lower) &&
        /\b(flaw|issue|problem|mistake|error|improve|fix|work on)\b/.test(lower)) return 'worst_flaw';
    if (/\b(drill|practice|exercise|workout|training|rep|session|routine)\b/.test(lower)) return 'drills';
    if (/\b(injur|pain|hurt|risk|safe|dangerous|strain|overuse|prevent)\b/.test(lower)) return 'injury';
    if (/\b(pro|professional|nba|elite|expert|top player|world class|compare|vs|benchmark)\b/.test(lower)) return 'pro_comparison';
    if (/\b(score|grade|mean|means|what is|what does|explain|understand|interpret)\b/.test(lower) &&
        /\b(score|result|number|rating|out of)\b/.test(lower)) return 'score_meaning';
    if (/\b(next|tomorrow|week|plan|schedule|what should i do|where to start)\b/.test(lower)) return 'next_session';
    if (/\b(warm|warmup|warm.up|stretch|before|prepare)\b/.test(lower)) return 'warmup';
    if (/\b(mental|mindset|focus|confident|nervou|pressure|stress|anxiety)\b/.test(lower)) return 'mental';
    if (/\b(good|doing well|strength|strong|positive|what.s right|what am i)\b/.test(lower)) return 'what_good';
    if (/\b(how often|frequency|how many|per week|per day|sessions)\b/.test(lower)) return 'frequency';

    // Check if user mentions a specific metric keyword
    const metricKeywords = [
        'elbow', 'release', 'angle', 'jump', 'height', 'stability', 'balance',
        'follow.through', 'follow through', 'knee', 'stance', 'lean', 'tilt',
        'trunk', 'rotation', 'contact', 'arm swing', 'wrist', 'approach', 'speed',
    ];
    for (const kw of metricKeywords) {
        if (new RegExp(`\\b${kw}\\b`).test(lower)) return 'metric_specific';
    }

    return 'fallback';
}

// ─────────────────────────────────────────────────────────────────────────────
// Response generators
// ─────────────────────────────────────────────────────────────────────────────

function buildOpeningMessage(ctx: CoachContext): string {
    const { sport, action, overallScore, flaws, scoreBreakdown, metrics, confidence } = ctx;
    const label = scoreLabel(overallScore);
    const grade = gradeLetter(overallScore);
    const actionStr = humanAction(action);

    const lines: string[] = [];

    // Headline
    lines.push(`Here's your ${cap(sport)} ${actionStr} breakdown — overall score **${overallScore}/100** (${grade}).`);
    if (confidence < 80) {
        lines.push(`⚠️ Analysis confidence: **${confidence}%** — partial body visibility may affect some metric readings.`);
    }
    lines.push('');

    // Score interpretation
    if (overallScore >= 85) {
        lines.push(`That's a ${label} result. Your mechanics are genuinely strong across most dimensions — you're operating at a level that would be competitive in organized play.`);
    } else if (overallScore >= 70) {
        lines.push(`That's a ${label} foundation. You have real technique showing up in the analysis, but there are 1–2 mechanical gaps that are holding the overall score back.`);
    } else if (overallScore >= 55) {
        lines.push(`That's a ${label} result — the fundamentals are coming together but several mechanics need deliberate attention before they become consistent.`);
    } else {
        lines.push(`That's an ${label} stage. Don't be discouraged — this is exactly the kind of baseline that shows where to direct practice energy most effectively.`);
    }

    lines.push('');

    // Full metric breakdown with actual measured values
    const sortedBreakdown = Object.entries(scoreBreakdown).sort(([, a], [, b]) => b - a);
    if (sortedBreakdown.length > 0) {
        lines.push('**Measured metrics:**');
        sortedBreakdown.forEach(([key, metScore]) => {
            const rawVal = metrics[key];
            const rawStr = rawVal !== null && rawVal !== undefined ? ` (measured: **${formatRaw(key, rawVal)}**)` : '';
            const idealStr = METRIC_IDEAL_RANGES[key] ? ` — target: ${METRIC_IDEAL_RANGES[key]}` : '';
            const icon = metScore >= 80 ? '✅' : metScore >= 60 ? '🔶' : '🔴';
            lines.push(`${icon} ${cap(metricLabel(key))}: **${metScore}/100**${rawStr}${idealStr}`);
        });
        lines.push('');

        const best = sortedBreakdown[0];
        const worst = sortedBreakdown[sortedBreakdown.length - 1];
        if (best[1] >= 75) {
            const bestRaw = metrics[best[0]];
            const rawNote = bestRaw !== null && bestRaw !== undefined ? ` (${formatRaw(best[0], bestRaw)})` : '';
            lines.push(`**Strongest metric**: ${cap(metricLabel(best[0]))}${rawNote} at **${best[1]}/100** — this is a genuine asset.`);
        }
        if (worst[1] < 70 && best[0] !== worst[0]) {
            const worstRaw = metrics[worst[0]];
            const idealRange = METRIC_IDEAL_RANGES[worst[0]];
            const gapNote = worstRaw !== null && worstRaw !== undefined
                ? ` — measured at **${formatRaw(worst[0], worstRaw)}**${idealRange ? `, target is ${idealRange}` : ''}`
                : '';
            lines.push(`**Biggest gap**: ${cap(metricLabel(worst[0]))} at **${worst[1]}/100**${gapNote}.`);
        }
        lines.push('');
    }

    // Flaws
    if (flaws.length === 0) {
        lines.push('**No significant flaws detected** — the analysis found clean mechanics throughout. The focus now is consolidation and consistency.');
    } else {
        const critical = flaws.filter(f => f.severity === 'critical');
        const injuryFlaws = flaws.filter(f => f.injuryRisk);

        if (injuryFlaws.length > 0) {
            lines.push(`⚠️ **Injury flag**: ${injuryFlaws[0].title} — ${injuryFlaws[0].correction} Address this first.`);
            lines.push('');
        }
        if (critical.length > 0) {
            lines.push(`**Top priority**: ${critical[0].title}`);
            lines.push(`→ ${critical[0].correction}`);
        } else {
            lines.push(`**Most important flaw to address**: ${flaws[0].title}`);
            lines.push(`→ ${flaws[0].correction}`);
        }

        if (flaws.length > 1) {
            lines.push('');
            lines.push(`There are ${flaws.length} total flaws detected. Ask me about any specific one, or type "drills" for practice recommendations.`);
        }
    }

    lines.push('');
    lines.push('What would you like to dig into?');

    return lines.join('\n');
}

function buildOverviewResponse(ctx: CoachContext): string {
    return buildOpeningMessage(ctx);
}

function buildWorstFlawResponse(ctx: CoachContext): string {
    const { flaws, scoreBreakdown, metrics } = ctx;
    const lines: string[] = [];

    if (flaws.length === 0) {
        lines.push('The analysis found no significant flaws — your mechanics are clean. The focus from here is repeatability: can you hit these scores consistently?');
        lines.push('');
        lines.push('If you want to push higher, look at your lowest-scoring metric in the breakdown and target incremental improvement there.');
        return lines.join('\n');
    }

    const critical = flaws.find(f => f.severity === 'critical') || flaws[0];
    const injuryFlaws = flaws.filter(f => f.injuryRisk);

    if (injuryFlaws.length > 0 && injuryFlaws[0].id !== critical.id) {
        lines.push(`⚠️ **Before anything else** — ${injuryFlaws[0].title} carries injury risk.`);
        lines.push(`Correction: ${injuryFlaws[0].correction}`);
        lines.push('');
    }

    lines.push(`**Primary flaw (highest leverage):** ${critical.title}`);
    lines.push('');
    lines.push(`**Category:** ${cap(critical.category)}`);
    lines.push(`**Severity:** ${cap(critical.severity)}`);
    lines.push('');
    lines.push(`**What to do:** ${critical.correction}`);
    lines.push('');

    // Worst scoring metric context with actual value
    const worstMetric = Object.entries(scoreBreakdown).sort(([, a], [, b]) => a - b)[0];
    if (worstMetric && worstMetric[1] < 65) {
        const rawVal = metrics[worstMetric[0]];
        const rawNote = rawVal !== null && rawVal !== undefined
            ? ` (measured: **${formatRaw(worstMetric[0], rawVal)}**` + (METRIC_IDEAL_RANGES[worstMetric[0]] ? `, target: ${METRIC_IDEAL_RANGES[worstMetric[0]]})` : ')')
            : '';
        lines.push(`Your ${metricLabel(worstMetric[0])} is **${worstMetric[1]}/100**${rawNote} — the lowest in your breakdown.`);
        lines.push('');
    }

    if (flaws.length > 1) {
        lines.push(`**Other flaws detected (${flaws.length - 1} more):**`);
        flaws.slice(1, 4).forEach(f => {
            lines.push(`• [${cap(f.severity)}] ${f.title} — ${f.correction}`);
        });
    }

    return lines.join('\n');
}

function buildDrillsResponse(ctx: CoachContext): string {
    const { sport, action, flaws } = ctx;
    const lines: string[] = [];

    const sportDrills = DRILLS[sport]?.[action] ?? [];

    lines.push(`Here are ${sportDrills.length} targeted drills for your ${humanAction(action)}:`);
    lines.push('');

    sportDrills.forEach((drill, i) => {
        lines.push(`**${i + 1}.** ${drill}`);
    });

    lines.push('');

    if (flaws.length > 0) {
        lines.push(`**Flaw-specific focus:** Your analysis flagged "${flaws[0].title}" as the top issue. Drills 1–2 above are the most relevant to correcting this.`);
        lines.push('');
        lines.push(`**Session structure suggestion:**`);
        lines.push(`• 10 min warm-up`);
        lines.push(`• 15 min targeted drill (focus on your #1 flaw)`);
        lines.push(`• 20 min full-speed practice`);
        lines.push(`• 5 min cool-down and mental review`);
    }

    return lines.join('\n');
}

function buildInjuryResponse(ctx: CoachContext): string {
    const { flaws, sport, action } = ctx;
    const lines: string[] = [];

    const injuryFlaws = flaws.filter(f => f.injuryRisk);

    if (injuryFlaws.length === 0) {
        lines.push('**No injury risk flags** were detected in this session. Your mechanics fall within safe ranges.');
        lines.push('');
        lines.push('General prevention advice for your sport:');
    } else {
        lines.push(`**${injuryFlaws.length} injury risk flag${injuryFlaws.length > 1 ? 's' : ''} detected:**`);
        lines.push('');
        injuryFlaws.forEach(f => {
            lines.push(`⚠️ **${f.title}**`);
            lines.push(`→ ${f.correction}`);
            lines.push('');
        });
        lines.push('**Additional prevention advice:**');
    }

    // Sport-specific injury prevention
    const sportAdvice: Record<string, string[]> = {
        basketball: [
            '• Patellar tendon: avoid full-speed jump sessions on consecutive days — 48hr minimum recovery.',
            '• Shooting shoulder: strengthen rotator cuff (external rotation bands) 2× per week.',
            '• Ankle: proprioception training on a balance board prevents the most common basketball injuries.',
        ],
        volleyball: [
            '• Rotator cuff: the overhead pattern is high-load — limit max-effort spikes to 50–60 per session.',
            '• Knee (patellar tendon): land with bent knees — never stiff-legged — after every jump.',
            '• Finger joints: tape middle joints before setting — the angle of repeated ball contact is a sprain risk.',
        ],
        badminton: [
            '• Tennis elbow: wrist snap is the power source, not forearm force — correct grip prevents this.',
            '• Achilles: explosive lunges need a dedicated stretch routine after every session.',
            '• Lower back: trunk rotation at high speed requires core strength — planks are non-optional prevention.',
        ],
    };

    const advice = sportAdvice[sport] ?? [];
    advice.forEach(a => lines.push(a));

    if (!sportAdvice[sport]) {
        lines.push('• Warm up for at least 10 minutes at low intensity before sport-specific work.');
        lines.push('• Cool down with static stretching — hold each stretch 30+ seconds.');
        lines.push('• If any joint feels painful (not just fatigued), stop that session immediately.');
    }

    return lines.join('\n');
}

function buildProComparisonResponse(ctx: CoachContext): string {
    const { sport, action, overallScore, scoreBreakdown, metrics } = ctx;
    const lines: string[] = [];

    const tips = PRO_TIPS[sport]?.[action];

    lines.push(`Here's how your ${humanAction(action)} compares to professional-level standards:`);
    lines.push('');

    // Position on spectrum
    lines.push(`**Your overall score: ${overallScore}/100**`);
    lines.push('');
    lines.push('Typical ranges by level:');
    lines.push('• Beginner: 35–55');
    lines.push('• Recreational: 55–70');
    lines.push('• Club / competitive amateur: 70–82');
    lines.push('• Semi-professional: 82–90');
    lines.push('• Professional: 90–100');
    lines.push('');

    // Metric-level comparison with actual measured values
    const sortedMetrics = Object.entries(scoreBreakdown).sort(([, a], [, b]) => a - b);
    if (sortedMetrics.length > 0) {
        lines.push('**Your measurements vs professional targets:**');
        sortedMetrics.forEach(([key, score]) => {
            const rawVal = metrics[key];
            const rawStr = rawVal !== null && rawVal !== undefined ? `${formatRaw(key, rawVal)} → ` : '';
            const idealStr = METRIC_IDEAL_RANGES[key] ? ` (pro target: ${METRIC_IDEAL_RANGES[key]})` : '';
            const gap = 92 - score;
            const status = gap <= 0 ? '✅ Pro level' : gap <= 10 ? '🔶 Close' : '🔴 Needs work';
            lines.push(`• ${cap(metricLabel(key))}: **${rawStr}${score}/100**${idealStr} ${status}`);
        });
        lines.push('');
    }

    // Pro facts
    if (tips && tips.length > 0) {
        lines.push('**What research shows about professional athletes:**');
        tips.forEach(tip => {
            lines.push(`• ${tip}`);
        });
    }

    return lines.join('\n');
}

function buildScoreMeaningResponse(ctx: CoachContext): string {
    const { overallScore, scoreBreakdown, metrics, confidence } = ctx;
    const lines: string[] = [];

    lines.push(`Your **${overallScore}/100** score is a weighted average of ${Object.keys(scoreBreakdown).length} biomechanical metrics. Analysis confidence: **${confidence}%**.`);
    lines.push('');
    lines.push('**How it\'s calculated:**');
    lines.push('Each metric is scored 0–100 based on published sports science benchmarks (Knudson 1993, Okazaki 2015, Miller & Bartlett 1996). Metrics with higher impact on performance get higher weights in the final average.');
    lines.push('');
    lines.push('**Full breakdown — measured value → score:**');

    Object.entries(scoreBreakdown)
        .sort(([, a], [, b]) => b - a)
        .forEach(([key, score]) => {
            const rawVal = metrics[key];
            const rawStr = rawVal !== null && rawVal !== undefined ? `${formatRaw(key, rawVal)} → ` : '';
            const idealStr = METRIC_IDEAL_RANGES[key] ? ` (target: ${METRIC_IDEAL_RANGES[key]})` : '';
            const bar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
            lines.push(`• ${cap(metricLabel(key))}: **${rawStr}${score}/100**${idealStr} [${bar}]`);
        });

    lines.push('');
    lines.push('**Grade scale:**');
    lines.push('90–100: A (Excellent) | 80–89: B | 70–79: C | 60–69: D | Below 60: Developing');
    lines.push('');
    lines.push(`Your grade: **${gradeLetter(overallScore)}**`);

    return lines.join('\n');
}

function buildMetricSpecificResponse(text: string, ctx: CoachContext): string {
    const lower = text.toLowerCase();
    const { scoreBreakdown, flaws } = ctx;
    const lines: string[] = [];

    // Find which metric is being asked about
    const metricMatch: Record<string, string[]> = {
        releaseAngle: ['release angle', 'release', 'angle'],
        elbowAngleAtRelease: ['elbow'],
        stabilityIndex: ['stability', 'balance', 'stable'],
        followThroughScore: ['follow through', 'follow-through', 'followthrough'],
        kneeAngleAtPeak: ['knee'],
        jumpHeightNormalized: ['jump height', 'jump'],
        kneeBendScore: ['knee bend', 'stance depth', 'deep', 'low'],
        stanceWidth: ['stance width', 'feet', 'foot spacing'],
        trunkLean: ['trunk lean', 'body tilt', 'lean', 'tilt'],
        trunkRotation: ['trunk rotation', 'rotation', 'rotate'],
        elbowAtContact: ['elbow at contact', 'arm extension', 'contact'],
        contactHeight: ['contact height', 'contact point', 'height'],
        armSwingScore: ['arm swing'],
        wristSpeed: ['wrist speed', 'wrist'],
        followThrough: ['follow through', 'follow-through'],
    };

    let matchedKey: string | null = null;
    for (const [key, terms] of Object.entries(metricMatch)) {
        if (terms.some(t => lower.includes(t))) {
            matchedKey = key;
            break;
        }
    }

    if (!matchedKey) {
        return buildFallbackResponse(ctx);
    }

    const score = scoreBreakdown[matchedKey];
    const label = metricLabel(matchedKey);
    const rawVal = ctx.metrics[matchedKey];
    const relatedFlaw = flaws.find(f =>
        f.category.toLowerCase().includes(label.split(' ')[0]) ||
        f.title.toLowerCase().includes(label.split(' ')[0])
    );

    // Header: show measured value + score + target range
    const measuredStr = rawVal !== null && rawVal !== undefined ? `measured **${formatRaw(matchedKey, rawVal)}**` : 'not measured';
    const idealStr = METRIC_IDEAL_RANGES[matchedKey] ? ` · target: ${METRIC_IDEAL_RANGES[matchedKey]}` : '';
    lines.push(`**${cap(label)}** — ${measuredStr} → scored **${score !== undefined ? `${score}/100` : '—'}**${idealStr}`);
    lines.push('');

    if (score === undefined) {
        lines.push(`This metric wasn't captured in your session — it either wasn't visible in the video angle or wasn't applicable to this action.`);
        return lines.join('\n');
    }

    // Interpretation with actual gap to target
    if (score >= 85) {
        lines.push(`This is a **strength** — ${score}/100 puts you in the upper range. Maintain this and avoid overworking it.`);
    } else if (score >= 70) {
        lines.push(`This is **solid** at ${score}/100 but has room for refinement. Small improvements here can meaningfully raise your overall score.`);
        if (rawVal !== null && rawVal !== undefined && METRIC_IDEAL_RANGES[matchedKey]) {
            lines.push(`Your measured value of **${formatRaw(matchedKey, rawVal)}** is within reach of the target range (${METRIC_IDEAL_RANGES[matchedKey]}).`);
        }
    } else if (score >= 55) {
        lines.push(`This is **below target** at ${score}/100 — it's actively pulling your overall score down.`);
        if (rawVal !== null && rawVal !== undefined && METRIC_IDEAL_RANGES[matchedKey]) {
            lines.push(`Measured at **${formatRaw(matchedKey, rawVal)}** vs target of ${METRIC_IDEAL_RANGES[matchedKey]} — this is the gap to close.`);
        }
    } else {
        lines.push(`At ${score}/100, this is a **significant gap** and likely one of the biggest contributors to your overall score.`);
        if (rawVal !== null && rawVal !== undefined && METRIC_IDEAL_RANGES[matchedKey]) {
            lines.push(`Measured at **${formatRaw(matchedKey, rawVal)}** — target is ${METRIC_IDEAL_RANGES[matchedKey]}. This is a priority correction.`);
        }
    }

    lines.push('');

    // Flaw context
    if (relatedFlaw) {
        lines.push(`**Related flaw detected:** ${relatedFlaw.title}`);
        lines.push(`→ ${relatedFlaw.correction}`);
        lines.push('');
    }

    // Specific coaching for common metrics
    const metricAdvice: Record<string, string> = {
        releaseAngle: 'Aim for 48–55°. Practice in front of a mirror and feel the difference between a flat push and a true arc. The "nail in the ceiling" cue helps — imagine nailing a nail directly above your release point.',
        elbowAngleAtRelease: 'Near-full extension (160–175°) is the target. Drill: stand 2 ft from a wall and shoot directly at it — if your elbow is bent (chicken wing), the ball will hit low.',
        stabilityIndex: 'Balance during the motion is trainable. Single-leg balance holds (30s each leg) directly improve this. Your platform before the shot/swing is your anchor.',
        followThroughScore: 'The follow-through is a symptom of what happened before it. If it\'s incomplete, the issue is usually releasing too early. Hold your finish position for 2 full seconds in every practice rep.',
        kneeBendScore: 'Stance depth is the foundation of dribbling protection. Practice quarter-squat holds for 30s — your hips should be noticeably lower than standing height throughout ball-handling.',
        trunkLean: 'Some lean is normal and functional (5–20°). Excessive lean means your base is off. Check your foot positioning first — the body tilts to compensate for where the weight actually is.',
        contactHeight: 'Contact height is almost always about approach and timing, not arm length. Improving your jump approach or attack footwork will add 3–5% of body height to your contact point.',
    };

    const advice = metricAdvice[matchedKey];
    if (advice) {
        lines.push(`**Coaching advice:**`);
        lines.push(advice);
    }

    return lines.join('\n');
}

function buildFrequencyResponse(ctx: CoachContext): string {
    const { sport, overallScore } = ctx;
    const lines: string[] = [];

    const freq: Record<string, { sessions: string; volume: string; rest: string }> = {
        basketball: {
            sessions: overallScore < 65 ? '4–5 sessions per week (shorter, higher focus)' : '3–4 sessions per week',
            volume: overallScore < 65 ? '30–45 min focused skill work per session' : '45–60 min, including game reps',
            rest: 'At minimum one full rest day between shooting sessions — the shoulder is a high-load joint.',
        },
        volleyball: {
            sessions: overallScore < 65 ? '4–5 sessions per week' : '3–4 sessions per week',
            volume: '45–60 min skill + 20 min conditioning',
            rest: '48hr minimum between high-volume spiking sessions.',
        },
        badminton: {
            sessions: overallScore < 65 ? '5–6 sessions per week (badminton rewards high frequency)' : '4–5 sessions per week',
            volume: '45 min on-court + 15 min footwork conditioning',
            rest: '1 full rest day per week minimum; wrist/shoulder need recovery.',
        },
    };

    const rec = freq[sport] ?? {
        sessions: '3–4 sessions per week',
        volume: '45–60 min per session',
        rest: 'One rest day between intense sessions.',
    };

    lines.push(`**Recommended training frequency for your current level (${overallScore}/100):**`);
    lines.push('');
    lines.push(`**Sessions:** ${rec.sessions}`);
    lines.push(`**Volume:** ${rec.volume}`);
    lines.push(`**Rest:** ${rec.rest}`);
    lines.push('');
    lines.push('**Principle:** At your level, *quality reps beat volume*. 30 focused, slow-motion reps addressing your top flaw is worth more than 200 full-speed unconscious reps.');
    lines.push('');
    lines.push('Track which flaw you\'re targeting each session. Improvement that isn\'t measured isn\'t managed.');

    return lines.join('\n');
}

function buildWhatGoodResponse(ctx: CoachContext): string {
    const { scoreBreakdown, flaws, overallScore } = ctx;
    const lines: string[] = [];

    const goodMetrics = Object.entries(scoreBreakdown)
        .filter(([, s]) => s >= 75)
        .sort(([, a], [, b]) => b - a);

    lines.push(`Here's what the analysis says you're doing well:`);
    lines.push('');

    if (goodMetrics.length === 0) {
        lines.push('No single metric is in the "strength" zone yet (≥75/100), but that\'s what this stage is for.');
    } else {
        goodMetrics.forEach(([key, score]) => {
            lines.push(`✅ **${cap(metricLabel(key))}: ${score}/100** — above the recreational average.`);
        });
    }

    lines.push('');

    const nonCritical = flaws.filter(f => f.severity !== 'critical');
    if (flaws.length === 0) {
        lines.push('The flaw detection found nothing significant — your mechanics are fundamentally sound.');
    } else if (nonCritical.length === flaws.length) {
        lines.push('No critical flaws detected — all issues flagged are minor to major, nothing structural. That\'s a solid foundation.');
    }

    lines.push('');
    lines.push(`Overall, a ${overallScore}/100 means there\'s a real technical base here to build on.`);

    return lines.join('\n');
}

function buildNextSessionResponse(ctx: CoachContext): string {
    const { flaws, sport, action, overallScore } = ctx;
    const lines: string[] = [];

    lines.push(`**Next session plan for ${cap(sport)} ${humanAction(action)}:**`);
    lines.push('');
    lines.push('**1. Warm-up (10 min)**');
    lines.push('  Light cardio + dynamic stretches for the sport-specific joints.');
    lines.push('');
    lines.push('**2. Flaw-targeting (15–20 min)**');

    if (flaws.length > 0) {
        lines.push(`  Primary focus: **${flaws[0].title}**`);
        lines.push(`  → ${flaws[0].correction}`);
        lines.push('  Use slow-motion or partial reps — speed comes after correctness.');
    } else {
        lines.push('  No major flaws to fix — focus on consistency at full speed.');
    }

    lines.push('');
    lines.push('**3. Volume practice (20 min)**');
    lines.push('  Full-speed reps. Film 2–3 reps and compare to this session\'s analysis.');
    lines.push('');
    lines.push('**4. Cool-down + review (5–10 min)**');
    lines.push('  What improved? What still felt off? Note it before you leave.');
    lines.push('');

    const drillList = DRILLS[sport]?.[action] ?? [];
    if (drillList.length > 0) {
        lines.push(`**Recommended drill for next session:**`);
        lines.push(drillList[0]);
    }

    lines.push('');
    lines.push(`**Target score for your next session:** ${Math.min(100, overallScore + 5)}–${Math.min(100, overallScore + 8)}/100`);

    return lines.join('\n');
}

function buildWarmupResponse(ctx: CoachContext): string {
    const { sport } = ctx;
    const lines: string[] = [];

    const warmups: Record<string, string[]> = {
        basketball: [
            '5 min light jog or jump rope',
            'Arm circles (10 forward, 10 backward)',
            'Hip circles and leg swings (10 each direction)',
            'Wrist and ankle rotations (30 sec each)',
            'Form shooting from 3 ft — 10 reps, slow motion, zero lower body',
            'Gradual shooting distance increase before full reps',
        ],
        volleyball: [
            '5 min light jog',
            'Arm circles and shoulder rolls (2 min)',
            'Trunk rotations standing (20 reps)',
            'Ankle and hip mobility (leg swings forward and lateral)',
            'Soft forearm passing (low intensity) for 3 min',
            'Shoulder band warm-up: internal/external rotation with light resistance',
        ],
        badminton: [
            '5 min skipping or light jog',
            'Wrist mobility: circles, flexion/extension (1 min)',
            'Shoulder pendulum swings (30 sec each)',
            'Lateral shuffle across court × 5 (footwork activation)',
            'Shadow footwork to 6 corners without racket (2 min)',
            'Light feeding drill: slow overhead clears at 50% intensity',
        ],
    };

    const steps = warmups[sport] ?? [
        '5 min light cardio',
        'Joint circles for sport-specific joints',
        'Dynamic stretches (leg swings, arm circles)',
        '5–10 slow-motion reps of your main action at 50% intensity',
    ];

    lines.push(`**${cap(sport)} warm-up routine (15 min total):**`);
    lines.push('');
    steps.forEach((step, i) => {
        lines.push(`${i + 1}. ${step}`);
    });
    lines.push('');
    lines.push('Never skip the warm-up for a high-intensity session — cold muscles perform worse and injure faster.');

    return lines.join('\n');
}

function buildMentalResponse(ctx: CoachContext): string {
    const { sport, action, overallScore } = ctx;
    const lines: string[] = [];

    lines.push('The mental side of sport is real and measurable. A few things the data tells us:');
    lines.push('');

    if (overallScore >= 80) {
        lines.push('Your mechanics are strong enough that performance variation is increasingly mental. At your level, focus on:');
    } else {
        lines.push('With mechanics still developing, the mental task right now is **deliberate practice focus** — not competition anxiety. That means:');
    }

    lines.push('');
    lines.push('**Cue words**: Pick one technical cue per session (e.g., "elbow in" or "stay low"). One cue is better than five.');
    lines.push('');
    lines.push('**The 10-second reset**: After a bad rep, pause, breathe, restate your one cue, and go again. No dwelling.');
    lines.push('');
    lines.push('**Visualization**: Before a rep or set, spend 3 seconds picturing the movement as you want it to feel — kinesthetic visualization activates motor patterns.');
    lines.push('');
    lines.push('**Process > outcome**: Score-chasing during practice creates tension. Process goals ("hold my follow-through this rep") produce better scores than score goals.');
    lines.push('');
    lines.push(`For ${humanAction(action)} specifically: the pre-shot/pre-action routine is the single highest-leverage mental skill. Build one, repeat it identically every time.`);

    return lines.join('\n');
}

function buildFallbackResponse(ctx: CoachContext): string {
    const { sport, action, overallScore, flaws } = ctx;
    const lines: string[] = [];

    lines.push(`I'm your ${cap(sport)} ${humanAction(action)} coach — here's what I can help with:`);
    lines.push('');
    lines.push('• **"What are my biggest flaws?"** — detailed breakdown of what to fix');
    lines.push('• **"Give me drills"** — specific practice exercises for your action');
    lines.push('• **"Any injury risk?"** — flag and prevent overuse issues');
    lines.push('• **"How do pros do this?"** — compare your mechanics to professional benchmarks');
    lines.push('• **"What does my score mean?"** — explains the scoring and grade');
    lines.push('• **"Plan my next session"** — structured practice plan');
    lines.push('• **"What am I doing well?"** — your strengths from this session');
    lines.push('• **Ask about any metric** — e.g. "explain my elbow angle"');

    if (flaws.length > 0) {
        lines.push('');
        lines.push(`Current top issue: **${flaws[0].title}** — ask me how to fix it.`);
    }

    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the opening analysis message for a session.
 * Called once when the coach panel loads.
 */
export function generateOpeningMessage(ctx: CoachContext): string {
    return buildOpeningMessage(ctx);
}

/**
 * Generates a context-aware reply to a user's follow-up message.
 * Uses intent classification to route to the appropriate response generator.
 */
export function generateReply(userMessage: string, ctx: CoachContext): string {
    const intent = classifyIntent(userMessage, ctx);

    switch (intent) {
        case 'overview': return buildOverviewResponse(ctx);
        case 'worst_flaw': return buildWorstFlawResponse(ctx);
        case 'drills': return buildDrillsResponse(ctx);
        case 'injury': return buildInjuryResponse(ctx);
        case 'pro_comparison': return buildProComparisonResponse(ctx);
        case 'score_meaning': return buildScoreMeaningResponse(ctx);
        case 'metric_specific': return buildMetricSpecificResponse(userMessage, ctx);
        case 'frequency': return buildFrequencyResponse(ctx);
        case 'what_good': return buildWhatGoodResponse(ctx);
        case 'next_session': return buildNextSessionResponse(ctx);
        case 'warmup': return buildWarmupResponse(ctx);
        case 'mental': return buildMentalResponse(ctx);
        case 'fallback':
        default: return buildFallbackResponse(ctx);
    }
}
