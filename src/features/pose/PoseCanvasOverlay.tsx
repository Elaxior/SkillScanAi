/**
 * PoseCanvasOverlay Component
 * 
 * Renders a canvas overlay synchronized with video playback,
 * drawing skeleton landmarks for the current video frame.
 */

'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { NormalizedLandmark, PoseFrame } from './types'
import {
  clearCanvas,
  drawSkeleton,
  drawSkeletonWithSides,
  DrawingOptions,
} from './drawUtils'

// ==========================================
// TYPES
// ==========================================

export interface PoseCanvasOverlayProps {
  /** Reference to the video element to sync with */
  videoRef: React.RefObject<HTMLVideoElement>
  /** Array of pose frames with landmarks */
  frames: PoseFrame[]
  /** Video duration in seconds */
  videoDuration: number
  /** Whether the overlay is visible */
  visible?: boolean
  /** Drawing style options */
  drawingOptions?: Partial<DrawingOptions>
  /** Whether to show left/right side colors */
  showSides?: boolean
  /** Callback when frame changes */
  onFrameChange?: (frameIndex: number) => void
  /** Additional CSS class names */
  className?: string
}

// ==========================================
// COMPONENT
// ==========================================

export function PoseCanvasOverlay({
  videoRef,
  frames,
  videoDuration,
  visible = true,
  drawingOptions = {},
  showSides = false,
  onFrameChange,
  className = '',
}: PoseCanvasOverlayProps) {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameIndexRef = useRef<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // State for canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Calculate FPS estimate from frames
  const fpsEstimate = videoDuration > 0 ? frames.length / videoDuration : 30

  // ==========================================
  // RESIZE HANDLING
  // ==========================================

  const updateCanvasSize = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    // Get video's displayed size
    const rect = video.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    // Handle device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1

    // Set canvas internal resolution
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr

    // Set canvas CSS size to match video
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    // Scale context for DPR
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Update state
    setCanvasSize({ width: displayWidth, height: displayHeight })

    console.log('[PoseCanvasOverlay] Canvas resized:', {
      display: `${displayWidth}x${displayHeight}`,
      internal: `${canvas.width}x${canvas.height}`,
      dpr,
    })
  }, [videoRef])

  // ==========================================
  // RESIZE OBSERVER
  // ==========================================

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Initial size
    updateCanvasSize()

    // Observe video element for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    resizeObserver.observe(video)

    // Also update on window resize (for orientation changes)
    window.addEventListener('resize', updateCanvasSize)

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [videoRef, updateCanvasSize])

  // ==========================================
  // FRAME SYNC & DRAWING
  // ==========================================

  const drawCurrentFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!video || !canvas || !ctx || !visible) {
      return
    }

    // Don't draw if no frames
    if (frames.length === 0) {
      clearCanvas(ctx)
      return
    }

    // Calculate current frame index from video time
    const currentTime = video.currentTime
    let frameIndex = Math.floor(currentTime * fpsEstimate)

    // Clamp to valid range
    frameIndex = Math.max(0, Math.min(frameIndex, frames.length - 1))

    // Only redraw if frame changed
    if (frameIndex === lastFrameIndexRef.current) {
      return
    }

    lastFrameIndexRef.current = frameIndex

    // Get landmarks for current frame
    const currentFrame = frames[frameIndex]
    if (!currentFrame || !currentFrame.landmarks) {
      clearCanvas(ctx)
      return
    }

    // Clear previous frame
    clearCanvas(ctx)

    // Draw skeleton
    const { width, height } = canvasSize

    if (width === 0 || height === 0) return

    if (showSides) {
      drawSkeletonWithSides(
        ctx,
        currentFrame.landmarks,
        width,
        height,
        {
          keyLandmarksOnly: true,
          enableGlow: true,
          ...drawingOptions,
        }
      )
    } else {
      drawSkeleton(
        ctx,
        currentFrame.landmarks,
        width,
        height,
        {
          keyLandmarksOnly: true,
          enableGlow: true,
          landmarkColor: '#00FF00',
          connectionColor: '#00FF00',
          glowColor: '#00FF00',
          ...drawingOptions,
        }
      )
    }

    // Callback
    onFrameChange?.(frameIndex)
  }, [
    videoRef,
    frames,
    fpsEstimate,
    visible,
    canvasSize,
    showSides,
    drawingOptions,
    onFrameChange,
  ])

  // ==========================================
  // ANIMATION LOOP
  // ==========================================

  useEffect(() => {
    if (!visible) {
      // Clear canvas when hidden
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        clearCanvas(ctx)
      }
      return
    }

    // Animation loop function
    const animate = () => {
      drawCurrentFrame()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [visible, drawCurrentFrame])

  // ==========================================
  // CLEANUP ON UNMOUNT
  // ==========================================

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // ==========================================
  // RENDER
  // ==========================================

  if (!visible) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 10 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{
          width: canvasSize.width || '100%',
          height: canvasSize.height || '100%',
        }}
      />
    </div>
  )
}

// ==========================================
// FRAME SYNCING LOGIC EXPLAINED
// ==========================================

/**
 * Frame Syncing Explanation:
 * 
 * PROBLEM:
 * - Video plays at arbitrary speed (30fps typical)
 * - We have N frames of landmark data
 * - Need to show correct landmarks for current video time
 * 
 * SOLUTION:
 * 
 * 1. Calculate FPS estimate:
 *    fpsEstimate = totalFrames / videoDuration
 *    Example: 150 frames / 5 seconds = 30 fps
 * 
 * 2. For each animation frame, get video.currentTime
 *    Example: currentTime = 2.5 seconds
 * 
 * 3. Calculate frame index:
 *    frameIndex = floor(currentTime * fpsEstimate)
 *    Example: floor(2.5 * 30) = 75
 * 
 * 4. Get landmarks[75] and draw
 * 
 * 5. Only redraw if frame index changed
 *    (prevents unnecessary work)
 * 
 * EDGE CASES:
 * - Clamp to valid range [0, frames.length - 1]
 * - Handle empty frames array
 * - Handle paused video (same frame)
 * - Handle seeking (big frame jumps)
 */

export default PoseCanvasOverlay