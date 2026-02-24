/**
 * Volleyball Metric Calculator
 *
 * Computes sport-specific biomechanical metrics from MediaPipe pose data
 * for volleyball actions: spike, serve, block, set.
 *
 * All metrics are derived purely from body landmarks (no ball tracking).
 * Each metric is nullable to handle missing/low-confidence landmarks gracefully.
 */

import type { NormalizedLandmark } from '@mediapipe/pose';
import {
  calculateElbowAngle,
  analyzeJump,
} from '@/features/biomechanics';
import { LandmarkIndex } from '@/features/pose/types';
import type { MetricCalculationInput, MetricResult } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_VISIBILITY = 0.45;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getLm(
  frame: NormalizedLandmark[] | undefined,
  idx: LandmarkIndex
): NormalizedLandmark | null {
  if (!frame) return null;
  const lm = frame[idx];
  if (!lm) return null;
  if ((lm.visibility ?? 1) < MIN_VISIBILITY) return null;
  if (isNaN(lm.x) || isNaN(lm.y)) return null;
  return lm;
}

function detectHittingArm(
  frames: NormalizedLandmark[][],
  contactFrame: number
): 'left' | 'right' {
  const f = frames[contactFrame];
  if (!f) return 'right';
  const lw = getLm(f, LandmarkIndex.LEFT_WRIST);
  const rw = getLm(f, LandmarkIndex.RIGHT_WRIST);
  if (!lw && !rw) return 'right';
  if (!lw) return 'right';
  if (!rw) return 'left';
  return lw.y < rw.y ? 'left' : 'right';
}

function getArmLandmarks(side: 'left' | 'right') {
  return side === 'left'
    ? {
      shoulder: LandmarkIndex.LEFT_SHOULDER,
      elbow: LandmarkIndex.LEFT_ELBOW,
      wrist: LandmarkIndex.LEFT_WRIST,
      hip: LandmarkIndex.LEFT_HIP,
      knee: LandmarkIndex.LEFT_KNEE,
      ankle: LandmarkIndex.LEFT_ANKLE,
    }
    : {
      shoulder: LandmarkIndex.RIGHT_SHOULDER,
      elbow: LandmarkIndex.RIGHT_ELBOW,
      wrist: LandmarkIndex.RIGHT_WRIST,
      hip: LandmarkIndex.RIGHT_HIP,
      knee: LandmarkIndex.RIGHT_KNEE,
      ankle: LandmarkIndex.RIGHT_ANKLE,
    };
}

function findContactFrame(
  frames: NormalizedLandmark[][],
  side: 'left' | 'right',
  startSearch = 0,
  endSearch?: number
): number {
  const end = endSearch ?? frames.length - 1;
  const wristIdx =
    side === 'left' ? LandmarkIndex.LEFT_WRIST : LandmarkIndex.RIGHT_WRIST;
  let bestFrame = Math.floor((startSearch + end) / 2);
  let minY = Infinity;
  for (let i = startSearch; i <= end; i++) {
    const lm = getLm(frames[i], wristIdx);
    if (lm && lm.y < minY) { minY = lm.y; bestFrame = i; }
  }
  return bestFrame;
}

/** Contact height as % of body height (ankle→shoulder span). Can exceed 100 during jump. */
function calcContactHeight(
  frame: NormalizedLandmark[],
  side: 'left' | 'right'
): number | null {
  const lmIdx = getArmLandmarks(side);
  const wrist = getLm(frame, lmIdx.wrist);
  const lAnkle = getLm(frame, LandmarkIndex.LEFT_ANKLE);
  const rAnkle = getLm(frame, LandmarkIndex.RIGHT_ANKLE);
  const lShoulder = getLm(frame, LandmarkIndex.LEFT_SHOULDER);
  const rShoulder = getLm(frame, LandmarkIndex.RIGHT_SHOULDER);
  if (!wrist || (!lAnkle && !rAnkle) || (!lShoulder && !rShoulder)) return null;
  const ankleY = lAnkle && rAnkle ? (lAnkle.y + rAnkle.y) / 2 : (lAnkle ?? rAnkle)!.y;
  const shoulderY = lShoulder && rShoulder ? (lShoulder.y + rShoulder.y) / 2 : (lShoulder ?? rShoulder)!.y;
  const bodyHeight = ankleY - shoulderY;
  if (bodyHeight < 0.05) return null;
  const ratio = ((ankleY - wrist.y) / bodyHeight) * 100;
  return Math.round(Math.max(0, Math.min(130, ratio)));
}

function calcElbowAngle(
  frame: NormalizedLandmark[],
  side: 'left' | 'right'
): number | null {
  const lmIdx = getArmLandmarks(side);
  const shoulder = getLm(frame, lmIdx.shoulder);
  const elbow = getLm(frame, lmIdx.elbow);
  const wrist = getLm(frame, lmIdx.wrist);
  if (!shoulder || !elbow || !wrist) return null;
  const result = calculateElbowAngle(shoulder, elbow, wrist);
  if (!result.isValid || isNaN(result.degrees)) return null;
  return Math.round(result.degrees * 10) / 10;
}

function calcTrunkRotation(frame: NormalizedLandmark[]): number | null {
  const ls = getLm(frame, LandmarkIndex.LEFT_SHOULDER);
  const rs = getLm(frame, LandmarkIndex.RIGHT_SHOULDER);
  const lh = getLm(frame, LandmarkIndex.LEFT_HIP);
  const rh = getLm(frame, LandmarkIndex.RIGHT_HIP);
  if (!ls || !rs || !lh || !rh) return null;
  const shoulderAngle = Math.atan2(ls.y - rs.y, ls.x - rs.x) * (180 / Math.PI);
  const hipAngle = Math.atan2(lh.y - rh.y, lh.x - rh.x) * (180 / Math.PI);
  let diff = Math.abs(shoulderAngle - hipAngle);
  if (diff > 180) diff = 360 - diff;
  return Math.round(diff * 10) / 10;
}

function calcBodyPostureScore(frame: NormalizedLandmark[]): number | null {
  const ls = getLm(frame, LandmarkIndex.LEFT_SHOULDER);
  const rs = getLm(frame, LandmarkIndex.RIGHT_SHOULDER);
  const lh = getLm(frame, LandmarkIndex.LEFT_HIP);
  const rh = getLm(frame, LandmarkIndex.RIGHT_HIP);
  if (!ls || !rs || !lh || !rh) return null;
  const sMidX = (ls.x + rs.x) / 2; const sMidY = (ls.y + rs.y) / 2;
  const hMidX = (lh.x + rh.x) / 2; const hMidY = (lh.y + rh.y) / 2;
  const dy = hMidY - sMidY;
  if (Math.abs(dy) < 0.01) return null;
  const lean = Math.abs(Math.atan2(sMidX - hMidX, dy) * (180 / Math.PI));
  return Math.round(Math.max(0, 100 - lean * (100 / 45)));
}

function calcArmSwingScore(
  frames: NormalizedLandmark[][],
  side: 'left' | 'right',
  contactFrame: number,
  fps: number,
  lookbackFrames = 12
): number | null {
  const wristIdx = side === 'left' ? LandmarkIndex.LEFT_WRIST : LandmarkIndex.RIGHT_WRIST;
  const start = Math.max(0, contactFrame - lookbackFrames);
  if (start >= contactFrame) return null;
  let totalDist = 0; let validFrames = 0;
  for (let i = start; i < contactFrame; i++) {
    const a = getLm(frames[i], wristIdx);
    const b = getLm(frames[i + 1], wristIdx);
    if (!a || !b) continue;
    totalDist += Math.hypot(b.x - a.x, b.y - a.y);
    validFrames++;
  }
  if (validFrames < 3) return null;
  const cf = frames[contactFrame];
  const ls = getLm(cf, LandmarkIndex.LEFT_SHOULDER);
  const rs = getLm(cf, LandmarkIndex.RIGHT_SHOULDER);
  const sw = ls && rs ? Math.abs(ls.x - rs.x) : 0.2;
  const speed = totalDist / (validFrames / fps);
  const refSpeed = Math.max(sw, 0.05) * 10;
  return Math.round(Math.min(100, (speed / refSpeed) * 100));
}

function calcJumpHeight(
  frames: NormalizedLandmark[][],
  fps: number,
  keyframes: MetricCalculationInput['keyframes']
): number | null {
  if (!keyframes.peakJump || !keyframes.start) return null;
  if (!frames.length || fps <= 0) return null;
  try {
    const poseFrames = frames.map((landmarks, i) => ({
      frameNumber: i, timestamp: i / fps, landmarks, confidence: 1,
    }));
    const result = analyzeJump(poseFrames, fps, {
      peakJump: keyframes.peakJump, start: keyframes.start, end: keyframes.end,
    });
    if (!result.isValid || isNaN(result.heightNormalized)) return null;
    return Math.round(result.heightNormalized * 1000) / 1000;
  } catch { return null; }
}

function calcFollowThrough(
  frames: NormalizedLandmark[][],
  side: 'left' | 'right',
  contactFrame: number,
  lookAheadFrames = 12
): number | null {
  const end = Math.min(contactFrame + lookAheadFrames, frames.length - 1);
  if (end <= contactFrame) return null;
  let maxAngle = 0;
  for (let i = contactFrame; i <= end; i++) {
    const a = calcElbowAngle(frames[i], side);
    if (a !== null && a > maxAngle) maxAngle = a;
  }
  if (maxAngle === 0) return null;
  const score = ((maxAngle - 120) / (172 - 120)) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
}

function calcHandSymmetry(frame: NormalizedLandmark[]): number | null {
  const lw = getLm(frame, LandmarkIndex.LEFT_WRIST);
  const rw = getLm(frame, LandmarkIndex.RIGHT_WRIST);
  if (!lw || !rw) return null;
  const ls = getLm(frame, LandmarkIndex.LEFT_SHOULDER);
  const rs = getLm(frame, LandmarkIndex.RIGHT_SHOULDER);
  const sw = ls && rs ? Math.abs(ls.x - rs.x) : 0.2;
  const heightDiff = Math.abs(lw.y - rw.y);
  return Math.round(Math.max(0, 100 - (heightDiff / Math.max(sw, 0.05)) * 200));
}

function calcStabilityIndex(
  frames: NormalizedLandmark[][],
  startFrame: number | null,
  contactFrame: number
): number | null {
  if (startFrame === null || startFrame < 0 || contactFrame >= frames.length) return null;
  const sf = frames[startFrame]; const cf = frames[contactFrame];
  if (!sf || !cf) return null;
  const slh = getLm(sf, LandmarkIndex.LEFT_HIP); const srh = getLm(sf, LandmarkIndex.RIGHT_HIP);
  const clh = getLm(cf, LandmarkIndex.LEFT_HIP); const crh = getLm(cf, LandmarkIndex.RIGHT_HIP);
  if (!slh || !srh || !clh || !crh) return null;
  const sX = (slh.x + srh.x) / 2; const cX = (clh.x + crh.x) / 2;
  const ls = getLm(sf, LandmarkIndex.LEFT_SHOULDER); const rs = getLm(sf, LandmarkIndex.RIGHT_SHOULDER);
  const bw = ls && rs ? Math.abs(rs.x - ls.x) : 0.2;
  const disp = Math.abs(cX - sX) / Math.max(bw, 0.05);
  return Math.round(Math.max(0, Math.min(100, (1 - disp / 0.8) * 100)));
}

// ---------------------------------------------------------------------------
// Action calculators
// ---------------------------------------------------------------------------

function calcSpikeMetrics(input: MetricCalculationInput): MetricResult {
  const { smoothedFrames: frames, keyframes, fps } = input;
  const metrics: MetricResult = {
    elbowAtContact: null, contactHeight: null, armSwingScore: null,
    jumpHeight: null, trunkRotation: null, bodyAlignment: null, stability: null,
  };
  if (!frames.length || fps <= 0) return metrics;

  const searchStart = keyframes.start ?? 0;
  const searchEnd = keyframes.end ?? frames.length - 1;
  const dominantSide = detectHittingArm(frames, keyframes.release ?? Math.floor((searchStart + searchEnd) / 2));
  const contactFrame = keyframes.release ?? findContactFrame(frames, dominantSide, searchStart, searchEnd);
  const cf = frames[contactFrame];
  if (!cf) return metrics;

  metrics.elbowAtContact = calcElbowAngle(cf, dominantSide);
  metrics.contactHeight = calcContactHeight(cf, dominantSide);
  metrics.armSwingScore = calcArmSwingScore(frames, dominantSide, contactFrame, fps);
  metrics.jumpHeight = calcJumpHeight(frames, fps, keyframes);
  metrics.trunkRotation = calcTrunkRotation(cf);
  metrics.bodyAlignment = calcBodyPostureScore(cf);
  metrics.stability = calcStabilityIndex(frames, keyframes.start, contactFrame);
  console.log('[VolleyballMetrics] spike:', metrics);
  return metrics;
}

function calcServeMetrics(input: MetricCalculationInput): MetricResult {
  const { smoothedFrames: frames, keyframes, fps } = input;
  const metrics: MetricResult = {
    elbowAtContact: null, contactHeight: null, trunkRotation: null,
    followThrough: null, stability: null, armSwingScore: null,
  };
  if (!frames.length || fps <= 0) return metrics;

  const searchStart = keyframes.start ?? 0;
  const searchEnd = keyframes.end ?? frames.length - 1;
  const dominantSide = detectHittingArm(frames, keyframes.release ?? Math.floor((searchStart + searchEnd) / 2));
  const contactFrame = keyframes.release ?? findContactFrame(frames, dominantSide, searchStart, searchEnd);
  const cf = frames[contactFrame];
  if (!cf) return metrics;

  metrics.elbowAtContact = calcElbowAngle(cf, dominantSide);
  metrics.contactHeight = calcContactHeight(cf, dominantSide);
  metrics.trunkRotation = calcTrunkRotation(cf);
  metrics.followThrough = calcFollowThrough(frames, dominantSide, contactFrame, 15);
  metrics.stability = calcStabilityIndex(frames, keyframes.start, contactFrame);
  metrics.armSwingScore = calcArmSwingScore(frames, dominantSide, contactFrame, fps, 10);
  console.log('[VolleyballMetrics] serve:', metrics);
  return metrics;
}

function calcBlockMetrics(input: MetricCalculationInput): MetricResult {
  const { smoothedFrames: frames, keyframes, fps } = input;
  const metrics: MetricResult = {
    jumpHeight: null, armExtension: null, handHeight: null,
    handSymmetry: null, bodyAlignment: null,
  };
  if (!frames.length || fps <= 0) return metrics;

  const peakFrame = keyframes.peakJump ?? (() => {
    let minY = Infinity; let best = Math.floor(frames.length / 2);
    for (let i = 0; i < frames.length; i++) {
      const lh = getLm(frames[i], LandmarkIndex.LEFT_HIP);
      const rh = getLm(frames[i], LandmarkIndex.RIGHT_HIP);
      if (!lh || !rh) continue;
      const y = (lh.y + rh.y) / 2;
      if (y < minY) { minY = y; best = i; }
    }
    return best;
  })();

  const pf = frames[peakFrame];
  if (!pf) return metrics;

  metrics.jumpHeight = calcJumpHeight(frames, fps, keyframes);
  const le = calcElbowAngle(pf, 'left'); const re = calcElbowAngle(pf, 'right');
  metrics.armExtension = le !== null && re !== null ? Math.round((le + re) / 2) : (le ?? re);
  const dominantSide = detectHittingArm(frames, peakFrame);
  metrics.handHeight = calcContactHeight(pf, dominantSide);
  metrics.handSymmetry = calcHandSymmetry(pf);
  metrics.bodyAlignment = calcBodyPostureScore(pf);
  console.log('[VolleyballMetrics] block:', metrics);
  return metrics;
}

function calcSetMetrics(input: MetricCalculationInput): MetricResult {
  const { smoothedFrames: frames, keyframes, fps } = input;
  const metrics: MetricResult = {
    handSymmetry: null, elbowAngle: null, contactHeight: null,
    bodyAlignment: null, stability: null,
  };
  if (!frames.length || fps <= 0) return metrics;

  const searchStart = keyframes.start ?? 0;
  const searchEnd = keyframes.end ?? frames.length - 1;
  const contactFrame = keyframes.release ?? (() => {
    let minY = Infinity; let best = Math.floor((searchStart + searchEnd) / 2);
    for (let i = searchStart; i <= searchEnd; i++) {
      const lw = getLm(frames[i], LandmarkIndex.LEFT_WRIST);
      const rw = getLm(frames[i], LandmarkIndex.RIGHT_WRIST);
      const y = lw && rw ? (lw.y + rw.y) / 2 : (lw ?? rw)?.y ?? Infinity;
      if (y < minY) { minY = y; best = i; }
    }
    return best;
  })();

  const cf = frames[contactFrame];
  if (!cf) return metrics;

  metrics.handSymmetry = calcHandSymmetry(cf);
  const le = calcElbowAngle(cf, 'left'); const re = calcElbowAngle(cf, 'right');
  metrics.elbowAngle = le !== null && re !== null ? Math.round((le + re) / 2) : (le ?? re);
  const dominantSide = detectHittingArm(frames, contactFrame);
  metrics.contactHeight = calcContactHeight(cf, dominantSide);
  metrics.bodyAlignment = calcBodyPostureScore(cf);
  metrics.stability = calcStabilityIndex(frames, keyframes.start, contactFrame);
  console.log('[VolleyballMetrics] set:', metrics);
  return metrics;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function calculateVolleyballMetrics(
  input: MetricCalculationInput
): MetricResult {
  const { action } = input;
  console.log(`[VolleyballMetrics] Calculating metrics for action: ${action}`);
  switch (action) {
    case 'spike': return calcSpikeMetrics(input);
    case 'serve': return calcServeMetrics(input);
    case 'block': return calcBlockMetrics(input);
    case 'set': return calcSetMetrics(input);
    default:
      console.warn(`[VolleyballMetrics] Unknown action: ${action}`);
      return {};
  }
}