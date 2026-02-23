/**
 * Analysis Page - Polished Results Layout
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button, Card, Loader, ScoreRing, Badge } from '@/components/ui';
import { useSessionStore, useUserStore } from '@/store';
import { useMetricCalculation } from '@/features/sports/hooks/useMetricCalculation';
import { useScoringEngine } from '@/features/scoring/hooks/useScoringEngine';
import { useFlawDetection } from '@/features/flaws/hooks/useFlawDetection';
import { AnalysisView } from '@/features/analysis';
import { getLetterGrade, getPerformanceLevel } from '@/features/scoring';
import type { DetectedFlaw } from '@/features/flaws';

function metricLabel(key: string): string {
  const map: Record<string, string> = {
    releaseAngle: 'Release Angle',
    elbowAngleAtRelease: 'Elbow Angle',
    kneeAngleAtPeak: 'Knee Angle',
    jumpHeightNormalized: 'Jump Height',
    stabilityIndex: 'Stability',
    followThroughScore: 'Follow-Through',
    releaseTimingMs: 'Release Timing',
  };
  return map[key] ?? key.replace(/([A-Z])/g, ' $1').trim();
}

function scoreColors(s: number) {
  if (s >= 90) return { text: 'text-green-400', bar: 'bg-green-500' };
  if (s >= 75) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (s >= 60) return { text: 'text-yellow-400', bar: 'bg-yellow-500' };
  if (s >= 45) return { text: 'text-orange-400', bar: 'bg-orange-500' };
  return { text: 'text-red-400', bar: 'bg-red-500' };
}

function severityClasses(s: DetectedFlaw['severity']) {
  if (s === 'high') return 'bg-red-500/10 border-red-500/40 text-red-400';
  if (s === 'medium') return 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400';
  return 'bg-blue-500/10 border-blue-500/40 text-blue-400';
}

export default function AnalysisPage() {
  const router = useRouter();
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const videoUrl = useSessionStore((s) => s.video.url);
  const smoothedFrames = useSessionStore((s) => s.smoothedLandmarks);
  const metrics = useSessionStore((s) => s.metrics);
  const score = useSessionStore((s) => s.score);
  const scoreBreakdown = useSessionStore((s) => s.scoreBreakdown);
  const scoreConfidence = useSessionStore((s) => s.scoreConfidence);
  const flaws = useSessionStore((s) => s.flaws);
  const injuryRiskLevel = useSessionStore((s) => s.injuryRiskLevel);
  const selectedSport = useUserStore((s) => s.selectedSport);
  const selectedAction = useUserStore((s) => s.selectedAction);

  const { calculateMetrics, isCalculating: calcM, error: errM } = useMetricCalculation();
  const { calculateScore, isCalculating: calcS, error: errS } = useScoringEngine();
  const { detectFlawsFromMetrics, isDetecting: calcF, error: errF, hasInjuryRisks } = useFlawDetection();

  const hasVideo = Boolean(videoUrl);
  const hasPoseData = smoothedFrames && smoothedFrames.length > 0;
  const hasMetrics = Object.keys(metrics).length > 0;
  const hasScore = score !== null;
  const isCalculating = calcM || calcS || calcF;
  const anyError = errM || errS || errF;

  const runAnalysis = useCallback(async () => {
    const m = calculateMetrics();
    if (!m) return;
    await new Promise((r) => setTimeout(r, 60));
    calculateScore();
    await new Promise((r) => setTimeout(r, 60));
    detectFlawsFromMetrics();
    setAnalysisComplete(true);
  }, [calculateMetrics, calculateScore, detectFlawsFromMetrics]);

  useEffect(() => {
    if (hasPoseData && !analysisComplete && !hasMetrics) runAnalysis();
  }, [hasPoseData, analysisComplete, hasMetrics, runAnalysis]);

  useEffect(() => {
    if (!hasVideo) router.push('/camera');
  }, [hasVideo, router]);

  if (!hasVideo) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </PageContainer>
    );
  }

  const grade = hasScore ? getLetterGrade(score!) : null;
  const level = hasScore ? getPerformanceLevel(score!) : null;
  const sorted = Object.entries(scoreBreakdown).sort(([, a], [, b]) => b - a);
  const highF = flaws.filter((f) => f.severity === 'high');
  const medF = flaws.filter((f) => f.severity === 'medium');
  const lowF = flaws.filter((f) => f.severity === 'low');

  return (
    <PageContainer>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
              {hasInjuryRisks && <Badge variant="danger" size="sm">⚠️ Injury Risk</Badge>}
              {hasScore && grade && (
                <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${score! >= 75 ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : score! >= 55 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                      : 'bg-red-500/20 border-red-500/50 text-red-300'
                  }`}>
                  {grade} - {score}/100
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-1 text-sm">
              {selectedSport && selectedAction
                ? `${selectedSport} - ${selectedAction.replace(/_/g, ' ')}`
                : 'Processing your performance'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setAnalysisComplete(false); runAnalysis(); }}
              disabled={isCalculating || !hasPoseData}
            >
              {isCalculating ? 'Analyzing...' : 'Re-analyze'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/camera')}>
              New Recording
            </Button>
          </div>
        </div>

        {/* Error */}
        {anyError && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/40 bg-red-500/10">
            <span className="text-red-400 text-xl">X</span>
            <div>
              <p className="font-semibold text-red-400">Analysis Error</p>
              <p className="text-sm text-gray-300 mt-0.5">{anyError}</p>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {isCalculating && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary-500/30 bg-primary-500/10">
            <Loader size="sm" variant="ai" color="primary" />
            <p className="text-primary-300 text-sm">
              {calcM ? 'Extracting performance metrics...' : calcS ? 'Calculating score...' : 'Detecting technique flaws...'}
            </p>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* Left: Video + skeleton */}
          <div className="xl:col-span-3">
            <AnalysisView />
          </div>

          {/* Right: Score + Flaws */}
          <div className="xl:col-span-2 flex flex-col gap-4">

            {/* Score Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Performance Score</h3>
                <span className="text-xs text-gray-500 font-mono">
                  {selectedSport} / {selectedAction?.replace(/_/g, ' ')}
                </span>
              </div>

              {!hasScore ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  {isCalculating ? (
                    <Loader size="md" variant="ai" color="primary" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full bg-gray-700/50 flex items-center justify-center text-2xl">
                        chart
                      </div>
                      <p className="text-gray-400 text-sm">
                        {hasPoseData ? 'Click Re-analyze to score' : 'Waiting for pose data...'}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-5">
                    <ScoreRing score={score!} size="lg" animate glow showScore />
                    <div className="flex-1 min-w-0">
                      <div className={`text-4xl font-bold leading-none ${scoreColors(score!).text}`}>{grade}</div>
                      <div className="text-sm text-gray-300 mt-1 font-medium">{level}</div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(scoreConfidence ?? 0) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((scoreConfidence ?? 0) * 100)}% conf.</span>
                      </div>
                    </div>
                  </div>

                  {sorted.length > 0 && (
                    <div className="space-y-2.5 pt-1 border-t border-gray-700/50">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-1">Breakdown</p>
                      {sorted.map(([key, val]) => {
                        const c = scoreColors(val);
                        return (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-300">{metricLabel(key)}</span>
                              <span className={`text-xs font-mono font-semibold ${c.text}`}>{val}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Flaws Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Detected Flaws</h3>
                {flaws.length > 0 && (
                  <div className="flex gap-1.5">
                    {highF.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{highF.length} High</span>}
                    {medF.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{medF.length} Med</span>}
                    {lowF.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{lowF.length} Low</span>}
                  </div>
                )}
              </div>

              {injuryRiskLevel !== 'none' && (
                <div className={`mb-4 p-2.5 rounded-lg border text-xs ${injuryRiskLevel === 'high' ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : injuryRiskLevel === 'moderate' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                      : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                  }`}>
                  Warning: {injuryRiskLevel === 'high' ? 'High' : injuryRiskLevel === 'moderate' ? 'Moderate' : 'Potential'} injury risk detected
                </div>
              )}

              {!hasScore ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-gray-400 text-sm">Run analysis to detect flaws</p>
                </div>
              ) : flaws.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl">OK</div>
                  <p className="text-green-400 font-medium text-sm">No significant flaws detected!</p>
                  <p className="text-gray-500 text-xs">Your technique looks solid. Keep practicing!</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[380px]">
                  {flaws.map((flaw, i) => {
                    const cls = severityClasses(flaw.severity);
                    const [bg, border] = cls.split(' ');
                    return (
                      <div key={i} className={`rounded-lg border p-3 ${bg} ${border}`}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {flaw.injuryRisk && <span>!</span>}
                            <span className="font-medium text-white text-sm">{flaw.title}</span>
                          </div>
                          <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border ${cls}`}>{flaw.severity}</span>
                        </div>
                        <p className="text-xs text-gray-300 mb-1.5">{flaw.description}</p>
                        <p className="text-xs"><span className="text-gray-500">Fix: </span><span className="text-gray-200">{flaw.correction}</span></p>
                        {flaw.drill && <p className="mt-1.5 text-xs text-green-400">🏀 {flaw.drill.name} · {flaw.drill.duration}</p>}
                        {flaw.actualValue !== undefined && (
                          <p className="mt-1 text-xs text-gray-600 font-mono">
                            Measured: {typeof flaw.actualValue === 'number' ? flaw.actualValue.toFixed(1) : flaw.actualValue}
                            {flaw.idealRange ? ` (ideal: ${flaw.idealRange})` : ''}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>

        {!hasPoseData && !isCalculating && (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4 text-sm">No pose data available. Process a video first.</p>
            <Button onClick={() => router.push('/camera')}>Go to Camera</Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
