/**
 * useCamera Hook
 * 
 * Manages browser camera access using WebRTC APIs.
 * Handles permissions, stream lifecycle, and camera switching.
 * 
 * @example
 * const { stream, isActive, error, startCamera, stopCamera, toggleCamera } = useCamera()
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ==========================================
// TYPES
// ==========================================

export type FacingMode = 'user' | 'environment'

export interface CameraState {
  /** Active MediaStream from camera */
  stream: MediaStream | null
  /** Error message if camera failed */
  error: string | null
  /** Whether camera is currently active */
  isActive: boolean
  /** Whether camera is initializing */
  isInitializing: boolean
  /** Current camera facing mode */
  facingMode: FacingMode
  /** Whether device has multiple cameras */
  hasMultipleCameras: boolean
}

export interface CameraActions {
  /** Start camera with current settings */
  startCamera: () => Promise<void>
  /** Stop camera and release resources */
  stopCamera: () => void
  /** Toggle between front and back camera */
  toggleCamera: () => Promise<void>
  /** Set specific facing mode */
  setFacingMode: (mode: FacingMode) => Promise<void>
}

export interface CameraConfig {
  /** Initial facing mode */
  initialFacingMode?: FacingMode
  /** Ideal video width */
  idealWidth?: number
  /** Ideal video height */
  idealHeight?: number
  /** Ideal frame rate */
  idealFrameRate?: number
  /** Start camera automatically on mount */
  autoStart?: boolean
}

export type UseCameraReturn = CameraState & CameraActions

// ==========================================
// DEFAULT CONFIG
// ==========================================

const DEFAULT_CONFIG: Required<CameraConfig> = {
  initialFacingMode: 'user',
  idealWidth: 1280,
  idealHeight: 720,
  idealFrameRate: 30,
  autoStart: false,
}

// ==========================================
// ERROR MESSAGES
// ==========================================

const ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError: 'Camera access was denied. Please allow camera access in your browser settings.',
  NotFoundError: 'No camera found on this device.',
  NotReadableError: 'Camera is already in use by another application.',
  OverconstrainedError: 'Camera does not support the requested settings.',
  SecurityError: 'Camera access is not allowed on insecure origins. Use HTTPS.',
  AbortError: 'Camera access was aborted.',
  TypeError: 'Invalid camera configuration.',
  default: 'An unexpected error occurred while accessing the camera.',
}

/**
 * Get user-friendly error message from DOMException
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    return ERROR_MESSAGES[error.name] || ERROR_MESSAGES.default
  }
  if (error instanceof Error) {
    return error.message
  }
  return ERROR_MESSAGES.default
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useCamera(config: CameraConfig = {}): UseCameraReturn {
  // Merge config with defaults
  const {
    initialFacingMode,
    idealWidth,
    idealHeight,
    idealFrameRate,
    autoStart,
  } = { ...DEFAULT_CONFIG, ...config }

  // ==========================================
  // STATE
  // ==========================================

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [facingMode, setFacingModeState] = useState<FacingMode>(initialFacingMode)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true)

  // Ref to store current stream for cleanup
  const streamRef = useRef<MediaStream | null>(null)

  // ==========================================
  // CHECK FOR MULTIPLE CAMERAS
  // ==========================================

  useEffect(() => {
    async function checkCameras() {
      try {
        // Need to request permission first to enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (isMountedRef.current) {
          setHasMultipleCameras(videoDevices.length > 1)
        }
      } catch (err) {
        console.warn('[useCamera] Could not enumerate devices:', err)
      }
    }

    // Check if mediaDevices API is available
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      checkCameras()
    }
  }, [])

  // ==========================================
  // STOP CAMERA
  // ==========================================

  /**
   * Stop all tracks and release camera resources
   * 
   * Why this is critical:
   * 1. Releases camera hardware (LED turns off)
   * 2. Frees memory used by MediaStream
   * 3. Allows other apps to use camera
   * 4. Prevents memory leaks in long-running sessions
   */
  const stopCamera = useCallback(() => {
    console.log('[useCamera] Stopping camera...')

    const currentStream = streamRef.current

    if (currentStream) {
      // Stop each track individually
      currentStream.getTracks().forEach((track) => {
        console.log(`[useCamera] Stopping track: ${track.kind} - ${track.label}`)
        track.stop()
      })

      // Clear refs and state
      streamRef.current = null
    }

    if (isMountedRef.current) {
      setStream(null)
      setIsActive(false)
      setError(null)
    }

    console.log('[useCamera] Camera stopped')
  }, [])

  // ==========================================
  // START CAMERA
  // ==========================================

  /**
   * Request camera access and start stream
   */
  const startCamera = useCallback(async () => {
    console.log('[useCamera] Starting camera with facingMode:', facingMode)

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Camera API is not supported in this browser.'
      console.error('[useCamera]', errorMsg)
      if (isMountedRef.current) {
        setError(errorMsg)
      }
      return
    }

    // Prevent multiple simultaneous streams
    if (streamRef.current) {
      console.log('[useCamera] Stream already exists, stopping first...')
      stopCamera()
    }

    if (isMountedRef.current) {
      setIsInitializing(true)
      setError(null)
    }

    try {
      // Build constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
          frameRate: { ideal: idealFrameRate },
        },
        audio: false, // No audio needed for sports analysis
      }

      console.log('[useCamera] Requesting camera with constraints:', constraints)

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log('[useCamera] Component unmounted during camera init, cleaning up')
        mediaStream.getTracks().forEach(track => track.stop())
        return
      }

      // Log stream info
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        const settings = videoTrack.getSettings()
        console.log('[useCamera] Camera started:', {
          label: videoTrack.label,
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
        })
      }

      // Store stream
      streamRef.current = mediaStream
      setStream(mediaStream)
      setIsActive(true)
      setIsInitializing(false)

      // Update multiple cameras check after permission granted
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      setHasMultipleCameras(videoDevices.length > 1)

    } catch (err) {
      console.error('[useCamera] Error accessing camera:', err)
      
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
        setIsActive(false)
        setIsInitializing(false)
      }
    }
  }, [facingMode, idealWidth, idealHeight, idealFrameRate, stopCamera])

  // ==========================================
  // SET FACING MODE
  // ==========================================

  /**
   * Change facing mode (requires restarting camera)
   */
  const setFacingMode = useCallback(async (mode: FacingMode) => {
    console.log('[useCamera] Setting facing mode to:', mode)
    
    setFacingModeState(mode)

    // If camera is active, restart with new facing mode
    if (streamRef.current) {
      stopCamera()
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Start camera will use new facingMode from state
      // But since state update is async, we need to request directly
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return
      }

      if (isMountedRef.current) {
        setIsInitializing(true)
        setError(null)
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: mode,
            width: { ideal: idealWidth },
            height: { ideal: idealHeight },
            frameRate: { ideal: idealFrameRate },
          },
          audio: false,
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

        if (!isMountedRef.current) {
          mediaStream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = mediaStream
        setStream(mediaStream)
        setIsActive(true)
        setIsInitializing(false)

      } catch (err) {
        console.error('[useCamera] Error switching camera:', err)
        if (isMountedRef.current) {
          setError(getErrorMessage(err))
          setIsActive(false)
          setIsInitializing(false)
        }
      }
    }
  }, [stopCamera, idealWidth, idealHeight, idealFrameRate])

  // ==========================================
  // TOGGLE CAMERA
  // ==========================================

  /**
   * Toggle between front and back camera
   */
  const toggleCamera = useCallback(async () => {
    const newMode: FacingMode = facingMode === 'user' ? 'environment' : 'user'
    await setFacingMode(newMode)
  }, [facingMode, setFacingMode])

  // ==========================================
  // AUTO START
  // ==========================================

  useEffect(() => {
    if (autoStart) {
      startCamera()
    }
  }, [autoStart, startCamera])

  // ==========================================
  // CLEANUP ON UNMOUNT
  // ==========================================

  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true

    // Cleanup function
    return () => {
      console.log('[useCamera] Component unmounting, cleaning up...')
      isMountedRef.current = false

      // Stop all tracks
      const currentStream = streamRef.current
      if (currentStream) {
        currentStream.getTracks().forEach((track) => {
          console.log(`[useCamera] Cleanup: stopping track ${track.kind}`)
          track.stop()
        })
        streamRef.current = null
      }
    }
  }, [])

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    stream,
    error,
    isActive,
    isInitializing,
    facingMode,
    hasMultipleCameras,
    
    // Actions
    startCamera,
    stopCamera,
    toggleCamera,
    setFacingMode,
  }
}

export default useCamera