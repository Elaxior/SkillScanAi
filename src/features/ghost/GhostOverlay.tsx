/**
 * Ghost Overlay Component
 * 
 * Renders the ideal "pro form" skeleton as a translucent overlay
 * and highlights deviations from the user's actual pose.
 * 
 * Performance Optimizations:
 * - Deviation calculated only for visible frame (not all frames)
 * - No React re-renders per frame (uses ref-based canvas)
 * - Reuses existing canvas context
 * - Minimal state (only config, not frame data)
 */

'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { NormalizedLandmark } from '@mediapipe/pose';
import type { GhostOverlayConfig, FrameDeviation } from './types';
import {
  calculateFrameDeviation,
  getMajorDeviationJoints,
  DEFAULT_DEVIATION_THRESHOLD,
} from './deviationUtils';
import { POSE_CONNECTIONS } from '@/features/pose/drawUtils';

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: GhostOverlayConfig = {
  enabled: true,
  opacity: 0.6,
  idealColor: 'rgba(34, 197, 94, 0.7)',     // Green
  deviationColor: 'rgba(239, 68, 68, 0.9)', // Red
  deviationThreshold: DEFAULT_DEVIATION_THRESHOLD,
  showDeviationMarkers: true,
  showConnectionLines: false,
};

// ============================================================================
// DRAWING FUNCTIONS
// ============================================================================

/**
 * Draw the ideal skeleton
 */
function drawIdealSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  config: GhostOverlayConfig
): void {
  ctx.save();
  ctx.globalAlpha = config.opacity;

  // Draw connections
  ctx.strokeStyle = config.idealColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Add glow effect
  ctx.shadowColor = config.idealColor;
  ctx.shadowBlur = 8;

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (!start || !end) continue;
    if ((start.visibility ?? 1) < 0.5 || (end.visibility ?? 1) < 0.5) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  // Draw joints
  ctx.fillStyle = config.idealColor;
  ctx.shadowBlur = 12;

  for (const landmark of landmarks) {
    if (!landmark || (landmark.visibility ?? 1) < 0.5) continue;

    ctx.beginPath();
    ctx.arc(
      landmark.x * width,
      landmark.y * height,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw deviation highlights
 */
function drawDeviationHighlights(
  ctx: CanvasRenderingContext2D,
  userLandmarks: NormalizedLandmark[],
  idealLandmarks: NormalizedLandmark[],
  majorDeviations: number[],
  width: number,
  height: number,
  config: GhostOverlayConfig
): void {
  ctx.save();

  for (const index of majorDeviations) {
    const userPoint = userLandmarks[index];
    const idealPoint = idealLandmarks[index];

    if (!userPoint || !idealPoint) continue;

    const userX = userPoint.x * width;
    const userY = userPoint.y * height;
    const idealX = idealPoint.x * width;
    const idealY = idealPoint.y * height;

    // Draw connection line between user and ideal (optional)
    if (config.showConnectionLines) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(userX, userY);
      ctx.lineTo(idealX, idealY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw deviation marker on user's joint
    if (config.showDeviationMarkers) {
      // Pulsing red circle
      ctx.fillStyle = config.deviationColor;
      ctx.shadowColor = config.deviationColor;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(userX, userY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Inner white dot
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(userX, userY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Arrow pointing to ideal position
      const dx = idealX - userX;
      const dy = idealY - userY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 20) {
        const arrowLength = Math.min(distance * 0.4, 30);
        const angle = Math.atan2(dy, dx);

        const arrowStartX = userX + Math.cos(angle) * 12;
        const arrowStartY = userY + Math.sin(angle) * 12;
        const arrowEndX = userX + Math.cos(angle) * (12 + arrowLength);
        const arrowEndY = userY + Math.sin(angle) * (12 + arrowLength);

        // Arrow line
        ctx.strokeStyle = config.deviationColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = config.deviationColor;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();

        // Arrow head
        const headLength = 8;
        const headAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
          arrowEndX - headLength * Math.cos(angle - headAngle),
          arrowEndY - headLength * Math.sin(angle - headAngle)
        );
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
          arrowEndX - headLength * Math.cos(angle + headAngle),
          arrowEndY - headLength * Math.sin(angle + headAngle)
        );
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

/**
 * Draw alignment score badge
 */
function drawAlignmentBadge(
  ctx: CanvasRenderingContext2D,
  alignmentScore: number,
  width: number
): void {
  ctx.save();

  const badgeX = width - 80;
  const badgeY = 20;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(badgeX - 10, badgeY - 5, 70, 30, 8);
  ctx.fill();

  // Text
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = alignmentScore >= 80
    ? '#22c55e'
    : alignmentScore >= 60
      ? '#eab308'
      : '#ef4444';
  ctx.textAlign = 'center';
  ctx.fillText(`${alignmentScore}%`, badgeX + 25, badgeY + 16);

  // Label
  ctx.font = '8px sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('ALIGN', badgeX + 25, badgeY + 5);

  ctx.restore();
}

// ============================================================================
// COMPONENT
// ============================================================================

interface GhostOverlayProps {
  userFrame: NormalizedLandmark[];
  idealFrame: NormalizedLandmark[];
  width: number;
  height: number;
  config?: Partial<GhostOverlayConfig>;
  onDeviationCalculated?: (deviation: FrameDeviation) => void;
}

export function GhostOverlay({
  userFrame,
  idealFrame,
  width,
  height,
  config: configOverride,
  onDeviationCalculated,
}: GhostOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Merge config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...configOverride,
  }), [configOverride]);

  // Calculate deviation (memoized per frame)
  const frameDeviation = useMemo(() => {
    if (!userFrame || !idealFrame || userFrame.length === 0) {
      return null;
    }
    return calculateFrameDeviation(
      userFrame,
      idealFrame,
      config.deviationThreshold
    );
  }, [userFrame, idealFrame, config.deviationThreshold]);

  // Get major deviations for highlighting
  const majorDeviations = useMemo(() => {
    if (!frameDeviation) return [];
    return getMajorDeviationJoints(frameDeviation);
  }, [frameDeviation]);

  // Notify parent of deviation (for UI display)
  useEffect(() => {
    if (frameDeviation && onDeviationCalculated) {
      onDeviationCalculated(frameDeviation);
    }
  }, [frameDeviation, onDeviationCalculated]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config.enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Exit early if no frames
    if (!userFrame || !idealFrame || userFrame.length === 0) return;

    // Draw ideal skeleton (ghost)
    drawIdealSkeleton(ctx, idealFrame, width, height, config);

    // Draw deviation highlights
    if (majorDeviations.length > 0) {
      drawDeviationHighlights(
        ctx,
        userFrame,
        idealFrame,
        majorDeviations,
        width,
        height,
        config
      );
    }

    // Draw alignment score badge
    if (frameDeviation) {
      drawAlignmentBadge(ctx, frameDeviation.alignmentScore, width);
    }

  }, [userFrame, idealFrame, width, height, config, majorDeviations, frameDeviation]);

  if (!config.enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        opacity: 0,
        animation: 'fadeIn 0.5s ease-out forwards',
      }}
    />
  );
}

// Add fadeIn animation via global styles or inline
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

// Inject styles (in production, use CSS modules or global CSS)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}