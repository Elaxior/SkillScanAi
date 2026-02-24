/**
 * Analysis Page - Production Optimized
 * 
 * Final hardened version with:
 * - Demo mode support
 * - Error boundaries
 * - Performance optimizations
 * - Graceful failure handling
 * - Processing time limits
 */

'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout';
import { Button, Loader } from '@/components/ui';
import { ErrorBoundary, AnalysisErrorFallback } from '@/components/ErrorBoundary';
import { ProcessingComplete } from '@/components/ui/ProcessingIndicator';
import { useSessionStore, useUserStore } from '@/store';
import { useMetricCalculation } from '@/features/sports/hooks/useMetricCalculation';
import { useScoringEngine } from '@/features/scoring/hooks/useScoringEngine';
import { useFlawDetection } from '@/features/flaws/hooks/useFlawDetection';
import { useDemoMode, DemoBanner } from '@/features/demo';
import { ResultsDashboard } from '@/features/results';
import { AnalysisView } from '@/features/analysis';
import { usePoseProcessor } from '@/features/pose';
import type { PoseProcessorConfig } from '@/features/pose';
import type { PoseFrame, ProcessingProgress } from '@/features/pose/types';
import { detectKeyframes } from '@/features/processing';
import { showToast } from '@/components/ui/Toast';
import { MAX_PROCESSING_TIME_MS, createTimer } from '@/lib/performance';

// Module-level flag prevents double-invocation from React Strict Mode (dev double-mount)
// Unlike a ref, this persists across unmount/remount cycles within the same page load
let _analysisRunning = false;

export default function AnalysisPage() {
  const router = useRouter();

  // Processing state
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('Initializing');
  const [isRunning, setIsRunning] = useState(false);
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [liveFrameCount, setLiveFrameCount] = useState(0);
  const [liveConfidence, setLiveConfidence] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  // Refs for cleanup
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  // Demo mode
  const { demoMode, loadDemoData, isDemoSession } = useDemoMode();

  // Store data
  const videoUrl = useSessionStore((state) => state.video.url);
  const smoothedLandmarks = useSessionStore((state) => state.smoothedLandmarks);
  const metrics = useSessionStore((state) => state.metrics);
  const score = useSessionStore((state) => state.score);
  const scoreBreakdown = useSessionStore((state) => state.scoreBreakdown);
  const scoreConfidence = useSessionStore((state) => state.scoreConfidence);
  const flaws = useSessionStore((state) => state.flaws);
  const selectedSport = useUserStore((state) => state.selectedSport);
  const selectedAction = useUserStore((state) => state.selectedAction);

  // Session store actions for pose data
  const setLandmarks = useSessionStore((state) => state.setLandmarks);
  const setSmoothedLandmarks = useSessionStore((state) => state.setSmoothedLandmarks);
  const setPoseResult = useSessionStore((state) => state.setPoseResult);
  const setFps = useSessionStore((state) => state.setFps);
  const setKeyframes = useSessionStore((state) => state.setKeyframes);

  // Per-frame callback — updates live stats and drives progress ring during pose detection
  const onFrameProcessed = useCallback((frame: PoseFrame) => {
    setLiveFrameCount((n) => n + 1);
    setLiveConfidence(frame.confidence);
  }, []);

  const onPoseProgress = useCallback((prog: ProcessingProgress) => {
    // Pose processor reports 0–100% for just the detection phase → map to 5–50% of pipeline
    const mapped = 5 + Math.round((prog.percentage / 100) * 45);
    setProcessingProgress(mapped);
  }, []);

  // Pose processor
  const { processVideo } = usePoseProcessor({ onFrameProcessed, onProgress: onPoseProgress });

  // Hooks
  const {
    calculateMetrics,
    isCalculating: isCalculatingMetrics,
    error: metricsError,
  } = useMetricCalculation();

  const {
    calculateScore,
    isCalculating: isCalculatingScore,
    error: scoringError,
  } = useScoringEngine();

  const {
    detectFlawsFromMetrics,
    isDetecting: isDetectingFlaws,
    error: flawError,
  } = useFlawDetection();

  // Derived state
  const hasVideo = Boolean(videoUrl);
  const hasPoseData = smoothedLandmarks && smoothedLandmarks.length > 0;
  const hasMetrics = Object.keys(metrics).length > 0;
  const isCalculating = isCalculatingMetrics || isCalculatingScore || isDetectingFlaws;
  const hasError = Boolean(metricsError || scoringError || flawError);

  // Memoized values for performance
  const frameCount = useMemo(() => smoothedLandmarks?.length ?? 0, [smoothedLandmarks]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    isProcessingRef.current = false;
    _analysisRunning = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Track elapsed time while running
  useEffect(() => {
    if (!isRunning || !processingStartTime) { setLoadingElapsed(0); return; }
    const iv = setInterval(() => setLoadingElapsed((Date.now() - processingStartTime) / 1000), 100);
    return () => clearInterval(iv);
  }, [isRunning, processingStartTime]);

  // Smoothly lerp displayProgress toward the real processingProgress every 80ms
  useEffect(() => {
    if (!isRunning) { setDisplayProgress(0); return; }
    const iv = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= processingProgress) return prev;
        // Step size: bigger gap → bigger step (feels snappier on jumps, smooth on creep)
        const step = Math.max(0.5, (processingProgress - prev) * 0.12);
        return Math.min(prev + step, processingProgress);
      });
    }, 80);
    return () => clearInterval(iv);
  }, [isRunning, processingProgress]);

  // Run analysis pipeline
  const runAnalysis = useCallback(async () => {
    if (isProcessingRef.current || _analysisRunning) {
      console.log('[AnalysisPage] Already processing, skipping');
      return;
    }

    isProcessingRef.current = true;
    _analysisRunning = true;
    setIsRunning(true);
    setLiveFrameCount(0);
    setLiveConfidence(0);
    const timer = createTimer();
    setProcessingStartTime(Date.now());
    setProcessingProgress(0);

    console.log('[AnalysisPage] Starting analysis pipeline...');

    // Set timeout for max processing time
    processingTimeoutRef.current = setTimeout(() => {
      if (isProcessingRef.current) {
        console.warn('[AnalysisPage] Processing timeout reached');
        showToast('warning', 'Processing is taking longer than expected. Results may be partial.');
        setAnalysisComplete(true);
        isProcessingRef.current = false;
      }
    }, MAX_PROCESSING_TIME_MS);

    try {
      // Step 1: Pose detection (run if no pose data yet)
      const currentHasPoseData = useSessionStore.getState().hasPoseData;
      if (!currentHasPoseData) {
        setProcessingStage('Loading Pose Model');
        setProcessingProgress(5);

        const videoEl = hiddenVideoRef.current;
        if (!videoEl || !videoUrl) {
          throw new Error('No video available for pose detection');
        }

        setProcessingStage('Detecting Pose');
        const poseResult = await processVideo(videoEl);

        if (poseResult === null) {
          // Null means processing was cancelled (e.g. Strict Mode first-mount cleanup).
          // Check if the store already has pose data from a concurrent run.
          if (useSessionStore.getState().hasPoseData) {
            console.log('[AnalysisPage] processVideo null but store already has pose data – continuing to metrics');
          } else {
            // No pose data and no result — the video element was likely destroyed
            // before processing finished (Strict Mode first-mount). 
            // isProcessingRef will still be true if THIS run owns the pipeline.
            // Exit only if our own run was externally cancelled (ref cleared by cleanup).
            if (!isProcessingRef.current) {
              console.log('[AnalysisPage] processVideo null – cancelled by cleanup, exiting silently');
              return;
            }
            throw new Error(
              'No pose detected. Make sure your full body is visible and the video is well-lit.'
            );
          }
        } else {
          if (poseResult.frames.length === 0) {
            throw new Error(
              'No pose detected. Make sure your full body is visible and the video is well-lit.'
            );
          }

          setLandmarks(poseResult.frames);
          setSmoothedLandmarks(poseResult.frames);
          setPoseResult(poseResult);

          // Compute FPS from the processed result so metric calculation has a valid value.
          const computedFps =
            poseResult.videoDuration > 0
              ? Math.round(poseResult.frames.length / poseResult.videoDuration)
              : 30;
          setFps(Math.max(1, computedFps));

          // Detect keyframes (peak jump, release point, start/end)
          setProcessingStage('Detecting Keyframes');
          const kfResult = detectKeyframes(poseResult.frames, poseResult.videoDuration);
          setKeyframes(kfResult.keyframes);
          console.log('[AnalysisPage] Keyframes detected:', kfResult.keyframes);
          console.log('[AnalysisPage] Pose detection done:', poseResult.framesWithPose, 'frames, fps:', computedFps);
        }

        setProcessingProgress(50);
        await new Promise((resolve) => setTimeout(resolve, 90));
      }

      // Step 2: Calculate metrics
      setProcessingStage('Extracting Metrics');
      setProcessingProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 90));

      const metricsResult = calculateMetrics();
      if (!metricsResult) {
        throw new Error('Metric calculation failed');
      }

      setProcessingProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 90));

      // Step 3: Calculate score
      setProcessingStage('Calculating Score');
      await new Promise((resolve) => setTimeout(resolve, 90));

      calculateScore();
      setProcessingProgress(88);
      await new Promise((resolve) => setTimeout(resolve, 90));

      // Step 4: Detect flaws
      setProcessingStage('Analyzing Form');
      await new Promise((resolve) => setTimeout(resolve, 90));

      detectFlawsFromMetrics();
      setProcessingProgress(100);
      // Let the ring animate all the way to 100 before revealing results
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Complete
      const timeMs = timer.elapsed();
      setProcessingTimeMs(timeMs);
      setAnalysisComplete(true);

      timer.log('Full analysis pipeline');
      showToast('success', `Analysis complete in ${(timeMs / 1000).toFixed(1)}s`);

    } catch (error) {
      console.error('[AnalysisPage] Analysis error:', error);
      showToast('error', error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      _analysisRunning = false;
      setIsRunning(false);
      cleanup();
    }
  }, [
    videoUrl,
    processVideo,
    setLandmarks,
    setSmoothedLandmarks,
    setPoseResult,
    setFps,
    setKeyframes,
    calculateMetrics,
    calculateScore,
    detectFlawsFromMetrics,
    cleanup,
  ]);

  // Reset videoReady whenever the URL changes (new upload / new session)
  useEffect(() => {
    setVideoReady(false);
  }, [videoUrl]);

  // Auto-run analysis — wait until the hidden <video> has actually loaded its data
  useEffect(() => {
    if (videoReady && !analysisComplete && !hasMetrics && !demoMode) {
      runAnalysis();
    }
  }, [videoReady, analysisComplete, hasMetrics, demoMode, runAnalysis]);

  // Handle demo mode
  useEffect(() => {
    if (demoMode && !isDemoSession && !hasVideo) {
      console.log('[AnalysisPage] Demo mode active, loading demo data');
      loadDemoData();
      setAnalysisComplete(true);
    }
  }, [demoMode, isDemoSession, hasVideo, loadDemoData]);

  // Redirect if no video and not demo mode
  useEffect(() => {
    if (!hasVideo && !demoMode) {
      router.push('/camera');
    }
  }, [hasVideo, demoMode, router]);

  // Handle re-analysis
  const handleReanalyze = useCallback(() => {
    setAnalysisComplete(false);
    setProcessingTimeMs(null);
    runAnalysis();
  }, [runAnalysis]);

  // Handle navigation
  const handleNewRecording = useCallback(() => {
    cleanup();
    router.push('/camera');
  }, [cleanup, router]);

  // Loading state
  if (!hasVideo && !demoMode) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" text="Loading..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-8">
      {/* Hidden video used for pose detection */}
      {videoUrl && (
        <video
          ref={hiddenVideoRef}
          src={videoUrl}
          className="hidden"
          preload="auto"
          playsInline
          muted
          onLoadedData={() => setVideoReady(true)}
        />
      )}

      {/* Demo Banner */}
      <DemoBanner className="mb-6" onLoadDemo={() => setAnalysisComplete(true)} />

      {/* Main Content */}
      <ErrorBoundary
        fallback={
          <AnalysisErrorFallback
            onRetry={handleReanalyze}
            onNewRecording={handleNewRecording}
          />
        }
      >
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {isRunning && (() => {
            const R = 64;
            const circ = 2 * Math.PI * R;
            const offset = circ * (1 - displayProgress / 100);
            return (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] gap-12"
              >
                {/* SVG progress ring */}
                <div className="relative flex items-center justify-center">
                  <svg width="168" height="168" className="-rotate-90">
                    {/* Track */}
                    <circle
                      cx="84" cy="84" r={R}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="6"
                    />
                    {/* Progress arc */}
                    <motion.circle
                      cx="84" cy="84" r={R}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </svg>
                  {/* Centre text */}
                  <div className="absolute flex flex-col items-center">
                    <span
                      className="text-3xl font-black text-white tabular-nums leading-none"
                      style={{ fontFamily: "'Barlow Condensed', monospace" }}
                    >
                      {Math.round(displayProgress)}%
                    </span>
                  </div>
                </div>

                {/* Console readout */}
                <div className="font-mono text-sm space-y-2.5 text-left w-64">
                  <p className="text-gray-500 text-xs tracking-widest uppercase mb-4">
                    MediaPipe model working...
                  </p>
                  <div className="flex justify-between">
                    <span className="text-gray-600">stage</span>
                    <span className="text-white">{processingStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">progress</span>
                    <span className="text-[#F59E0B]">{Math.round(displayProgress)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">frames detected</span>
                    <span className="text-white">
                      {liveFrameCount > 0 ? liveFrameCount : (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="text-gray-600"
                        >detecting...</motion.span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">model confidence</span>
                    <span className="text-white">
                      {liveConfidence > 0 ? `${(liveConfidence * 100).toFixed(1)}%` : (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          className="text-gray-600"
                        >loading...</motion.span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">elapsed</span>
                    <span className="text-white">{loadingElapsed.toFixed(1)}s</span>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Error State */}
          {hasError && !isRunning && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalysisErrorFallback
                onRetry={handleReanalyze}
                onNewRecording={handleNewRecording}
              />
            </motion.div>
          )}

          {/* Results */}
          {analysisComplete && !isRunning && !hasError && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={handleNewRecording}
                    className="text-gray-400 hover:text-white"
                  >
                    ← New Recording
                  </Button>

                  {/* Processing Time Badge */}
                  {processingTimeMs && (
                    <ProcessingComplete
                      timeMs={processingTimeMs}
                      frameCount={frameCount}
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowVideo(!showVideo)}
                  >
                    {showVideo ? 'Hide Video' : 'Show Video'}
                  </Button>
                  {!isDemoSession && (
                    <Button
                      variant="outline"
                      onClick={handleReanalyze}
                    >
                      Re-analyze
                    </Button>
                  )}
                </div>
              </div>

              {/* Video (Collapsible) */}
              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="rounded-xl overflow-hidden border border-gray-700">
                      <AnalysisView />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Dashboard */}
              <ResultsDashboard
                score={score}
                scoreBreakdown={scoreBreakdown}
                metrics={metrics}
                flaws={flaws}
                confidence={Math.round(scoreConfidence * 100) || 95}
                sport={selectedSport || 'basketball'}
                action={selectedAction || 'jump_shot'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </PageContainer>
  );
}
