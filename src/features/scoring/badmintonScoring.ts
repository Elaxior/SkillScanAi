/**
 * Badminton Scoring Engine
 *
 * Calculates performance scores for badminton actions based on
 * extracted metrics and benchmark comparisons.
 * Follows the same pipeline as basketballScoring.ts.
 */

import type { ScoringResult, MetricScoreResult } from './types';
import { getBadmintonBenchmarks } from './badmintonBenchmarks';
import {
    scoreWithPreference,
    calculateWeightedScore,
    adjustWeightsForMissingMetrics,
    calculateScoringConfidence,
    applyGradeCurve,
    clampScore,
} from './scoringUtils';

/**
 * Calculates the complete badminton performance score
 *
 * @param metrics - Calculated metrics from the pose analysis
 * @param action  - Specific badminton action (smash | clear | drop_shot | serve)
 * @returns Complete scoring result with breakdown
 */
export function calculateBadmintonScore(
    metrics: Record<string, number | null>,
    action: string = 'smash'
): ScoringResult {
    const startTime = performance.now();

    const benchmarks = getBadmintonBenchmarks(action);

    if (!benchmarks) {
        console.warn(`[BadmintonScoring] No benchmarks for action: ${action}`);
        return createEmptyResult(`Unsupported action: ${action}`);
    }

    const details: Record<string, MetricScoreResult> = {};
    const breakdown: Record<string, number> = {};
    const availableMetrics = new Set<string>();

    for (const [metricKey, benchmark] of Object.entries(benchmarks.metrics)) {
        const rawValue = metrics[metricKey];

        if (rawValue === null || rawValue === undefined || !Number.isFinite(rawValue)) {
            details[metricKey] = {
                rawValue: null,
                normalizedScore: null,
                included: false,
                excludeReason: 'Metric not available or invalid',
            };
            continue;
        }

        const normalizedScore = scoreWithPreference(rawValue, benchmark);

        if (!Number.isFinite(normalizedScore)) {
            details[metricKey] = {
                rawValue,
                normalizedScore: null,
                included: false,
                excludeReason: 'Score calculation resulted in invalid value',
            };
            continue;
        }

        details[metricKey] = { rawValue, normalizedScore, included: true };
        breakdown[metricKey] = Math.round(normalizedScore);
        availableMetrics.add(metricKey);
    }

    const metricsIncluded = availableMetrics.size;
    const metricsTotal = Object.keys(benchmarks.metrics).length;

    if (metricsIncluded < benchmarks.minRequiredMetrics) {
        console.warn(
            `[BadmintonScoring] Insufficient metrics: ${metricsIncluded}/${benchmarks.minRequiredMetrics} required`
        );
        return {
            overallScore: 0,
            breakdown,
            details,
            metricsIncluded,
            metricsTotal,
            confidence: 0,
            calculatedAt: Date.now(),
        };
    }

    const adjustedWeights = adjustWeightsForMissingMetrics(
        availableMetrics,
        benchmarks.weights
    );

    const overallScore = calculateWeightedScore(breakdown, adjustedWeights);
    const confidence = calculateScoringConfidence(
        metricsIncluded,
        metricsTotal,
        benchmarks.minRequiredMetrics
    );

    const endTime = performance.now();
    console.log(
        `[BadmintonScoring] Calculated score in ${(endTime - startTime).toFixed(2)}ms:`,
        { overallScore, metricsIncluded, confidence }
    );

    const curvedScore = applyGradeCurve(overallScore, 0.15);

    return {
        overallScore: clampScore(curvedScore),
        breakdown,
        details,
        metricsIncluded,
        metricsTotal,
        confidence,
        calculatedAt: Date.now(),
    };
}

function createEmptyResult(reason: string): ScoringResult {
    console.error(`[BadmintonScoring] ${reason}`);
    return {
        overallScore: 0,
        breakdown: {},
        details: {},
        metricsIncluded: 0,
        metricsTotal: 0,
        confidence: 0,
        calculatedAt: Date.now(),
    };
}
