/**
 * Analysis Page - Updated with Scoring Integration
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button, Card, Loader } from '@/components/ui';
import { useSessionStore, useUserStore } from '@/store';
import { useMetricCalculation } from '@/features/sports/hooks/useMetricCalculation';
import { useScoringEngine } from '@/features/scoring/hooks/useScoringEngine';
import { MetricsDebugPanel, ScoreDebugPanel } from '@/features/analysis/components';
import { AnalysisView } from '@/features/analysis';

export default function AnalysisPage() {
  const router = useRouter();
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Store data
  const videoUrl = useSessionStore((state) => state.video.url);
  const smoothedFrames = useSessionStore((state) => state.smoothedLandmarks);
  const metrics = useSessionStore((state) => state.metrics);
  const score = useSessionStore((state) => state.score);
  const setMetrics = useSessionStore((state) => state.setMetrics);
  const clearScoring = useSessionStore((state) => state.clearScoring);
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);

  // Hooks
  const {
    calculateMetrics,
    isCalculating: isCalculatingMetrics,
    error: metricsError,
    isSportSupported: sportSupported,
  } = useMetricCalculation();

  const {
    calculateScore,
    isCalculating: isCalculatingScore,
    error: scoringError,
  } = useScoringEngine();

  // Derived state
  const hasVideo = Boolean(videoUrl);
  const hasPoseData = smoothedFrames && smoothedFrames.length > 0;
  const hasMetrics = Object.keys(metrics).length > 0;
  const hasScore = score !== null;
  const isCalculating = isCalculatingMetrics || isCalculatingScore;

  // Stage 1: Calculate metrics once pose data is ready
  useEffect(() => {
    if (hasPoseData && !hasMetrics && !isCalculatingMetrics) {
      console.log('[AnalysisPage] Starting metric calculation...');
      const metricsResult = calculateMetrics();
      if (!metricsResult) {
        console.error('[AnalysisPage] Metric calculation failed');
      } else {
        console.log('[AnalysisPage] Metrics calculated:', metricsResult);
      }
    }
  }, [hasPoseData, hasMetrics, isCalculatingMetrics, calculateMetrics]);

  // Stage 2: Calculate score once metrics are ready
  useEffect(() => {
    if (hasMetrics && !hasScore && !isCalculatingScore && !analysisComplete) {
      console.log('[AnalysisPage] Starting score calculation...');
      const scoreResult = calculateScore();
      if (scoreResult) {
        console.log('[AnalysisPage] Score calculated:', scoreResult.overallScore);
        setAnalysisComplete(true);
      }
    }
  }, [hasMetrics, hasScore, isCalculatingScore, analysisComplete, calculateScore]);

  // Redirect if no video
  useEffect(() => {
    if (!hasVideo) {
      console.log('[AnalysisPage] No video found, redirecting to camera');
      router.push('/camera');
    }
  }, [hasVideo, router]);

  // Handle re-analysis: reset stored results so the pipeline effects re-run
  const handleReanalyze = () => {
    setMetrics({});
    clearScoring();
    setAnalysisComplete(false);
  };

  if (!hasVideo) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Analysis Results
            </h1>
            <p className="text-gray-400 mt-1">
              {selectedSport && selectedAction
                ? `${selectedSport} - ${selectedAction.replace(/_/g, ' ')}`
                : 'Processing your performance'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReanalyze}
              disabled={isCalculating || !hasPoseData}
            >
              {isCalculating ? 'Analyzing...' : 'Re-analyze'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/camera')}
            >
              New Recording
            </Button>
          </div>
        </div>

        {/* Sport Support Warning */}
        {!sportSupported && selectedSport && (
          <Card className="p-4 border-yellow-500/50 bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-400">
                  Limited Support
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Full analysis for {selectedSport} is coming soon.
                  Currently, only basketball (jump shot) is fully implemented.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {(metricsError || scoringError) && (
          <Card className="p-4 border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <div>
                <h3 className="font-medium text-red-400">
                  Analysis Error
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  {metricsError || scoringError}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Calculating State */}
        {isCalculating && (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader size="lg" />
              <p className="mt-4 text-gray-400">
                {isCalculatingMetrics
                  ? 'Extracting performance metrics...'
                  : 'Calculating your score...'}
              </p>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video + Overlay Column */}
          <div className="lg:col-span-2">
            <AnalysisView />
          </div>

          {/* Scoring & Metrics Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Score Panel (Primary) */}
            <ScoreDebugPanel />

            {/* Metrics Panel (Secondary) */}
            <MetricsDebugPanel />
          </div>
        </div>

        {/* No Pose Data Warning */}
        {!hasPoseData && !isCalculating && (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">
              No pose data available. The video needs to be processed first.
            </p>
            <Button onClick={() => router.push('/camera')}>
              Go to Camera
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}