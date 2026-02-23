/**
 * AnalysisView Component
 * 
 * Displays video with skeleton overlay, processes frames, and detects keyframes.
 */

'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardTitle,
  CardDescription,
  Badge,
  SectionHeader,
  PageContainer,
  ProgressBar,
  Loader,
} from '@/components'
import { useSessionStore, useUserStore } from '@/store'
import {
  usePoseProcessor,
  PoseCanvasOverlay,
  LandmarkIndex,
  type PoseFrame,
  type PoseDetectionResult,
} from '@/features/pose'
import {
  calculateElbowAngle,
  calculateKneeAngle,
  calculateShoulderAngle,
  analyzeJump,
  type AngleResult,
  type JumpAnalysis,
} from '@/features/biomechanics'
import {
  processLandmarkFrames,
  detectKeyframes,
  validateKeyframes,
  type Keyframes,
  type KeyframeDetectionResult,
  type ProcessedFrameData,
} from '@/features/processing'
import { SPORTS_CONFIG } from '@/types'
import { cn } from '@/utils/cn'

// ==========================================
// ICONS
// ==========================================

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
)

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
)

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const SkeletonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v4" />
    <path d="M12 14v6" />
    <path d="M8 10h8" />
    <path d="M8 20l4-4 4 4" />
    <path d="M6 10l-2 6" />
    <path d="M18 10l2 6" />
  </svg>
)

// ==========================================
// COMPONENT
// ==========================================

export default function AnalysisView() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [autoProcessStarted, setAutoProcessStarted] = useState(false)
  const [frameProcessingDone, setFrameProcessingDone] = useState(false)
  const [biomechanicsResults, setBiomechanicsResults] = useState<{
    elbowAngle: AngleResult | null
    kneeAngle: AngleResult | null
    shoulderAngle: AngleResult | null
    jumpAnalysis: JumpAnalysis | null
  } | null>(null)

  // ==========================================
  // UI STATE
  // ==========================================

  const [showSkeleton, setShowSkeleton] = useState(true)
  const [showSides, setShowSides] = useState(false)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // ==========================================
  // STORES
  // ==========================================

  const videoUrl = useSessionStore((state) => state.video.url)
  const videoDuration = useSessionStore((state) => state.video.duration)
  const sessionStatus = useSessionStore((state) => state.status)
  const poseResult = useSessionStore((state) => state.poseResult)
  const storedFrames = useSessionStore((state) => state.landmarks)
  const smoothedLandmarks = useSessionStore((state) => state.smoothedLandmarks)
  const hasPoseData = useSessionStore((state) => state.hasPoseData)
  const storedKeyframes = useSessionStore((state) => state.keyframes)
  const storedFps = useSessionStore((state) => state.fps)
  const hasKeyframes = useSessionStore((state) => state.hasKeyframes)

  const setPoseResult = useSessionStore((state) => state.setPoseResult)
  const setProcessedData = useSessionStore((state) => state.setProcessedData)
  const setKeyframes = useSessionStore((state) => state.setKeyframes)
  const setFps = useSessionStore((state) => state.setFps)
  const resetSession = useSessionStore((state) => state.resetSession)
  const setStatus = useSessionStore((state) => state.setStatus)

  const selectedSport = useUserStore((state) => state.selectedSport)
  const selectedAction = useUserStore((state) => state.selectedAction)

  // ==========================================
  // POSE PROCESSOR
  // ==========================================

  const {
    status: processingStatus,
    progress,
    frames: processingFrames,
    result,
    error: processingError,
    isModelLoaded,
    processVideo,
    reset: resetProcessor,
    cancel: cancelProcessing,
  } = usePoseProcessor({
    modelComplexity: 1,
    targetFps: 30,
    onComplete: (result) => {
      console.log('[AnalysisView] Pose processing complete:', result)
      setPoseResult(result)
      setStatus('complete' as any)
    },
  })

  // Use stored frames if available, otherwise use processing frames
  const displayFrames = smoothedLandmarks.length > 0
    ? smoothedLandmarks
    : (hasPoseData ? storedFrames : processingFrames)
  const displayResult = poseResult || result

  // ==========================================
  // FRAME PROCESSING (AFTER POSE DETECTION)
  // ==========================================

  useEffect(() => {
    // Use videoDuration from store, fallback to pose result's videoDuration (handles uploaded files)
    const effectiveDuration = videoDuration || displayResult?.videoDuration || 0
    if (!displayResult || frameProcessingDone || !effectiveDuration) return

    console.log('[AnalysisView] Starting frame processing...')

    const processedData = processLandmarkFrames(
      displayResult.frames,
      effectiveDuration,
      {
        enableSmoothing: true,
        smoothingConfig: {
          windowSize: 5,
          preserveEdges: true,
        },
      }
    )

    if (!processedData) {
      console.error('[AnalysisView] Frame processing failed')
      setFrameProcessingDone(true)
      return
    }

    setProcessedData(processedData)
    setFps(processedData.fps)

    const keyframeResult = detectKeyframes(
      processedData.smoothedFrames,
      effectiveDuration
    )

    const validation = validateKeyframes(keyframeResult.keyframes)
    if (!validation.isValid) {
      console.warn('[AnalysisView] Keyframe validation issues:', validation.issues)
    }

    setKeyframes(keyframeResult.keyframes)

    // ==========================================
    // BIOMECHANICS CALCULATIONS
    // ==========================================

    const frames = processedData.smoothedFrames
    const peakIdx = keyframeResult.keyframes.peakJump
    const refIdx = peakIdx ?? Math.floor(frames.length / 2)

    if (refIdx >= 0 && refIdx < frames.length) {
      const refFrame = frames[refIdx]
      const lm = refFrame.landmarks

      const shoulder = lm[LandmarkIndex.RIGHT_SHOULDER]
      const elbow = lm[LandmarkIndex.RIGHT_ELBOW]
      const wrist = lm[LandmarkIndex.RIGHT_WRIST]
      const hip = lm[LandmarkIndex.RIGHT_HIP]
      const knee = lm[LandmarkIndex.RIGHT_KNEE]
      const ankle = lm[LandmarkIndex.RIGHT_ANKLE]

      const elbowAngle = calculateElbowAngle(shoulder, elbow, wrist)
      const kneeAngle = calculateKneeAngle(hip, knee, ankle)
      const shoulderAngle = calculateShoulderAngle(hip, shoulder, elbow)

      const jumpAnalysis = analyzeJump(frames, processedData.fps, {
        start: keyframeResult.keyframes.start,
        peakJump: keyframeResult.keyframes.peakJump,
        end: keyframeResult.keyframes.end,
      })

      setBiomechanicsResults({ elbowAngle, kneeAngle, shoulderAngle, jumpAnalysis })
      console.log('[AnalysisView] Biomechanics:', { elbowAngle, kneeAngle, shoulderAngle, jumpAnalysis })
    }

    console.log('[AnalysisView] Frame processing complete:', {
      fps: processedData.fps,
      keyframes: keyframeResult.keyframes,
    })

    setFrameProcessingDone(true)
  }, [displayResult, frameProcessingDone, videoDuration, setProcessedData, setFps, setKeyframes, setBiomechanicsResults])

  // ==========================================
  // VIDEO EVENT HANDLERS
  // ==========================================

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // ==========================================
  // AUTO-START PROCESSING
  // ==========================================

  useEffect(() => {
    if (
      videoUrl &&
      videoRef.current &&
      !autoProcessStarted &&
      !hasPoseData &&
      processingStatus === 'idle'
    ) {
      console.log('[AnalysisView] Auto-starting pose processing...')
      setAutoProcessStarted(true)

      const video = videoRef.current

      const startProcessing = async () => {
        if (video.readyState < 2) {
          await new Promise<void>((resolve) => {
            video.onloadeddata = () => resolve()
          })
        }
        processVideo(video)
      }

      startProcessing().catch((err) => {
        console.error('[AnalysisView] Auto-start error:', err)
      })
    }
  }, [videoUrl, autoProcessStarted, hasPoseData, processingStatus, processVideo])

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleGoBack = () => {
    cancelProcessing()
    router.push('/camera')
  }

  const handleNewRecording = () => {
    cancelProcessing()
    resetSession()
    router.push('/camera')
  }

  const handleReprocess = useCallback(() => {
    if (videoRef.current) {
      resetProcessor()
      setAutoProcessStarted(false)
      setFrameProcessingDone(false)
      setBiomechanicsResults(null)
      setTimeout(() => {
        if (videoRef.current) {
          processVideo(videoRef.current)
        }
      }, 100)
    }
  }, [processVideo, resetProcessor])

  const handleToggleSkeleton = () => setShowSkeleton((prev) => !prev)
  const handleToggleSides = () => setShowSides((prev) => !prev)
  const handleFrameChange = useCallback((frameIndex: number) => {
    setCurrentFrameIndex(frameIndex)
  }, [])

  const handleJumpToKeyframe = useCallback((frameIndex: number | null) => {
    if (frameIndex === null || !videoRef.current || !storedFps) return
    const time = frameIndex / storedFps
    videoRef.current.currentTime = time
    videoRef.current.pause()
  }, [storedFps])

  // ==========================================
  // NO VIDEO STATE
  // ==========================================

  if (!videoUrl) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Link href="/camera">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeftIcon />}>
              Back to Camera
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <Card variant="default" padding="lg" className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning-500/20 flex items-center justify-center">
              <VideoIcon />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              No Video Found
            </h2>
            <p className="text-text-secondary mb-6">
              You need to record a video before we can analyze it.
            </p>
            <Link href="/camera">
              <Button variant="primary" size="lg">
                Record Video
              </Button>
            </Link>
          </Card>
        </div>
      </PageContainer>
    )
  }

  // ==========================================
  // STATUS FLAGS
  // ==========================================

  const isProcessing =
    processingStatus === 'processing' ||
    processingStatus === 'loading-model' ||
    processingStatus === 'initializing'
  const isComplete = processingStatus === 'completed' || hasPoseData
  const hasError = processingStatus === 'error'
  const canShowOverlay = isComplete && displayFrames.length > 0

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          leftIcon={<ArrowLeftIcon />}
        >
          Back to Camera
        </Button>
      </div>

      <SectionHeader
        title="Pose Analysis"
        subtitle="AI-powered motion analysis"
        accent
        accentColor="primary"
        className="mb-6"
      />

      {/* Sport Context */}
      {selectedSport && (
        <Card variant="glass" padding="sm" className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{SPORTS_CONFIG[selectedSport]?.icon}</span>
              <div>
                <p className="font-medium text-text-primary">
                  {SPORTS_CONFIG[selectedSport]?.name}
                </p>
                {selectedAction && (
                  <p className="text-sm text-text-secondary">{selectedAction}</p>
                )}
              </div>
            </div>

            {canShowOverlay && (
              <div className="flex items-center gap-2">
                <Button
                  variant={showSides ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleToggleSides}
                  disabled={!showSkeleton}
                >
                  L/R Colors
                </Button>
                <Button
                  variant={showSkeleton ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleToggleSkeleton}
                  leftIcon={showSkeleton ? <EyeIcon /> : <EyeOffIcon />}
                >
                  {showSkeleton ? 'Hide' : 'Show'} Skeleton
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video with Overlay */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {canShowOverlay && (
                <PoseCanvasOverlay
                  videoRef={videoRef}
                  frames={displayFrames}
                  videoDuration={videoDuration || 0}
                  visible={showSkeleton}
                  showSides={showSides}
                  onFrameChange={handleFrameChange}
                  drawingOptions={{
                    landmarkRadius: 6,
                    connectionWidth: 3,
                    enableGlow: true,
                    glowBlur: 12,
                    minVisibility: 0.5,
                  }}
                />
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <Loader variant="ai" size="lg" color="primary" />
                    <p className="mt-4 text-white font-medium">
                      {processingStatus === 'loading-model' && 'Loading AI model...'}
                      {processingStatus === 'initializing' && 'Initializing...'}
                      {processingStatus === 'processing' && `Processing frame ${progress.currentFrame}...`}
                    </p>
                    {progress.percentage > 0 && (
                      <div className="mt-4 w-48 mx-auto">
                        <ProgressBar value={progress.percentage} size="md" variant="primary" glow />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {canShowOverlay && showSkeleton && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge variant="glow-primary" size="sm" className="bg-black/50 backdrop-blur-sm">
                    <SkeletonIcon />
                    <span className="ml-1">Frame {currentFrameIndex + 1}/{displayFrames.length}</span>
                  </Badge>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <Badge variant="success" size="sm">
                      <CheckCircleIcon />
                      <span className="ml-1">Processed</span>
                    </Badge>
                  )}
                  {isProcessing && (
                    <Badge variant="primary" size="sm" dot pulse dotColor="primary">
                      Processing
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleNewRecording} disabled={isProcessing}>
                  New Recording
                </Button>
              </div>
            </div>
          </Card>

          {/* Keyframe Navigation */}
          {hasKeyframes && (
            <Card variant="glass" padding="md" className="mt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <TargetIcon />
                Keyframe Navigation
              </h4>
              <div className="flex flex-wrap gap-2">
                {storedKeyframes.start !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToKeyframe(storedKeyframes.start)}
                  >
                    Start (#{storedKeyframes.start})
                  </Button>
                )}
                {storedKeyframes.peakJump !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToKeyframe(storedKeyframes.peakJump)}
                  >
                    Peak Jump (#{storedKeyframes.peakJump})
                  </Button>
                )}
                {storedKeyframes.release !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToKeyframe(storedKeyframes.release)}
                  >
                    Release (#{storedKeyframes.release})
                  </Button>
                )}
                {storedKeyframes.end !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToKeyframe(storedKeyframes.end)}
                  >
                    End (#{storedKeyframes.end})
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Pose Detection Results */}
          <Card variant="gradient" padding="lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <BrainIcon />
              </div>
              <div>
                <CardTitle className="mb-1">Pose Detection</CardTitle>
                <CardDescription>
                  {isComplete ? 'Analysis complete' : 'Processing...'}
                </CardDescription>
              </div>
            </div>

            {hasError && (
              <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4 mb-6">
                <p className="text-danger-400 font-medium mb-2">Processing Error</p>
                <p className="text-sm text-danger-300">{processingError}</p>
                <Button variant="outline" size="sm" onClick={handleReprocess} className="mt-3">
                  Try Again
                </Button>
              </div>
            )}

            {processingStatus === 'loading-model' && (
              <div className="bg-surface rounded-xl p-6 text-center">
                <Loader variant="ai" size="md" color="primary" className="mb-4" />
                <p className="text-text-secondary">Loading MediaPipe Pose model...</p>
              </div>
            )}

            {processingStatus === 'processing' && (
              <div className="bg-surface rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-text-primary">Extracting landmarks...</span>
                  <span className="text-sm text-text-secondary">{progress.currentFrame}/{progress.totalFrames}</span>
                </div>
                <ProgressBar value={progress.percentage} size="lg" variant="primary" glow showValue />
              </div>
            )}

            {isComplete && displayResult && (
              <div className="space-y-4">
                <div className="bg-success-500/10 border border-success-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircleIcon />
                  <div>
                    <p className="text-success-400 font-medium">Detection Complete</p>
                    <p className="text-sm text-success-300/70">{displayResult.framesWithPose} poses detected</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Frames" value={displayResult.totalFrames} icon="🎬" />
                  <StatCard label="Poses" value={displayResult.framesWithPose} icon="🏃" />
                  <StatCard label="Rate" value={`${(displayResult.detectionRate * 100).toFixed(0)}%`} icon="🎯" />
                  <StatCard label="FPS" value={storedFps?.toFixed(1) || '...'} icon="⏱️" />
                </div>
              </div>
            )}
          </Card>

          {/* Keyframes Debug Panel */}
          {frameProcessingDone && (
            <Card variant="default" padding="md">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <TargetIcon />
                Keyframe Detection
              </h4>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">FPS:</span>
                  <Badge variant="primary" size="sm">
                    {storedFps?.toFixed(2) || 'N/A'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Start Frame:</span>
                  <Badge variant={storedKeyframes.start !== null ? 'success' : 'default'} size="sm">
                    {storedKeyframes.start ?? 'N/A'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Peak Jump:</span>
                  <Badge variant={storedKeyframes.peakJump !== null ? 'success' : 'default'} size="sm">
                    {storedKeyframes.peakJump ?? 'N/A'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Release Frame:</span>
                  <Badge variant={storedKeyframes.release !== null ? 'accent' : 'default'} size="sm">
                    {storedKeyframes.release ?? 'N/A'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">End Frame:</span>
                  <Badge variant={storedKeyframes.end !== null ? 'success' : 'default'} size="sm">
                    {storedKeyframes.end ?? 'N/A'}
                  </Badge>
                </div>

                {storedKeyframes.peakJump !== null && storedKeyframes.release !== null && (
                  <div className="pt-2 border-t border-surface-border">
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Peak→Release Gap:</span>
                      <span className="text-text-secondary">
                        {Math.abs(storedKeyframes.release - storedKeyframes.peakJump)} frames
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Biomechanics Analysis */}
          {biomechanicsResults && (
            <Card variant="default" padding="md">
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                📐 Biomechanics Analysis
              </h4>

              <div className="space-y-3 font-mono text-sm">
                {/* Elbow Angle */}
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Elbow Angle:</span>
                  <Badge
                    variant={
                      biomechanicsResults.elbowAngle?.isValid
                        ? biomechanicsResults.elbowAngle.degrees > 150
                          ? 'success'
                          : biomechanicsResults.elbowAngle.degrees > 90
                            ? 'warning'
                            : 'danger'
                        : 'default'
                    }
                    size="sm"
                  >
                    {biomechanicsResults.elbowAngle?.isValid
                      ? `${biomechanicsResults.elbowAngle.degrees.toFixed(1)}°`
                      : 'N/A'}
                  </Badge>
                </div>

                {/* Knee Angle */}
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Knee Angle:</span>
                  <Badge
                    variant={
                      biomechanicsResults.kneeAngle?.isValid
                        ? biomechanicsResults.kneeAngle.degrees > 150
                          ? 'success'
                          : biomechanicsResults.kneeAngle.degrees > 90
                            ? 'warning'
                            : 'danger'
                        : 'default'
                    }
                    size="sm"
                  >
                    {biomechanicsResults.kneeAngle?.isValid
                      ? `${biomechanicsResults.kneeAngle.degrees.toFixed(1)}°`
                      : 'N/A'}
                  </Badge>
                </div>

                {/* Shoulder Angle */}
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Shoulder Angle:</span>
                  <Badge
                    variant={
                      biomechanicsResults.shoulderAngle?.isValid
                        ? 'accent'
                        : 'default'
                    }
                    size="sm"
                  >
                    {biomechanicsResults.shoulderAngle?.isValid
                      ? `${biomechanicsResults.shoulderAngle.degrees.toFixed(1)}°`
                      : 'N/A'}
                  </Badge>
                </div>

                {/* Jump Analysis */}
                {biomechanicsResults.jumpAnalysis?.isValid && (
                  <div className="pt-2 border-t border-surface-border space-y-2">
                    <p className="text-text-tertiary text-xs uppercase tracking-wide">Jump Metrics</p>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Height:</span>
                      <Badge variant="primary" size="sm">
                        {biomechanicsResults.jumpAnalysis.heightPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    {biomechanicsResults.jumpAnalysis.flightTime !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Flight Time:</span>
                        <Badge variant="primary" size="sm">
                          {(biomechanicsResults.jumpAnalysis.flightTime * 1000).toFixed(0)} ms
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Confidence:</span>
                      <Badge variant={biomechanicsResults.jumpAnalysis.confidence > 0.7 ? 'success' : 'warning'} size="sm">
                        {(biomechanicsResults.jumpAnalysis.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" size="lg" onClick={handleNewRecording} disabled={isProcessing}>
          Record New Video
        </Button>
        {isComplete && (
          <Button variant="outline" size="lg" onClick={handleReprocess}>
            Reprocess Video
          </Button>
        )}
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <Card variant="default" padding="md" className="mt-8">
          <h4 className="text-xs font-semibold text-text-tertiary mb-2">🔧 Debug Info</h4>
          <pre className="text-xs text-text-tertiary overflow-auto max-h-48">
            {JSON.stringify({
              processingStatus,
              frameProcessingDone,
              framesCount: displayFrames.length,
              smoothedCount: smoothedLandmarks.length,
              currentFrameIndex,
              fps: storedFps,
              keyframes: storedKeyframes,
              hasKeyframes,
            }, null, 2)}
          </pre>
        </Card>
      )}
    </PageContainer>
  )
}

// ==========================================
// STAT CARD COMPONENT
// ==========================================

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-surface rounded-lg p-3 text-center">
      <span className="text-lg mb-1 block">{icon}</span>
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-tertiary">{label}</p>
    </div>
  )
}
