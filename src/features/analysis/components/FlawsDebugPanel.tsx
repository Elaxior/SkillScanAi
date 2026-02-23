/**
 * Flaws Debug Panel
 * 
 * Displays detected technique flaws and injury risks
 * for development and testing purposes.
 */

'use client';

import { useSessionStore, useUserStore } from '@/store';
import { Card } from '@/components/ui';
import type { DetectedFlaw, FlawSeverity } from '@/features/flaws';

/**
 * Get color classes based on severity
 */
function getSeverityColors(severity: FlawSeverity): {
  bg: string;
  text: string;
  border: string;
} {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/50',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/50',
      };
    case 'low':
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/50',
      };
  }
}

/**
 * Get severity badge label
 */
function getSeverityLabel(severity: FlawSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/**
 * Individual flaw card
 */
function FlawCard({ flaw }: { flaw: DetectedFlaw }) {
  const colors = getSeverityColors(flaw.severity);
  
  return (
    <div
      className={`rounded-lg border p-3 ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {flaw.injuryRisk && (
            <span className="text-red-400" title="Injury Risk">
              ⚠️
            </span>
          )}
          <span className="font-medium text-white">
            {flaw.title}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
        >
          {getSeverityLabel(flaw.severity)}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-300 mb-2">
        {flaw.description}
      </p>
      
      {/* Correction */}
      <div className="text-sm">
        <span className="text-gray-400">Fix: </span>
        <span className="text-gray-200">{flaw.correction}</span>
      </div>
      
      {/* Injury Details */}
      {flaw.injuryRisk && flaw.injuryDetails && (
        <div className="mt-2 text-xs text-red-300 bg-red-500/10 rounded p-2">
          <span className="font-medium">⚕️ Injury Risk: </span>
          {flaw.injuryDetails}
        </div>
      )}
      
      {/* Drill */}
      {flaw.drill && (
        <div className="mt-2 text-xs text-green-300 bg-green-500/10 rounded p-2">
          <span className="font-medium">🏀 Drill: </span>
          {flaw.drill.name} ({flaw.drill.duration})
        </div>
      )}
      
      {/* YouTube Link */}
      {flaw.youtubeUrl && (
        <a
          href={flaw.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
        >
          <span>📺</span>
          <span>Watch tutorial: {flaw.youtubeTitle || 'Video'}</span>
        </a>
      )}
      
      {/* Metric Value */}
      {flaw.actualValue !== undefined && (
        <div className="mt-2 text-xs text-gray-400 font-mono">
          Value: {typeof flaw.actualValue === 'number' 
            ? flaw.actualValue.toFixed(2) 
            : flaw.actualValue}
          {flaw.idealRange && ` (Ideal: ${flaw.idealRange})`}
        </div>
      )}
    </div>
  );
}

interface FlawsDebugPanelProps {
  className?: string;
}

export function FlawsDebugPanel({ className = '' }: FlawsDebugPanelProps) {
  const flaws = useSessionStore((state) => state.flaws);
  const injuryRiskLevel = useSessionStore((state) => state.injuryRiskLevel);
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);
  
  const hasFlaws = flaws.length > 0;
  const injuryFlaws = flaws.filter((f) => f.injuryRisk);
  const highSeverityFlaws = flaws.filter((f) => f.severity === 'high');
  const mediumSeverityFlaws = flaws.filter((f) => f.severity === 'medium');
  const lowSeverityFlaws = flaws.filter((f) => f.severity === 'low');
  
  return (
    <Card className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Detected Flaws
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          {selectedSport} / {selectedAction?.replace(/_/g, ' ')}
        </span>
      </div>
      
      {/* Injury Risk Banner */}
      {injuryRiskLevel !== 'none' && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            injuryRiskLevel === 'high'
              ? 'bg-red-500/20 border-red-500/50'
              : injuryRiskLevel === 'moderate'
              ? 'bg-orange-500/20 border-orange-500/50'
              : 'bg-yellow-500/20 border-yellow-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <span className="font-medium text-white">
                {injuryRiskLevel === 'high'
                  ? 'High Injury Risk Detected'
                  : injuryRiskLevel === 'moderate'
                  ? 'Moderate Injury Risk'
                  : 'Potential Injury Risk'}
              </span>
              <p className="text-sm text-gray-300">
                {injuryFlaws.length} issue(s) may increase injury risk.
                Review the details below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary */}
      {hasFlaws && (
        <div className="mb-4 flex gap-2 text-sm">
          {highSeverityFlaws.length > 0 && (
            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">
              {highSeverityFlaws.length} High
            </span>
          )}
          {mediumSeverityFlaws.length > 0 && (
            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
              {mediumSeverityFlaws.length} Medium
            </span>
          )}
          {lowSeverityFlaws.length > 0 && (
            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              {lowSeverityFlaws.length} Low
            </span>
          )}
        </div>
      )}
      
      {/* No Flaws State */}
      {!hasFlaws && (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">✅</span>
          <p className="text-gray-400">
            No significant flaws detected!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Your technique looks good. Keep practicing!
          </p>
        </div>
      )}
      
      {/* Flaw List */}
      {hasFlaws && (
        <div className="space-y-3">
          {flaws.map((flaw) => (
            <FlawCard key={flaw.id} flaw={flaw} />
          ))}
        </div>
      )}
    </Card>
  );
}