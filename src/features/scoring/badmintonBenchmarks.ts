/**
 * Badminton Benchmarks
 *
 * Ideal / acceptable ranges for each badminton action metric.
 * Values derived from sports-science literature and coaching best practices.
 * Since the racket is not tracked, wrist kinematics proxy racket-head behaviour.
 */

import type { SportBenchmarks, MetricBenchmark } from './types';

// ---------------------------------------------------------------------------
// Smash
// ---------------------------------------------------------------------------

const smashElbowAtContact: MetricBenchmark = {
    idealMin: 155,
    idealMax: 177,
    acceptableMin: 125,
    acceptableMax: 180,
    preference: 'higher',
};

const smashContactHeight: MetricBenchmark = {
    idealMin: 90,
    idealMax: 125,
    acceptableMin: 65,
    acceptableMax: 135,
    preference: 'higher',
};

const smashTrunkRotation: MetricBenchmark = {
    idealMin: 22,
    idealMax: 65,
    acceptableMin: 5,
    acceptableMax: 90,
    preference: 'center',
};

const smashWristSpeed: MetricBenchmark = {
    idealMin: 60,
    idealMax: 100,
    acceptableMin: 20,
    acceptableMax: 100,
    preference: 'higher',
};

const smashJumpHeight: MetricBenchmark = {
    idealMin: 0.04,
    idealMax: 0.20,
    acceptableMin: 0.00,
    acceptableMax: 0.35,
    preference: 'higher',
};

const smashFollowThrough: MetricBenchmark = {
    idealMin: 65,
    idealMax: 100,
    acceptableMin: 25,
    acceptableMax: 100,
    preference: 'higher',
};

const smashBodyAlignment: MetricBenchmark = {
    idealMin: 62,
    idealMax: 100,
    acceptableMin: 30,
    acceptableMax: 100,
    preference: 'higher',
};

export const badmintonSmashBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        elbowAtContact: 0.22,
        contactHeight: 0.20,
        trunkRotation: 0.15,
        wristSpeed: 0.18,
        jumpHeight: 0.10,
        followThrough: 0.10,
        bodyAlignment: 0.05,
    },
    metrics: {
        elbowAtContact: smashElbowAtContact,
        contactHeight: smashContactHeight,
        trunkRotation: smashTrunkRotation,
        wristSpeed: smashWristSpeed,
        jumpHeight: smashJumpHeight,
        followThrough: smashFollowThrough,
        bodyAlignment: smashBodyAlignment,
    },
};

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

const clearElbowAtContact: MetricBenchmark = {
    idealMin: 150,
    idealMax: 177,
    acceptableMin: 120,
    acceptableMax: 180,
    preference: 'higher',
};

const clearContactHeight: MetricBenchmark = {
    idealMin: 82,
    idealMax: 118,
    acceptableMin: 60,
    acceptableMax: 132,
    preference: 'higher',
};

const clearTrunkRotation: MetricBenchmark = {
    idealMin: 18,
    idealMax: 60,
    acceptableMin: 5,
    acceptableMax: 85,
    preference: 'center',
};

const clearFollowThrough: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 30,
    acceptableMax: 100,
    preference: 'higher',
};

const clearBodyAlignment: MetricBenchmark = {
    idealMin: 60,
    idealMax: 100,
    acceptableMin: 28,
    acceptableMax: 100,
    preference: 'higher',
};

const clearWristSpeed: MetricBenchmark = {
    idealMin: 50,
    idealMax: 100,
    acceptableMin: 15,
    acceptableMax: 100,
    preference: 'higher',
};

export const badmintonClearBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        elbowAtContact: 0.25,
        contactHeight: 0.22,
        trunkRotation: 0.15,
        followThrough: 0.18,
        bodyAlignment: 0.10,
        wristSpeed: 0.10,
    },
    metrics: {
        elbowAtContact: clearElbowAtContact,
        contactHeight: clearContactHeight,
        trunkRotation: clearTrunkRotation,
        followThrough: clearFollowThrough,
        bodyAlignment: clearBodyAlignment,
        wristSpeed: clearWristSpeed,
    },
};

// ---------------------------------------------------------------------------
// Drop Shot
// ---------------------------------------------------------------------------

const dropContactHeight: MetricBenchmark = {
    idealMin: 65,
    idealMax: 98,
    acceptableMin: 45,
    acceptableMax: 118,
    preference: 'center',
};

const dropElbowAngle: MetricBenchmark = {
    idealMin: 118,
    idealMax: 162,
    acceptableMin: 85,
    acceptableMax: 178,
    preference: 'center',
};

const dropTrunkRotation: MetricBenchmark = {
    idealMin: 10,
    idealMax: 45,
    acceptableMin: 2,
    acceptableMax: 70,
    preference: 'center',
};

const dropBodyAlignment: MetricBenchmark = {
    idealMin: 65,
    idealMax: 100,
    acceptableMin: 35,
    acceptableMax: 100,
    preference: 'higher',
};

const dropStability: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 38,
    acceptableMax: 100,
    preference: 'higher',
};

export const badmintonDropShotBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        contactHeight: 0.25,
        elbowAngle: 0.28,
        trunkRotation: 0.18,
        bodyAlignment: 0.15,
        stability: 0.14,
    },
    metrics: {
        contactHeight: dropContactHeight,
        elbowAngle: dropElbowAngle,
        trunkRotation: dropTrunkRotation,
        bodyAlignment: dropBodyAlignment,
        stability: dropStability,
    },
};

// ---------------------------------------------------------------------------
// Serve
// ---------------------------------------------------------------------------

const serveStability: MetricBenchmark = {
    idealMin: 82,
    idealMax: 100,
    acceptableMin: 50,
    acceptableMax: 100,
    preference: 'higher',
};

const serveElbowAtContact: MetricBenchmark = {
    idealMin: 120,
    idealMax: 165,
    acceptableMin: 85,
    acceptableMax: 178,
    preference: 'center',
};

const serveFollowThrough: MetricBenchmark = {
    idealMin: 60,
    idealMax: 100,
    acceptableMin: 25,
    acceptableMax: 100,
    preference: 'higher',
};

const serveBodyAlignment: MetricBenchmark = {
    idealMin: 70,
    idealMax: 100,
    acceptableMin: 38,
    acceptableMax: 100,
    preference: 'higher',
};

export const badmintonServeBenchmarks: SportBenchmarks = {
    minRequiredMetrics: 2,
    weights: {
        stability: 0.30,
        elbowAtContact: 0.25,
        followThrough: 0.25,
        bodyAlignment: 0.20,
    },
    metrics: {
        stability: serveStability,
        elbowAtContact: serveElbowAtContact,
        followThrough: serveFollowThrough,
        bodyAlignment: serveBodyAlignment,
    },
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const BADMINTON_BENCHMARKS: Record<string, SportBenchmarks> = {
    smash: badmintonSmashBenchmarks,
    clear: badmintonClearBenchmarks,
    drop_shot: badmintonDropShotBenchmarks,
    serve: badmintonServeBenchmarks,
};

export function getBadmintonBenchmarks(
    action: string
): SportBenchmarks | null {
    return BADMINTON_BENCHMARKS[action] ?? null;
}
