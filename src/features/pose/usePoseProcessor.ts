/**
 * usePoseProcessor Hook
 * 
 * Processes video frames through MediaPipe Pose to extract body landmarks.
 * Handles model initialization, frame-by-frame processing, and cleanup.
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Pose, Results as PoseResults } from '@mediapipe/pose'
import {
  NormalizedLandmark,
  PoseFrame,
  PoseDetectionResult,
  ProcessingStatus,
  ProcessingProgress,
} from './types'
import {
  validateLandmarks,
  calculateFrameConfidence,
  calculateFrameStats,
} from './poseUtils'

// ==========================================
// TYPES
// ==========================================

export interface PoseProcessorState {
  /** Current processing status */
  status: ProcessingStatus
  /** Processing progress */
  progress: ProcessingProgress
  /** Extracted pose frames */
  frames: PoseFrame[]
  /** Detection result summary */
  result: PoseDetectionResult | null
  /** Error message */
  error: string | null
  /** Whether pose model is loaded */
  isModelLoaded: boolean
}

export interface PoseProcessorActions {
  /** Process a video element and extract landmarks */
  processVideo: (video: HTMLVideoElement) => Promise<PoseDetectionResult | null>
  /** Reset all processing state */
  reset: () => void
  /** Cancel ongoing processing */
  cancel: () => void
}

export type UsePoseProcessorReturn = PoseProcessorState & PoseProcessorActions

export interface PoseProcessorConfig {
  /** Model complexity (0=lite, 1=full, 2=heavy) */
  modelComplexity?: 0 | 1 | 2
  /** Smooth landmarks across frames */
  smoothLandmarks?: boolean
  /** Minimum detection confidence */
  minDetectionConfidence?: number
  /** Minimum tracking confidence */
  minTrackingConfidence?: number
  /** Target FPS for processing (lower = faster but less frames) */
  targetFps?: number
  /** Callback when a frame is processed */
  onFrameProcessed?: (frame: PoseFrame) => void
  /** Callback when processing completes */
  onComplete?: (result: PoseDetectionResult) => void
  /** Callback for progress updates */
  onProgress?: (progress: ProcessingProgress) => void
}

// ==========================================
// DEFAULTS
// ==========================================

const DEFAULT_CONFIG: Required<Omit<PoseProcessorConfig, 'onFrameProcessed' | 'onComplete' | 'onProgress'>> = {
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  targetFps: 30,
}

// ==========================================
// INITIAL STATE
// ==========================================

const initialProgress: ProcessingProgress = {
  status: 'idle',
  currentFrame: 0,
  totalFrames: 0,
  percentage: 0,
  estimatedTimeRemaining: null,
  error: null,
}

const initialState: PoseProcessorState = {
  status: 'idle',
  progress: initialProgress,
  frames: [],
  result: null,
  error: null,
  isModelLoaded: false,
}

// ============================================================================
// MODULE-LEVEL SINGLETON
// Shared across hook instances and React Strict Mode re-mounts.
// Ensures only one MediaPipe WASM instance exists at a time, preventing
// the "Module.arguments has been replaced with arguments_" crash from
// two overlapping Pose initializations.
// ============================================================================

let _globalPose: InstanceType<typeof Pose> | null = null;
let _globalPoseInitializing: Promise<InstanceType<typeof Pose>> | null = null;

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function usePoseProcessor(
  config: PoseProcessorConfig = {}
): UsePoseProcessorReturn {
  // Merge config with defaults
  const {
    modelComplexity,
    smoothLandmarks,
    minDetectionConfidence,
    minTrackingConfidence,
    targetFps,
    onFrameProcessed,
    onComplete,
    onProgress,
  } = { ...DEFAULT_CONFIG, ...config }

  // ==========================================
  // STATE
  // ==========================================

  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [progress, setProgress] = useState<ProcessingProgress>(initialProgress)
  const [frames, setFrames] = useState<PoseFrame[]>([])
  const [result, setResult] = useState<PoseDetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  // ==========================================
  // REFS
  // ==========================================

  const poseRef = useRef<Pose | null>(null)
  const isCancelledRef = useRef(false)
  const isMountedRef = useRef(true)
  const processingStartTimeRef = useRef<number>(0)

  // ==========================================
  // UPDATE PROGRESS
  // ==========================================

  const updateProgress = useCallback((updates: Partial<ProcessingProgress>) => {
    setProgress((prev) => {
      const newProgress = { ...prev, ...updates }
      onProgress?.(newProgress)
      return newProgress
    })
  }, [onProgress])

  // ==========================================
  // INITIALIZE POSE MODEL
  // ==========================================

  const initializePose = useCallback(async (): Promise<Pose> => {
    console.log('[usePoseProcessor] Initializing MediaPipe Pose...')

    // Return existing module-level singleton (survives Strict Mode re-mounts)
    if (_globalPose) {
      console.log('[usePoseProcessor] Using existing global Pose singleton')
      poseRef.current = _globalPose
      if (isMountedRef.current) setIsModelLoaded(true)
      return _globalPose
    }

    // If already initializing in another instance, wait for that promise
    if (_globalPoseInitializing) {
      console.log('[usePoseProcessor] Waiting for in-progress initialization...')
      const pose = await _globalPoseInitializing
      poseRef.current = pose
      if (isMountedRef.current) setIsModelLoaded(true)
      return pose
    }

    setStatus('loading-model')
    updateProgress({ status: 'loading-model' })

    _globalPoseInitializing = new Promise((resolve, reject) => {
      try {
        const pose = new Pose({
          locateFile: (file) => {
            console.log('[usePoseProcessor] Loading file:', file)
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          },
        })

        // Configure pose options
        pose.setOptions({
          modelComplexity,
          smoothLandmarks,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence,
          minTrackingConfidence,
        })

        // Initialize the model
        pose.initialize().then(() => {
          console.log('[usePoseProcessor] Pose model initialized')
          _globalPose = pose
          _globalPoseInitializing = null
          poseRef.current = pose

          if (isMountedRef.current) {
            setIsModelLoaded(true)
          }

          resolve(pose)
        }).catch((err) => {
          console.error('[usePoseProcessor] Failed to initialize:', err)
          _globalPoseInitializing = null
          reject(err)
        })

      } catch (err) {
        console.error('[usePoseProcessor] Error creating Pose:', err)
        _globalPoseInitializing = null
        reject(err)
      }
    })

    return _globalPoseInitializing
  }, [modelComplexity, smoothLandmarks, minDetectionConfidence, minTrackingConfidence, updateProgress])

  // ==========================================
  // PROCESS VIDEO
  // ==========================================

  const processVideo = useCallback(async (
    video: HTMLVideoElement
  ): Promise<PoseDetectionResult | null> => {
    console.log('[usePoseProcessor] Starting video processing')

    isCancelledRef.current = false
    processingStartTimeRef.current = Date.now()

    try {
      // Reset state
      setFrames([])
      setResult(null)
      setError(null)
      setStatus('initializing')
      updateProgress({
        status: 'initializing',
        currentFrame: 0,
        totalFrames: 0,
        percentage: 0,
      })

      // Initialize pose model
      const pose = await initializePose()

      if (isCancelledRef.current) {
        console.log('[usePoseProcessor] Cancelled during initialization')
        return null
      }

      // Ensure video is ready
      if (video.readyState < 2) {
        console.log('[usePoseProcessor] Waiting for video to load...')
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'))
          }, 30000)

          // Use addEventListener so multiple concurrent processVideo calls
          // (e.g. from React Strict Mode double-mount) don't overwrite each other.
          const onLoaded = () => {
            clearTimeout(timeout)
            video.removeEventListener('loadeddata', onLoaded)
            video.removeEventListener('error', onError)
            resolve()
          }
          const onError = () => {
            clearTimeout(timeout)
            video.removeEventListener('loadeddata', onLoaded)
            video.removeEventListener('error', onError)
            reject(new Error('Video load error'))
          }
          video.addEventListener('loadeddata', onLoaded)
          video.addEventListener('error', onError)
        })
      }

      // Get video info
      const duration = video.duration
      const frameTime = 1 / targetFps
      const estimatedFrames = Math.ceil(duration * targetFps)

      console.log('[usePoseProcessor] Video info:', {
        duration,
        estimatedFrames,
        targetFps,
      })

      setStatus('processing')
      updateProgress({
        status: 'processing',
        totalFrames: estimatedFrames,
      })

      // Collected frames
      const collectedFrames: PoseFrame[] = []
      let frameNumber = 0
      let currentTime = 0

      // Create promise for results
      let resolveFrame: ((landmarks: NormalizedLandmark[] | null) => void) | null = null

      // Set up results handler
      pose.onResults((results: PoseResults) => {
        if (resolveFrame) {
          if (results.poseLandmarks) {
            // Convert to our landmark type
            const landmarks: NormalizedLandmark[] = results.poseLandmarks.map((lm) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility,
            }))
            resolveFrame(landmarks)
          } else {
            resolveFrame(null)
          }
          resolveFrame = null
        }
      })

      // Process frames by seeking through video
      console.log('[usePoseProcessor] Processing frames...')

      // Pause video for seeking
      video.pause()

      while (currentTime < duration && !isCancelledRef.current) {
        // Seek to time
        video.currentTime = currentTime

        // Wait for seek to complete
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            resolve()
          }
          video.addEventListener('seeked', onSeeked)
        })

        // Process frame
        const landmarks = await new Promise<NormalizedLandmark[] | null>((resolve) => {
          resolveFrame = resolve
          pose.send({ image: video }).catch((err) => {
            console.warn('[usePoseProcessor] Frame processing error:', err)
            resolve(null)
          })

          // Timeout for frame processing
          setTimeout(() => {
            if (resolveFrame) {
              resolveFrame(null)
              resolveFrame = null
            }
          }, 5000)
        })

        // Create frame data
        if (landmarks && landmarks.length > 0) {
          const validation = validateLandmarks(landmarks)
          const confidence = calculateFrameConfidence(landmarks)

          const frame: PoseFrame = {
            frameNumber,
            timestamp: currentTime,
            landmarks,
            confidence,
          }

          collectedFrames.push(frame)
          onFrameProcessed?.(frame)

          console.log(
            `[usePoseProcessor] Frame ${frameNumber}: ` +
            `${validation.validCount}/${landmarks.length} landmarks, ` +
            `confidence: ${(confidence * 100).toFixed(1)}%`
          )
        } else {
          console.log(`[usePoseProcessor] Frame ${frameNumber}: No pose detected`)
        }

        // Update progress
        frameNumber++
        currentTime += frameTime

        const percentage = Math.min((currentTime / duration) * 100, 100)
        const elapsedTime = Date.now() - processingStartTimeRef.current
        const estimatedTotal = elapsedTime / (percentage / 100)
        const estimatedRemaining = (estimatedTotal - elapsedTime) / 1000

        if (isMountedRef.current) {
          setFrames([...collectedFrames])
          updateProgress({
            currentFrame: frameNumber,
            percentage,
            estimatedTimeRemaining: percentage > 5 ? estimatedRemaining : null,
          })
        }
      }

      // Check if cancelled
      if (isCancelledRef.current) {
        console.log('[usePoseProcessor] Processing cancelled')
        return null
      }

      // Calculate results
      const processingTime = Date.now() - processingStartTimeRef.current
      const stats = calculateFrameStats(collectedFrames)

      const detectionResult: PoseDetectionResult = {
        frames: collectedFrames,
        totalFrames: frameNumber,
        framesWithPose: collectedFrames.length,
        detectionRate: frameNumber > 0 ? collectedFrames.length / frameNumber : 0,
        videoDuration: duration,
        processingTime,
      }

      console.log('[usePoseProcessor] Processing complete:', {
        totalFrames: frameNumber,
        framesWithPose: collectedFrames.length,
        detectionRate: `${(detectionResult.detectionRate * 100).toFixed(1)}%`,
        processingTime: `${processingTime}ms`,
        avgConfidence: `${(stats.avgConfidence * 100).toFixed(1)}%`,
      })

      if (isMountedRef.current) {
        setFrames(collectedFrames)
        setResult(detectionResult)
        setStatus('completed')
        updateProgress({
          status: 'completed',
          currentFrame: frameNumber,
          percentage: 100,
          estimatedTimeRemaining: 0,
        })
      }

      onComplete?.(detectionResult)
      return detectionResult

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      const isExpectedCancellation =
        errorMessage.includes('Video load timeout') ||
        errorMessage.includes('cancelled') ||
        isCancelledRef.current

      if (!isExpectedCancellation) {
        console.error('[usePoseProcessor] Processing error:', err)
        if (isMountedRef.current) {
          setError(errorMessage)
          setStatus('error')
          updateProgress({ status: 'error', error: errorMessage })
        }
      }

      return null
    }
  }, [initializePose, targetFps, updateProgress, onFrameProcessed, onComplete])

  // ==========================================
  // RESET
  // ==========================================

  const reset = useCallback(() => {
    console.log('[usePoseProcessor] Resetting state')

    isCancelledRef.current = true

    setStatus('idle')
    setProgress(initialProgress)
    setFrames([])
    setResult(null)
    setError(null)
  }, [])

  // ==========================================
  // CANCEL
  // ==========================================

  const cancel = useCallback(() => {
    console.log('[usePoseProcessor] Cancelling processing')
    isCancelledRef.current = true

    if (isMountedRef.current) {
      setStatus('idle')
      updateProgress({
        status: 'idle',
        percentage: 0,
      })
    }
  }, [updateProgress])

  // ==========================================
  // CLEANUP ON UNMOUNT
  // ==========================================

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      console.log('[usePoseProcessor] Cleaning up (keeping global Pose singleton alive)')
      isMountedRef.current = false
      isCancelledRef.current = true
      // Do NOT close the Pose instance here — it is shared as a module-level
      // singleton (_globalPose) and must survive Strict Mode re-mounts.
      // Closing it would destroy the WASM context for all future uses.
      poseRef.current = null
    }
  }, [])

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State
    status,
    progress,
    frames,
    result,
    error,
    isModelLoaded,

    // Actions
    processVideo,
    reset,
    cancel,
  }
}

export default usePoseProcessor

// ==========================================
// WHY FRAME-BY-FRAME PROCESSING
// ==========================================

/**
 * Why we collect frame-by-frame data instead of single frame:
 * 
 * 1. MOVEMENT ANALYSIS
 *    - Sports are about motion, not static poses
 *    - Need trajectory of body parts over time
 *    - Single frame misses the "how" of movement
 * 
 * 2. METRIC CALCULATION
 *    - Speed requires position change over time
 *    - Acceleration requires speed change over time
 *    - Consistency requires comparing multiple repetitions
 * 
 * 3. FIND BEST FRAMES
 *    - Not all frames have clear poses
 *    - Can find the frame with highest confidence
 *    - Can interpolate missing frames
 * 
 * 4. PHASE DETECTION
 *    - Sports movements have phases (prep, action, follow-through)
 *    - Need multiple frames to detect phase boundaries
 *    - Single frame can't tell if you're rising or falling
 * 
 * 5. COMPARE TO PROS
 *    - Professional reference is a video, not single image
 *    - Need to compare timing, not just positions
 *    - Frame-by-frame allows temporal alignment
 */