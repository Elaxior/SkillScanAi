/**
 * Score Debug Panel
 * 
 * Displays the calculated performance score and breakdown
 * for development and testing purposes.
 */

'use client';

import { useSessionStore, useUserStore } from '@/store';
import { Card } from '@/components/ui';
import { getLetterGrade, getPerformanceLevel } from '@/features/scoring';

/**
 * Get color class based on score
 */
function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get background color based on score
 */
function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-500/20';
  if (score >= 80) return 'bg-emerald-500/20';
  if (score >= 70) return 'bg-yellow-500/20';
  if (score >= 60) return 'bg-orange-500/20';
  return 'bg-red-500/20';
}

/**
 * Format metric key to display name
 */
function formatMetricName(key: string): string {
  const nameMap: Record<string, string> = {
    releaseAngle: 'Release Angle',
    elbowAngleAtRelease: 'Elbow Angle',
    kneeAngleAtPeak: 'Knee Angle',
    jumpHeightNormalized: 'Jump Height',
    stabilityIndex: 'Stability',
    followThroughScore: 'Follow Through',
    releaseTimingMs: 'Release Timing',
  };
  
  return nameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

interface ScoreDebugPanelProps {
  className?: string;
}

export function ScoreDebugPanel({ className = '' }: ScoreDebugPanelProps) {
  const score = useSessionStore((state) => state.score);
  const scoreBreakdown = useSessionStore((state) => state.scoreBreakdown);
  const scoreConfidence = useSessionStore((state) => state.scoreConfidence);
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  
  const hasScore = score !== null;
  const hasBreakdown = Object.keys(scoreBreakdown).length > 0;
  
  return (
    <Card className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Performance Score
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          {selectedSport} / {selectedAction?.replace(/_/g, ' ')}
        </span>
      </div>
      
      {/* No Score State */}
      {!hasScore && (
        <div className="text-gray-400 text-sm py-8 text-center">
          No score calculated yet.
          <br />
          Process a video and calculate metrics first.
        </div>
      )}
      
      {/* Main Score Display */}
      {hasScore && (
        <>
          {/* Overall Score */}
          <div className={`rounded-lg p-6 mb-4 ${getScoreBgColor(score)}`}>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-lg text-gray-300 mt-1">
                {getLetterGrade(score)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {getPerformanceLevel(score)}
              </div>
            </div>
          </div>
          
          {/* Confidence Indicator */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>Confidence</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${scoreConfidence * 100}%` }}
                />
              </div>
              <span>{Math.round(scoreConfidence * 100)}%</span>
            </div>
          </div>
          
          {/* Score Breakdown */}
          {hasBreakdown && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Breakdown
              </h4>
              
              {Object.entries(scoreBreakdown)
                .sort(([, a], [, b]) => b - a) // Sort by score descending
                .map(([metric, metricScore]) => (
                  <div
                    key={metric}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-gray-300">
                      {formatMetricName(metric)}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Score Bar */}
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            metricScore >= 80
                              ? 'bg-green-500'
                              : metricScore >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${metricScore}%` }}
                        />
                      </div>
                      
                      {/* Score Value */}
                      <span
                        className={`text-sm font-mono w-8 text-right ${getScoreColor(
                          metricScore
                        )}`}
                      >
                        {metricScore}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}