/**
 * Volleyball Benchmarks
 *
 * Ideal / acceptable ranges for each volleyball action metric.
 * Values derived from sports-science literature and coaching best practices.
 */

import type { SportBenchmarks, MetricBenchmark } from './types';

// ---------------------------------------------------------------------------
// Spike
// ---------------------------------------------------------------------------

const spikeElbowAtContact: MetricBenchmark = {
    idealMin: 155,
    idealMax: 177,
    acceptableMin: 130,
    acceptableMax: 180,
    preference: 'higher',
};

const spikeContactHeight: MetricBenchmark = {
    idealMin: 85,
    idealMax: 115,
    acceptableMin: 65,
    acceptableMax: 130,
    preference: 'higher',
};

const spikeArmSwingScore: MetricBenchmark = {
    idealMin: 65,
    idealMax: 100,
    acceptableMin: 30,
    acceptableMax: 100,
    preference: 'higher',
};

const spikeJumpHeight: MetricBenchmark = {
    idealMin: 0.07,
    idealMax: 0.22,
    acceptableMin: 0.01,
    acceptableMax: 0.35,
    preference: 'higher',
};

const spikeTrunkRotation: MetricBenchmark = {
    idealMin: 20,
    idealMax: 65,
    acceptableMin: 5,
    acceptableMax: 90,
    preference: 'center',
};

const spikeBodyAlignment: MetricBenchmark = {
    idealMin: 68,
    idealMax: 100,
    acceptableMin: 35,
    acceptableMax: 100,
    preference: 'higher',
};

const spikeStability: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 35,
    acceptableMax: 100,
    preference: 'higher',
};

export const volleyballSpikeBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        elbowAtContact: 0.22,
        contactHeight: 0.22,
        armSwingScore: 0.18,
        jumpHeight: 0.16,
        trunkRotation: 0.10,
        bodyAlignment: 0.07,
        stability: 0.05,
    },
    metrics: {
        elbowAtContact: spikeElbowAtContact,
        contactHeight: spikeContactHeight,
        armSwingScore: spikeArmSwingScore,
        jumpHeight: spikeJumpHeight,
        trunkRotation: spikeTrunkRotation,
        bodyAlignment: spikeBodyAlignment,
        stability: spikeStability,
    },
};

// ---------------------------------------------------------------------------
// Serve
// ---------------------------------------------------------------------------

const serveElbowAtContact: MetricBenchmark = {
    idealMin: 155,
    idealMax: 177,
    acceptableMin: 125,
    acceptableMax: 180,
    preference: 'higher',
};

const serveContactHeight: MetricBenchmark = {
    idealMin: 78,
    idealMax: 110,
    acceptableMin: 60,
    acceptableMax: 125,
    preference: 'higher',
};

const serveTrunkRotation: MetricBenchmark = {
    idealMin: 18,
    idealMax: 55,
    acceptableMin: 5,
    acceptableMax: 80,
    preference: 'center',
};

const serveFollowThrough: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 35,
    acceptableMax: 100,
    preference: 'higher',
};

const serveStability: MetricBenchmark = {
    idealMin: 78,
    idealMax: 100,
    acceptableMin: 45,
    acceptableMax: 100,
    preference: 'higher',
};

const serveArmSwingScore: MetricBenchmark = {
    idealMin: 55,
    idealMax: 100,
    acceptableMin: 20,
    acceptableMax: 100,
    preference: 'higher',
};

export const volleyballServeBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        elbowAtContact: 0.25,
        contactHeight: 0.20,
        trunkRotation: 0.15,
        followThrough: 0.18,
        stability: 0.12,
        armSwingScore: 0.10,
    },
    metrics: {
        elbowAtContact: serveElbowAtContact,
        contactHeight: serveContactHeight,
        trunkRotation: serveTrunkRotation,
        followThrough: serveFollowThrough,
        stability: serveStability,
        armSwingScore: serveArmSwingScore,
    },
};

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------

const blockJumpHeight: MetricBenchmark = {
    idealMin: 0.05,
    idealMax: 0.20,
    acceptableMin: 0.01,
    acceptableMax: 0.32,
    preference: 'higher',
};

const blockArmExtension: MetricBenchmark = {
    idealMin: 155,
    idealMax: 177,
    acceptableMin: 120,
    acceptableMax: 180,
    preference: 'higher',
};

const blockHandHeight: MetricBenchmark = {
    idealMin: 85,
    idealMax: 115,
    acceptableMin: 65,
    acceptableMax: 130,
    preference: 'higher',
};

const blockHandSymmetry: MetricBenchmark = {
    idealMin: 75,
    idealMax: 100,
    acceptableMin: 40,
    acceptableMax: 100,
    preference: 'higher',
};

const blockBodyAlignment: MetricBenchmark = {
    idealMin: 65,
    idealMax: 100,
    acceptableMin: 30,
    acceptableMax: 100,
    preference: 'higher',
};

export const volleyballBlockBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        jumpHeight: 0.25,
        armExtension: 0.28,
        handHeight: 0.22,
        handSymmetry: 0.15,
        bodyAlignment: 0.10,
    },
    metrics: {
        jumpHeight: blockJumpHeight,
        armExtension: blockArmExtension,
        handHeight: blockHandHeight,
        handSymmetry: blockHandSymmetry,
        bodyAlignment: blockBodyAlignment,
    },
};

// ---------------------------------------------------------------------------
// Set
// ---------------------------------------------------------------------------

const setHandSymmetry: MetricBenchmark = {
    idealMin: 72,
    idealMax: 100,
    acceptableMin: 40,
    acceptableMax: 100,
    preference: 'higher',
};

const setElbowAngle: MetricBenchmark = {
    idealMin: 88,
    idealMax: 138,
    acceptableMin: 60,
    acceptableMax: 165,
    preference: 'center',
};

const setContactHeight: MetricBenchmark = {
    idealMin: 80,
    idealMax: 110,
    acceptableMin: 55,
    acceptableMax: 125,
    preference: 'higher',
};

const setBodyAlignment: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 35,
    acceptableMax: 100,
    preference: 'higher',
};

const setStability: MetricBenchmark = {
    idealMin: 72,
    idealMax: 100,
    acceptableMin: 40,
    acceptableMax: 100,
    preference: 'higher',
};

export const volleyballSetBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        handSymmetry: 0.30,
        elbowAngle: 0.25,
        contactHeight: 0.20,
        bodyAlignment: 0.15,
        stability: 0.10,
    },
    metrics: {
        handSymmetry: setHandSymmetry,
        elbowAngle: setElbowAngle,
        contactHeight: setContactHeight,
        bodyAlignment: setBodyAlignment,
        stability: setStability,
    },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const VOLLEYBALL_BENCHMARKS: Record<string, SportBenchmarks> = {
    spike: volleyballSpikeBenchmarks,
    serve: volleyballServeBenchmarks,
    block: volleyballBlockBenchmarks,
    set: volleyballSetBenchmarks,
};

export function getVolleyballBenchmarks(
    action: string
): SportBenchmarks | null {
    return VOLLEYBALL_BENCHMARKS[action] ?? null;
}
