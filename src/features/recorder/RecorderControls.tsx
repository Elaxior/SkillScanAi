/**
 * RecorderControls Component
 * 
 * UI controls for video recording with timer display.
 * Handles record, stop, and re-record actions.
 */

'use client'

import React from 'react'
import { Button, Badge, Card } from '@/components'
import { cn } from '@/utils/cn'
import type { RecorderStatus } from './useRecorder'

// ==========================================
// ICONS
// ==========================================

const RecordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
)

const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ReRecordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

// ==========================================
// TYPES
// ==========================================

export interface RecorderControlsProps {
  /** Whether recording is currently active */
  isRecording: boolean
  /** Whether camera stream is available */
  hasStream: boolean
  /** Whether a recording exists */
  hasRecording: boolean
  /** Recording status */
  status: RecorderStatus
  /** Current recording duration in seconds */
  duration: number
  /** Maximum recording duration in seconds */
  maxDuration: number
  /** Recording error message */
  error: string | null
  /** Callback to start recording */
  onStartRecording: () => void
  /** Callback to stop recording */
  onStopRecording: () => void
  /** Callback to reset/re-record */
  onReRecord: () => void
  /** Callback when ready to analyze */
  onContinueToAnalysis: () => void
  /** Callback when file is uploaded */
  onFileUpload: (file: File) => void
  /** Additional class names */
  className?: string
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Format seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get status badge variant and text
 */
function getStatusDisplay(status: RecorderStatus): { variant: 'success' | 'warning' | 'danger' | 'primary' | 'default'; text: string } {
  switch (status) {
    case 'recording':
      return { variant: 'danger', text: 'Recording' }
    case 'paused':
      return { variant: 'warning', text: 'Paused' }
    case 'stopping':
      return { variant: 'warning', text: 'Stopping...' }
    case 'completed':
      return { variant: 'success', text: 'Recorded' }
    case 'error':
      return { variant: 'danger', text: 'Error' }
    default:
      return { variant: 'default', text: 'Ready' }
  }
}

// ==========================================
// COMPONENT
// ==========================================

export function RecorderControls({
  isRecording,
  hasStream,
  hasRecording,
  status,
  duration,
  maxDuration,
  error,
  onStartRecording,
  onStopRecording,
  onReRecord,
  onContinueToAnalysis,
  onFileUpload,
  className,
}: RecorderControlsProps) {
  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Status display
  const statusDisplay = getStatusDisplay(status)

  // Progress percentage
  const progressPercent = (duration / maxDuration) * 100

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('[RecorderControls] File selected:', file.name, file.size)
      onFileUpload(file)
    }
    // Reset input so same file can be selected again
    event.target.value = ''
  }

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // ==========================================
  // RECORDING IN PROGRESS VIEW
  // ==========================================

  if (isRecording) {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        {/* Timer Display */}
        <div className="mb-6 text-center">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-danger-500" />
            </span>
            <Badge variant="danger" size="sm">
              {statusDisplay.text}
            </Badge>
          </div>

          {/* Timer */}
          <div className="text-5xl font-mono font-bold text-text-primary mb-2">
            {formatTime(duration)}
          </div>

          {/* Progress Text */}
          <p className="text-sm text-text-secondary">
            Max: {formatTime(maxDuration)}
          </p>

          {/* Progress Bar */}
          <div className="w-48 h-2 bg-surface-light rounded-full mt-3 mx-auto overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-100',
                progressPercent >= 80 ? 'bg-danger-500' : 'bg-primary-500'
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Stop Button */}
        <button
          onClick={onStopRecording}
          className="group relative w-20 h-20 rounded-full bg-danger-500 hover:bg-danger-600 text-white shadow-lg shadow-danger-500/30 hover:shadow-danger-500/50 transition-all active:scale-95"
          aria-label="Stop recording"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <StopIcon />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-4 border-danger-400 animate-ping opacity-25" />
        </button>

        <p className="mt-4 text-sm text-text-secondary">
          Tap to stop recording
        </p>
      </div>
    )
  }

  // ==========================================
  // RECORDING COMPLETED VIEW
  // ==========================================

  if (hasRecording) {
    return (
      <div className={cn('flex flex-col items-center', className)}>
        {/* Status */}
        <div className="mb-6 text-center">
          <Badge variant="success" size="md" className="mb-2">
            ✓ Recording Complete
          </Badge>
          <p className="text-sm text-text-secondary">
            Duration: {formatTime(duration)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onReRecord}
            leftIcon={<ReRecordIcon />}
          >
            Re-record
          </Button>

          <Button
            variant="glow"
            size="lg"
            onClick={onContinueToAnalysis}
            rightIcon={<ArrowRightIcon />}
          >
            Analyze Video
          </Button>
        </div>
      </div>
    )
  }

  // ==========================================
  // IDLE/READY VIEW
  // ==========================================

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Status Badge */}
      <div className="mb-6 text-center">
        <Badge variant={statusDisplay.variant} size="md" className="mb-2">
          {statusDisplay.text}
        </Badge>
        {error && (
          <p className="text-sm text-danger-400 mt-2">{error}</p>
        )}
        {!error && (
          <p className="text-sm text-text-secondary">
            Record up to {maxDuration} seconds
          </p>
        )}
      </div>

      {/* Main Record Button */}
      <button
        onClick={onStartRecording}
        disabled={!hasStream}
        className={cn(
          'group relative w-20 h-20 rounded-full transition-all active:scale-95',
          hasStream
            ? 'bg-danger-500 hover:bg-danger-600 text-white shadow-lg shadow-danger-500/30 hover:shadow-danger-500/50'
            : 'bg-surface-light text-text-tertiary cursor-not-allowed'
        )}
        aria-label="Start recording"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <RecordIcon />
        </div>
        {/* Outer ring */}
        <div className={cn(
          'absolute -inset-1 rounded-full border-4 transition-colors',
          hasStream
            ? 'border-danger-500/50 group-hover:border-danger-400'
            : 'border-surface-border'
        )} />
      </button>

      {hasStream ? (
        <p className="mt-4 text-sm text-text-secondary">
          Tap to start recording
        </p>
      ) : (
        <p className="mt-4 text-sm text-text-tertiary">
          Start camera to enable recording
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 my-6 w-full max-w-xs">
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-sm text-text-tertiary">or</span>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload video file"
        />
        <Button
          variant="outline"
          size="md"
          onClick={handleUploadClick}
          leftIcon={<UploadIcon />}
        >
          Upload Video
        </Button>
        <p className="text-xs text-text-tertiary mt-2 text-center">
          Select a video from your device
        </p>
      </div>
    </div>
  )
}

// ==========================================
// COMPACT TIMER COMPONENT
// ==========================================

export function RecordingTimer({
  duration,
  maxDuration,
  isRecording,
  className,
}: {
  duration: number
  maxDuration: number
  isRecording: boolean
  className?: string
}) {
  if (!isRecording) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Recording indicator */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger-500" />
      </span>

      {/* Timer */}
      <span className="font-mono text-lg font-semibold text-white">
        {formatTime(duration)}
      </span>

      {/* Separator */}
      <span className="text-white/50">/</span>

      {/* Max duration */}
      <span className="font-mono text-sm text-white/70">
        {formatTime(maxDuration)}
      </span>
    </div>
  )
}

export default RecorderControls