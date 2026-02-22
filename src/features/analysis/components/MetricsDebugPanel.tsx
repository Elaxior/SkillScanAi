/**
 * Debug panel for displaying calculated metrics
 * 
 * This component provides a visual representation of all calculated metrics,
 * useful for development and testing purposes.
 */

'use client';

import { useSessionStore } from '@/store';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui';
import { isSportSupported } from '@/features/sports';

/**
 * Format a metric value for display
 */
function formatMetricValue(value: number | null, unit?: string): string {
  if (value === null) return '—';
  
  const formatted = typeof value === 'number' && !Number.isInteger(value)
    ? value.toFixed(2)
    : String(value);
  
  return unit ? `${formatted}${unit}` : formatted;
}

/**
 * Get the display name for a metric key
 */
function getMetricDisplayName(key: string): string {
  const nameMap: Record<string, string> = {
    releaseAngle: 'Release Angle',
    elbowAngleAtRelease: 'Elbow Angle (Release)',
    kneeAngleAtPeak: 'Knee Angle (Peak)',
    jumpHeightNormalized: 'Jump Height',
    stabilityIndex: 'Stability Index',
    followThroughScore: 'Follow Through',
    releaseTimingMs: 'Release Timing',
  };
  
  return nameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Get the unit for a metric
 */
function getMetricUnit(key: string): string {
  const unitMap: Record<string, string> = {
    releaseAngle: '°',
    elbowAngleAtRelease: '°',
    kneeAngleAtPeak: '°',
    releaseTimingMs: 'ms',
    stabilityIndex: '/100',
    followThroughScore: '/100',
  };
  
  return unitMap[key] || '';
}

/**
 * Get the ideal range for a metric (for basketball jump shot)
 */
function getMetricIdealRange(key: string): string | null {
  const rangeMap: Record<string, string> = {
    releaseAngle: '45-55°',
    elbowAngleAtRelease: '150-170°',
    kneeAngleAtPeak: '160-180°',
    stabilityIndex: '80-100',
    followThroughScore: '70-100',
    releaseTimingMs: '-50 to 0',
  };
  
  return rangeMap[key] || null;
}

/**
 * Check if a metric value is within the ideal range
 */
function isMetricInRange(key: string, value: number | null): boolean | null {
  if (value === null) return null;
  
  const ranges: Record<string, [number, number]> = {
    releaseAngle: [45, 55],
    elbowAngleAtRelease: [150, 170],
    kneeAngleAtPeak: [160, 180],
    stabilityIndex: [80, 100],
    followThroughScore: [70, 100],
    releaseTimingMs: [-50, 0],
  };
  
  const range = ranges[key];
  if (!range) return null;
  
  return value >= range[0] && value <= range[1];
}

interface MetricsDebugPanelProps {
  className?: string;
}

export function MetricsDebugPanel({ className = '' }: MetricsDebugPanelProps) {
  const metrics = useSessionStore((state) => state.metrics);
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  
  const sportSupported = isSportSupported(selectedSport || '');
  const hasMetrics = Object.keys(metrics).length > 0;
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Metrics Debug Panel
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          {selectedSport} / {selectedAction}
        </span>
      </div>
      
      {!sportSupported && (
        <div className="text-yellow-400 text-sm mb-4">
          ⚠️ Sport &quot;{selectedSport}&quot; is not yet fully implemented
        </div>
      )}
      
      {!hasMetrics ? (
        <div className="text-gray-400 text-sm py-8 text-center">
          No metrics calculated yet.
          <br />
          Process a video to see metrics.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(metrics).map(([key, value]) => {
            const isInRange = isMetricInRange(key, value);
            const idealRange = getMetricIdealRange(key);
            
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300">
                    {getMetricDisplayName(key)}
                  </span>
                  {idealRange && (
                    <span className="text-xs text-gray-500">
                      Ideal: {idealRange}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-mono font-semibold ${
                      isInRange === true
                        ? 'text-green-400'
                        : isInRange === false
                        ? 'text-yellow-400'
                        : 'text-white'
                    }`}
                  >
                    {formatMetricValue(value, getMetricUnit(key))}
                  </span>
                  
                  {isInRange !== null && (
                    <span className="text-sm">
                      {isInRange ? '✓' : '⚠'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Keyframe Debug Info */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          Keyframes Used
        </h4>
        <KeyframeDebugInfo />
      </div>
    </Card>
  );
}

function KeyframeDebugInfo() {
  const keyframes = useSessionStore((state) => state.keyframes);
  const fps = useSessionStore((state) => state.fps);
  
  const formatFrame = (frame: number | null): string => {
    if (frame === null) return '—';
    const time = fps !== null && fps > 0 ? (frame / fps).toFixed(2) : '?';
    return `${frame} (${time}s)`;
  };
  
  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
      <div className="text-gray-500">Start:</div>
      <div className="text-gray-300">{formatFrame(keyframes.start)}</div>
      
      <div className="text-gray-500">Peak Jump:</div>
      <div className="text-gray-300">{formatFrame(keyframes.peakJump)}</div>
      
      <div className="text-gray-500">Release:</div>
      <div className="text-gray-300">{formatFrame(keyframes.release)}</div>
      
      <div className="text-gray-500">End:</div>
      <div className="text-gray-300">{formatFrame(keyframes.end)}</div>
      
      <div className="text-gray-500">FPS:</div>
      <div className="text-gray-300">{fps !== null ? fps.toFixed(1) : 'N/A'}</div>
    </div>
  );
}