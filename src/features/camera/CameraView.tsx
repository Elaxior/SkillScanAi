/**
 * CameraView Component
 * 
 * Complete camera view with recording capabilities.
 * Displays live preview, handles recording, and shows playback.
 */

'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  Badge,
  Loader,
  PageContainer,
  SectionHeader,
} from '@/components'
import { useCamera } from './useCamera'
import { RecorderControls, RecordingTimer, useRecorder } from '@/features/recorder'
import { useUserStore, useSessionStore } from '@/store'
import { SPORTS_CONFIG } from '@/types'
import { cn } from '@/utils/cn'

// ==========================================
// CONSTANTS
// ==========================================

const MAX_RECORDING_DURATION = 10 // seconds

// ==========================================
// ICONS
// ==========================================

const SwitchCameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
    <circle cx="12" cy="12" r="3" />
    <path d="m18 22-3-3 3-3" />
    <path d="m6 2 3 3-3 3" />
  </svg>
)

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
)

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
)

// ==========================================
// CAMERA VIEW COMPONENT
// ==========================================

export default function CameraView() {
  const router = useRouter()

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const playbackVideoRef = useRef<HTMLVideoElement>(null)

  // Local state
  const [showPlayback, setShowPlayback] = useState(false)

  // Always-current ref for recordedUrl — avoids stale-closure bugs in handleContinueToAnalysis
  // (updated synchronously every render so the callback never sees a stale value)
  const latestRecordedUrlRef = useRef<string | null>(null)

  // ==========================================
  // CAMERA HOOK
  // ==========================================

  const {
    stream,
    error: cameraError,
    isActive: isCameraActive,
    isInitializing: isCameraInitializing,
    facingMode,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    toggleCamera,
  } = useCamera({
    autoStart: true,
    initialFacingMode: 'user',
    idealWidth: 1280,
    idealHeight: 720,
  })

  // ==========================================
  // RECORDER HOOK
  // ==========================================

  const {
    isRecording,
    recordedBlob,
    recordedUrl,
    duration,
    error: recorderError,
    status: recorderStatus,
    startRecording,
    stopRecording,
    resetRecording,
    setRecordedBlob,
  } = useRecorder({
    maxDuration: MAX_RECORDING_DURATION,
    onRecordingComplete: (blob, url) => {
      console.log('[CameraView] Recording complete:', blob.size, 'bytes')
      setShowPlayback(true)
    },
    onMaxDurationReached: () => {
      console.log('[CameraView] Max duration reached')
    },
  })

  // Keep ref in sync with latest recordedUrl on every render so handleContinueToAnalysis
  // always reads the current value even if its useCallback closure is stale
  latestRecordedUrlRef.current = recordedUrl ?? latestRecordedUrlRef.current

  // ==========================================
  // STORES
  // ==========================================

  const selectedSport = useUserStore((state) => state.selectedSport)
  const selectedAction = useUserStore((state) => state.selectedAction)
  const setVideo = useSessionStore((state) => state.setVideo)
  const startNewSession = useSessionStore((state) => state.startNewSession)

  // ==========================================
  // ATTACH STREAM TO LIVE VIDEO
  // ==========================================

  useEffect(() => {
    const videoElement = liveVideoRef.current

    if (videoElement && stream && !showPlayback) {
      console.log('[CameraView] Attaching stream to live video')
      videoElement.srcObject = stream
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [stream, showPlayback])

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleStartRecording = useCallback(() => {
    if (stream) {
      console.log('[CameraView] Starting recording')
      setShowPlayback(false)
      startRecording(stream)
    }
  }, [stream, startRecording])

  const handleStopRecording = useCallback(() => {
    console.log('[CameraView] Stopping recording')
    stopRecording()
  }, [stopRecording])

  const handleReRecord = useCallback(() => {
    console.log('[CameraView] Re-recording')
    setShowPlayback(false)
    resetRecording()
  }, [resetRecording])

  const handleContinueToAnalysis = useCallback(() => {
    // Read from ref so we always get the current URL even if the closure is stale
    const url = latestRecordedUrlRef.current
    console.log('[CameraView] Continuing to analysis — url:', url ? 'set' : 'null', '| sport:', selectedSport, '| action:', selectedAction)

    if (!url) {
      console.warn('[CameraView] No video URL available yet — ignoring')
      return
    }

    if (selectedSport && selectedAction) {
      // startNewSession resets the store (including video.url).
      // Call setVideo AFTER so our blob URL ends up in the store, not revoked.
      startNewSession(selectedSport, selectedAction)
      setVideo(url, { duration })
    } else {
      setVideo(url, { duration })
    }

    router.push('/analysis')
  }, [selectedSport, selectedAction, duration, startNewSession, setVideo, router])
  // Note: latestRecordedUrlRef is intentionally NOT a dep — it's a ref, always current

  const handleFileUpload = useCallback((file: File) => {
    console.log('[CameraView] Processing uploaded file:', file.name)

    // Accept common video MIME types; some browsers report empty type for certain files
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|avi|webm|mkv|m4v)$/i)
    if (!isVideo) {
      console.error('[CameraView] Invalid file type:', file.type)
      return
    }

    // Pre-populate the ref immediately (synchronous) so handleContinueToAnalysis
    // can read the URL even before useRecorder's state update has been applied.
    const immediateUrl = URL.createObjectURL(file)
    latestRecordedUrlRef.current = immediateUrl
    console.log('[CameraView] Blob URL created immediately:', immediateUrl.slice(0, 40))

    // Also pass to recorder hook (it creates its own internal URL for the playback <video>)
    setRecordedBlob(file)
    setShowPlayback(true)

    // Stop camera since we have uploaded video
    stopCamera()
  }, [setRecordedBlob, stopCamera])

  const handleRetryCamera = useCallback(() => {
    setShowPlayback(false)
    resetRecording()
    startCamera()
  }, [resetRecording, startCamera])

  // ==========================================
  // RENDER: ERROR STATE
  // ==========================================

  if (cameraError && !recordedUrl) {
    return (
      <PageContainer>
        <CameraHeader />
        <ErrorDisplay
          error={cameraError}
          onRetry={handleRetryCamera}
          onUpload={handleFileUpload}
        />
      </PageContainer>
    )
  }

  // ==========================================
  // RENDER: INITIALIZING STATE
  // ==========================================

  if (isCameraInitializing && !recordedUrl) {
    return (
      <PageContainer>
        <CameraHeader />
        <InitializingDisplay />
      </PageContainer>
    )
  }

  // ==========================================
  // RENDER: MAIN VIEW
  // ==========================================

  return (
    <PageContainer>
      <CameraHeader />

      {/* Sport info banner */}
      {selectedSport && (
        <div className="mb-4">
          <Card variant="glass" padding="sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {SPORTS_CONFIG[selectedSport]?.icon}
                </span>
                <span className="text-sm text-text-primary font-medium">
                  {SPORTS_CONFIG[selectedSport]?.name}
                </span>
                {selectedAction && (
                  <>
                    <span className="text-text-tertiary">→</span>
                    <span className="text-sm text-text-secondary">
                      {selectedAction}
                    </span>
                  </>
                )}
              </div>
              <Badge
                variant={isRecording ? 'danger' : recordedUrl ? 'success' : 'primary'}
                size="sm"
                dot
                pulse={isRecording}
                dotColor={isRecording ? 'danger' : recordedUrl ? 'success' : 'primary'}
              >
                {isRecording ? 'Recording' : recordedUrl ? 'Recorded' : 'Ready'}
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Video area with aspect ratio */}
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          {/* Live Video (hidden when showing playback) */}
          <video
            ref={liveVideoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              facingMode === 'user' && 'scale-x-[-1]',
              showPlayback ? 'opacity-0 pointer-events-none' : 'opacity-100'
            )}
          />

          {/* Playback Video (shown after recording) */}
          {recordedUrl && (
            <video
              ref={playbackVideoRef}
              src={recordedUrl}
              controls
              playsInline
              className={cn(
                'absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-300',
                showPlayback ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            />
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <>
              {/* Recording border indicator */}
              <div className="absolute inset-0 border-4 border-danger-500 rounded-2xl pointer-events-none animate-pulse" />

              {/* Timer overlay */}
              <div className="absolute top-4 left-4">
                <RecordingTimer
                  duration={duration}
                  maxDuration={MAX_RECORDING_DURATION}
                  isRecording={isRecording}
                />
              </div>
            </>
          )}

          {/* Status overlay (when not recording and not playback) */}
          {!isRecording && !showPlayback && isCameraActive && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant="glow-success" size="sm" dot pulse dotColor="success">
                Live
              </Badge>
              <Badge variant="default" size="sm">
                {facingMode === 'user' ? 'Front' : 'Back'}
              </Badge>
            </div>
          )}

          {/* Camera switch button */}
          {hasMultipleCameras && !isRecording && !showPlayback && (
            <button
              onClick={toggleCamera}
              className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Switch camera"
            >
              <SwitchCameraIcon />
            </button>
          )}

          {/* Guidance overlay (only during live preview) */}
          {!isRecording && !showPlayback && isCameraActive && (
            <div className="absolute inset-0 pointer-events-none">
              <CornerGuides />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-sm text-white/75">
                  Position yourself in frame
                </p>
              </div>
            </div>
          )}

          {/* No camera fallback */}
          {!isCameraActive && !showPlayback && !isCameraInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-light flex items-center justify-center">
                  <CameraIcon />
                </div>
                <p className="text-text-secondary">Camera not active</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={startCamera}
                  className="mt-4"
                >
                  Start Camera
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8">
          <RecorderControls
            isRecording={isRecording}
            hasStream={isCameraActive && !!stream}
            hasRecording={!!recordedUrl && showPlayback}
            status={recorderStatus}
            duration={duration}
            maxDuration={MAX_RECORDING_DURATION}
            error={recorderError}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onReRecord={handleReRecord}
            onContinueToAnalysis={handleContinueToAnalysis}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Instructions Card */}
        {!isRecording && !showPlayback && (
          <Card variant="default" padding="md" className="mt-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              📋 Recording Tips
            </h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Position your full body in the frame</li>
              <li>• Ensure good lighting (avoid backlight)</li>
              <li>• Recording stops automatically at {MAX_RECORDING_DURATION} seconds</li>
              <li>• You can re-record as many times as needed</li>
            </ul>
          </Card>
        )}

        {/* Debug Panel (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card variant="default" padding="md" className="mt-4">
            <h4 className="text-xs font-semibold text-text-tertiary mb-2">
              🔧 Debug Info
            </h4>
            <pre className="text-xs text-text-tertiary overflow-auto">
              {JSON.stringify({
                camera: {
                  isActive: isCameraActive,
                  isInitializing: isCameraInitializing,
                  hasStream: !!stream,
                  facingMode,
                  error: cameraError,
                },
                recorder: {
                  status: recorderStatus,
                  isRecording,
                  duration,
                  hasBlob: !!recordedBlob,
                  blobSize: recordedBlob?.size,
                  hasUrl: !!recordedUrl,
                  error: recorderError,
                },
                ui: {
                  showPlayback,
                },
              }, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function CameraHeader() {
  return (
    <>
      <div className="mb-6">
        <Link href="/sports">
          <Button variant="ghost" size="sm">
            ← Back to Sports
          </Button>
        </Link>
      </div>

      <SectionHeader
        title="Record Your Movement"
        subtitle="Record a short video for AI analysis"
        accent
        accentColor="accent"
        className="mb-6"
      />
    </>
  )
}

function ErrorDisplay({
  error,
  onRetry,
  onUpload,
}: {
  error: string
  onRetry: () => void
  onUpload: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    event.target.value = ''
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card variant="default" padding="lg" className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
          <span className="text-3xl">📷</span>
        </div>

        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Camera Access Error
        </h3>

        <p className="text-text-secondary mb-6">{error}</p>

        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={onRetry} leftIcon={<RefreshIcon />}>
            Try Again
          </Button>

          <div className="text-text-tertiary text-sm">or</div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" onClick={handleUploadClick}>
            Upload Video Instead
          </Button>
        </div>
      </Card>
    </div>
  )
}

function InitializingDisplay() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card variant="glass" padding="lg" className="text-center">
        <Loader variant="ai" size="lg" color="primary" text="Initializing camera..." />
        <p className="text-sm text-text-secondary mt-4">
          Please allow camera access when prompted
        </p>
      </Card>
    </div>
  )
}

function CornerGuides() {
  const cornerClasses = "absolute w-8 h-8 border-white/50"

  return (
    <>
      <div className={cn(cornerClasses, "top-8 left-8 border-t-2 border-l-2 rounded-tl-lg")} />
      <div className={cn(cornerClasses, "top-8 right-8 border-t-2 border-r-2 rounded-tr-lg")} />
      <div className={cn(cornerClasses, "bottom-8 left-8 border-b-2 border-l-2 rounded-bl-lg")} />
      <div className={cn(cornerClasses, "bottom-8 right-8 border-b-2 border-r-2 rounded-br-lg")} />
    </>
  )
}