/**
 * useRecorder Hook
 * 
 * Manages video recording using MediaRecorder API.
 * Handles recording lifecycle, chunk collection, and blob creation.
 * 
 * @example
 * const { isRecording, recordedUrl, startRecording, stopRecording } = useRecorder()
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ==========================================
// TYPES
// ==========================================

export interface RecorderState {
  /** Whether currently recording */
  isRecording: boolean
  /** Whether recording is paused */
  isPaused: boolean
  /** Recorded video blob */
  recordedBlob: Blob | null
  /** Object URL for recorded video playback */
  recordedUrl: string | null
  /** Current recording duration in seconds */
  duration: number
  /** Error message if recording failed */
  error: string | null
  /** Recording status */
  status: RecorderStatus
}

export type RecorderStatus = 
  | 'idle'
  | 'recording'
  | 'paused'
  | 'stopping'
  | 'completed'
  | 'error'

export interface RecorderActions {
  /** Start recording from a MediaStream */
  startRecording: (stream: MediaStream) => void
  /** Stop recording and finalize video */
  stopRecording: () => void
  /** Pause recording */
  pauseRecording: () => void
  /** Resume recording */
  resumeRecording: () => void
  /** Reset recording state and release resources */
  resetRecording: () => void
  /** Set a pre-recorded blob (for file uploads) */
  setRecordedBlob: (blob: Blob) => void
}

export interface RecorderConfig {
  /** Maximum recording duration in seconds */
  maxDuration?: number
  /** Time slice for data chunks in ms (0 = single chunk at end) */
  timeSlice?: number
  /** Preferred MIME type */
  mimeType?: string
  /** Video bits per second */
  videoBitsPerSecond?: number
  /** Callback when recording completes */
  onRecordingComplete?: (blob: Blob, url: string) => void
  /** Callback for duration updates */
  onDurationUpdate?: (duration: number) => void
  /** Callback when max duration reached */
  onMaxDurationReached?: () => void
}

export type UseRecorderReturn = RecorderState & RecorderActions

// ==========================================
// DEFAULT CONFIG
// ==========================================

const DEFAULT_CONFIG: Required<Omit<RecorderConfig, 'onRecordingComplete' | 'onDurationUpdate' | 'onMaxDurationReached'>> = {
  maxDuration: 10,
  timeSlice: 0, // Get all data at once
  mimeType: '',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
}

// ==========================================
// MIME TYPE DETECTION
// ==========================================

/**
 * Get the best supported MIME type for recording
 */
function getSupportedMimeType(preferred?: string): string {
  // If preferred is specified and supported, use it
  if (preferred && MediaRecorder.isTypeSupported(preferred)) {
    return preferred
  }

  // Try common types in order of preference
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=h264',
    'video/mp4',
  ]

  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('[useRecorder] Using MIME type:', type)
      return type
    }
  }

  console.warn('[useRecorder] No preferred MIME type supported, using default')
  return ''
}

// ==========================================
// ERROR MESSAGES
// ==========================================

const ERROR_MESSAGES: Record<string, string> = {
  NotSupportedError: 'Recording is not supported in this browser.',
  SecurityError: 'Recording was blocked due to security restrictions.',
  InvalidStateError: 'Cannot start recording in current state.',
  UnknownError: 'An unexpected error occurred during recording.',
  NoStream: 'No media stream provided for recording.',
}

function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    return ERROR_MESSAGES[error.name] || error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return ERROR_MESSAGES.UnknownError
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useRecorder(config: RecorderConfig = {}): UseRecorderReturn {
  // Merge config with defaults
  const {
    maxDuration,
    timeSlice,
    mimeType,
    videoBitsPerSecond,
    onRecordingComplete,
    onDurationUpdate,
    onMaxDurationReached,
  } = { ...DEFAULT_CONFIG, ...config }

  // ==========================================
  // STATE
  // ==========================================

  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<RecorderStatus>('idle')

  // ==========================================
  // REFS
  // ==========================================

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)
  const isMountedRef = useRef(true)

  // ==========================================
  // CLEANUP TIMER
  // ==========================================

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ==========================================
  // REVOKE URL (Memory Management)
  // ==========================================

  /**
   * Revoke the current object URL to free memory
   * 
   * Why this is critical:
   * - Object URLs hold references to Blob data in memory
   * - Without revoking, memory accumulates with each recording
   * - Can cause browser crashes in long sessions
   * - Each URL consumes memory proportional to video size
   */
  const revokeUrl = useCallback((url: string | null) => {
    if (url) {
      console.log('[useRecorder] Revoking object URL:', url.substring(0, 50))
      URL.revokeObjectURL(url)
    }
  }, [])

  // ==========================================
  // RESET RECORDING
  // ==========================================

  const resetRecording = useCallback(() => {
    console.log('[useRecorder] Resetting recording state')

    // Stop any active recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (err) {
        console.warn('[useRecorder] Error stopping recorder during reset:', err)
      }
    }

    // Clear timer
    clearTimer()

    // Revoke existing URL to prevent memory leak
    revokeUrl(recordedUrl)

    // Reset refs
    mediaRecorderRef.current = null
    chunksRef.current = []
    startTimeRef.current = 0
    pausedDurationRef.current = 0

    // Reset state
    if (isMountedRef.current) {
      setIsRecording(false)
      setIsPaused(false)
      setRecordedBlob(null)
      setRecordedUrl(null)
      setDuration(0)
      setError(null)
      setStatus('idle')
    }
  }, [recordedUrl, revokeUrl, clearTimer])

  // ==========================================
  // START RECORDING
  // ==========================================

  const startRecording = useCallback((stream: MediaStream) => {
    console.log('[useRecorder] Starting recording...')

    // Validate stream
    if (!stream || !stream.active) {
      const errorMsg = ERROR_MESSAGES.NoStream
      console.error('[useRecorder]', errorMsg)
      setError(errorMsg)
      setStatus('error')
      return
    }

    // Check MediaRecorder support
    if (typeof MediaRecorder === 'undefined') {
      const errorMsg = ERROR_MESSAGES.NotSupportedError
      console.error('[useRecorder]', errorMsg)
      setError(errorMsg)
      setStatus('error')
      return
    }

    // Reset any existing recording
    resetRecording()

    try {
      // Get supported MIME type
      const selectedMimeType = getSupportedMimeType(mimeType)

      // Create MediaRecorder options
      const options: MediaRecorderOptions = {
        videoBitsPerSecond,
      }

      if (selectedMimeType) {
        options.mimeType = selectedMimeType
      }

      console.log('[useRecorder] Creating MediaRecorder with options:', options)

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream, options)

      // ========================================
      // EVENT HANDLERS
      // ========================================

      recorder.ondataavailable = (event: BlobEvent) => {
        console.log('[useRecorder] Data available, size:', event.data.size)
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        console.log('[useRecorder] Recording stopped, chunks:', chunksRef.current.length)

        if (!isMountedRef.current) return

        // Create final blob from chunks
        const finalMimeType = selectedMimeType || 'video/webm'
        const blob = new Blob(chunksRef.current, { type: finalMimeType })

        console.log('[useRecorder] Created blob, size:', blob.size, 'type:', blob.type)

        // Create object URL for playback
        const url = URL.createObjectURL(blob)

        // Update state
        setRecordedBlob(blob)
        setRecordedUrl(url)
        setIsRecording(false)
        setIsPaused(false)
        setStatus('completed')

        // Clear timer
        clearTimer()

        // Callback
        onRecordingComplete?.(blob, url)
      }

      recorder.onerror = (event) => {
        console.error('[useRecorder] Recording error:', event)
        
        if (!isMountedRef.current) return

        const errorMsg = getErrorMessage(event)
        setError(errorMsg)
        setIsRecording(false)
        setStatus('error')
        clearTimer()
      }

      recorder.onpause = () => {
        console.log('[useRecorder] Recording paused')
        if (isMountedRef.current) {
          setIsPaused(true)
          setStatus('paused')
          pausedDurationRef.current = Date.now()
        }
      }

      recorder.onresume = () => {
        console.log('[useRecorder] Recording resumed')
        if (isMountedRef.current) {
          setIsPaused(false)
          setStatus('recording')
          // Adjust start time to account for pause duration
          const pauseDuration = Date.now() - pausedDurationRef.current
          startTimeRef.current += pauseDuration
        }
      }

      // Store recorder reference
      mediaRecorderRef.current = recorder

      // Start recording
      if (timeSlice > 0) {
        recorder.start(timeSlice)
      } else {
        recorder.start()
      }

      // Update state
      setIsRecording(true)
      setIsPaused(false)
      setError(null)
      setStatus('recording')
      startTimeRef.current = Date.now()

      // ========================================
      // DURATION TIMER
      // ========================================

      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          clearTimer()
          return
        }

        const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(currentDuration)
        onDurationUpdate?.(currentDuration)

        // Auto-stop at max duration
        if (currentDuration >= maxDuration) {
          console.log('[useRecorder] Max duration reached, stopping...')
          onMaxDurationReached?.()
          
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
          clearTimer()
        }
      }, 100) // Update every 100ms for smooth timer

      console.log('[useRecorder] Recording started successfully')

    } catch (err) {
      console.error('[useRecorder] Failed to start recording:', err)
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
      setStatus('error')
    }
  }, [
    mimeType,
    videoBitsPerSecond,
    timeSlice,
    maxDuration,
    resetRecording,
    clearTimer,
    onRecordingComplete,
    onDurationUpdate,
    onMaxDurationReached,
  ])

  // ==========================================
  // STOP RECORDING
  // ==========================================

  const stopRecording = useCallback(() => {
    console.log('[useRecorder] Stop recording requested')

    const recorder = mediaRecorderRef.current

    if (!recorder) {
      console.warn('[useRecorder] No active recorder to stop')
      return
    }

    if (recorder.state === 'inactive') {
      console.warn('[useRecorder] Recorder already inactive')
      return
    }

    setStatus('stopping')
    clearTimer()

    try {
      recorder.stop()
    } catch (err) {
      console.error('[useRecorder] Error stopping recorder:', err)
      setError(getErrorMessage(err))
      setStatus('error')
    }
  }, [clearTimer])

  // ==========================================
  // PAUSE RECORDING
  // ==========================================

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state !== 'recording') {
      console.warn('[useRecorder] Cannot pause: not recording')
      return
    }

    try {
      recorder.pause()
    } catch (err) {
      console.error('[useRecorder] Error pausing recorder:', err)
    }
  }, [])

  // ==========================================
  // RESUME RECORDING
  // ==========================================

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state !== 'paused') {
      console.warn('[useRecorder] Cannot resume: not paused')
      return
    }

    try {
      recorder.resume()
    } catch (err) {
      console.error('[useRecorder] Error resuming recorder:', err)
    }
  }, [])

  // ==========================================
  // SET RECORDED BLOB (for uploads)
  // ==========================================

  const setRecordedBlobExternal = useCallback((blob: Blob) => {
    console.log('[useRecorder] Setting external blob, size:', blob.size)

    // Revoke existing URL
    revokeUrl(recordedUrl)

    // Create new URL
    const url = URL.createObjectURL(blob)

    // Update state
    setRecordedBlob(blob)
    setRecordedUrl(url)
    setDuration(0) // Unknown duration for uploads
    setError(null)
    setStatus('completed')
  }, [recordedUrl, revokeUrl])

  // ==========================================
  // CLEANUP ON UNMOUNT
  // ==========================================

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      console.log('[useRecorder] Cleaning up on unmount')
      isMountedRef.current = false

      // Stop any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch (err) {
          console.warn('[useRecorder] Error stopping on unmount:', err)
        }
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Note: We don't revoke URL here because component might
      // re-mount and need the URL. URL is revoked in resetRecording.
    }
  }, [])

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    isRecording,
    isPaused,
    recordedBlob,
    recordedUrl,
    duration,
    error,
    status,

    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    setRecordedBlob: setRecordedBlobExternal,
  }
}

export default useRecorder