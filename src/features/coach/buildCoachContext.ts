/**
 * Build Coach Context
 *
 * Serializes structured analysis data into a plain-text block that becomes
 * the LLM's grounding context. Doing this server-side-like serialization
 * on the client prevents the model from hallucinating numbers — it can only
 * reformat and reason about what we explicitly provide.
 */

import type { DetectedFlaw } from '@/features/flaws';
import type { CoachContext } from './coachTypes';

export interface BuildCoachContextArgs {
    sport: string;
    action: string;
    score: number;
    confidence?: number;
    metrics: Record<string, number | null>;
    scoreBreakdown: Record<string, number>;
    flaws: DetectedFlaw[];
}

/**
 * Converts analysis output into a structured CoachContext object.
 */
export function buildCoachContext({
    sport,
    action,
    score,
    confidence = 95,
    metrics,
    scoreBreakdown,
    flaws,
}: BuildCoachContextArgs): CoachContext {
    return {
        sport,
        action,
        overallScore: score,
        confidence,
        metrics,
        scoreBreakdown,
        flaws: flaws.map((f) => ({
            id: f.id,
            title: f.title,
            severity: f.severity,
            injuryRisk: f.injuryRisk,
            correction: f.correction,
            category: f.category,
        })),
    };
}

/**
 * Serializes a CoachContext into the plain-text system prompt block.
 * This is injected as the first user turn so the LLM has all real data upfront.
 */
export function serializeCoachContext(ctx: CoachContext): string {
    const lines: string[] = [];

    lines.push(`SPORT: ${ctx.sport.toUpperCase()}`);
    lines.push(`ACTION: ${ctx.action.replace(/_/g, ' ')}`);
    lines.push(`OVERALL SCORE: ${ctx.overallScore}/100`);
    lines.push('');

    // Score breakdown
    if (Object.keys(ctx.scoreBreakdown).length > 0) {
        lines.push('SCORE BREAKDOWN:');
        for (const [key, val] of Object.entries(ctx.scoreBreakdown)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            lines.push(`  ${label}: ${val}/100`);
        }
        lines.push('');
    }

    // Metrics
    const validMetrics = Object.entries(ctx.metrics).filter(
        ([, v]) => v !== null && v !== undefined
    ) as [string, number][];

    if (validMetrics.length > 0) {
        lines.push('MEASURED METRICS:');
        for (const [key, val] of validMetrics) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            lines.push(`  ${label}: ${val.toFixed(1)}`);
        }
        lines.push('');
    }

    // Flaws
    if (ctx.flaws.length > 0) {
        lines.push(`DETECTED FLAWS (${ctx.flaws.length} total):`);
        for (const flaw of ctx.flaws) {
            const risk = flaw.injuryRisk ? ' ⚠ INJURY RISK' : '';
            lines.push(`  [${flaw.severity.toUpperCase()}] ${flaw.title}${risk}`);
            lines.push(`    Category: ${flaw.category}`);
            lines.push(`    Correction: ${flaw.correction}`);
        }
    } else {
        lines.push('DETECTED FLAWS: None — excellent technique!');
    }

    return lines.join('\n');
}
