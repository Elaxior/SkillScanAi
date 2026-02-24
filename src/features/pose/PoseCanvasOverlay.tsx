/**
 * PoseCanvasOverlay Component
 *
 * Renders a canvas overlay synchronized with video playback,
 * drawing skeleton landmarks for the current video frame.
 * Ghost "Pro Form" overlay is structurally wired â€” activate once
 * the @/features/ghost module is implemented.
 */

'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useSessionStore, useUserStore } from '@/store'
import { POSE_CONNECTIONS } from './drawUtils'
import { LandmarkIndex } from './types'
import type { NormalizedLandmark } from './types'
import type { FrameDeviation } from '@/features/ghost'
import { getIdealPose } from '@/features/ghost'

// ============================================================================
// DRAWING UTILITIES
// ============================================================================

function drawConnections(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): void {
  ctx.strokeStyle = '#00ff88'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur = 10

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx]
    const end = landmarks[endIdx]
    if (!start || !end) continue
    if ((start.visibility ?? 1) < 0.5 || (end.visibility ?? 1) < 0.5) continue

    ctx.beginPath()
    ctx.moveTo(start.x * width, start.y * height)
    ctx.lineTo(end.x * width, end.y * height)
    ctx.stroke()
  }
}

/**
 * Fit the ideal skeleton onto the user's body by matching torso scale and hip position.
 * This prevents the ghost from appearing as a fixed figure in the wrong place.
 */
function fitIdealToUser(
  ideal: NormalizedLandmark[],
  user: NormalizedLandmark[]
): NormalizedLandmark[] {
  const LH = LandmarkIndex.LEFT_HIP, RH = LandmarkIndex.RIGHT_HIP
  const LS = LandmarkIndex.LEFT_SHOULDER, RS = LandmarkIndex.RIGHT_SHOULDER

  const iLH = ideal[LH], iRH = ideal[RH], iLS = ideal[LS], iRS = ideal[RS]
  const uLH = user[LH], uRH = user[RH], uLS = user[LS], uRS = user[RS]

  if (!iLH || !iRH || !iLS || !iRS || !uLH || !uRH || !uLS || !uRS) return ideal

  // Centers
  const iHipX = (iLH.x + iRH.x) / 2, iHipY = (iLH.y + iRH.y) / 2
  const iShX = (iLS.x + iRS.x) / 2, iShY = (iLS.y + iRS.y) / 2
  const uHipX = (uLH.x + uRH.x) / 2, uHipY = (uLH.y + uRH.y) / 2
  const uShX = (uLS.x + uRS.x) / 2, uShY = (uLS.y + uRS.y) / 2

  // Torso length scale factor
  const idealTorso = Math.hypot(iShX - iHipX, iShY - iHipY)
  const userTorso = Math.hypot(uShX - uHipX, uShY - uHipY)
  if (idealTorso < 0.001 || userTorso < 0.001) return ideal
  const scale = userTorso / idealTorso

  // Scale around ideal hip center, then translate to user hip center
  return ideal.map(lm => ({
    ...lm,
    x: uHipX + (lm.x - iHipX) * scale,
    y: uHipY + (lm.y - iHipY) * scale,
  }))
}

/**
 * Draw the ideal "pro form" ghost skeleton in translucent green,
 * aligned to the user's body scale and position.
 */
function drawGhostSkeleton(
  ctx: CanvasRenderingContext2D,
  idealLandmarks: NormalizedLandmark[],
  userLandmarks: NormalizedLandmark[],
  width: number,
  height: number
): void {
  // Align ideal skeleton to user's body
  const landmarks = fitIdealToUser(idealLandmarks, userLandmarks)

  ctx.save()
  ctx.globalAlpha = 0.6

  ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(34, 197, 94, 1)'
  ctx.shadowBlur = 10

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx]
    const end = landmarks[endIdx]
    if (!start || !end) continue
    if ((start.visibility ?? 1) < 0.5 || (end.visibility ?? 1) < 0.5) continue
    ctx.beginPath()
    ctx.moveTo(start.x * width, start.y * height)
    ctx.lineTo(end.x * width, end.y * height)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(34, 197, 94, 0.9)'
  ctx.shadowBlur = 14
  for (const lm of landmarks) {
    if (!lm || (lm.visibility ?? 1) < 0.5) continue
    ctx.beginPath()
    ctx.arc(lm.x * width, lm.y * height, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): void {
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#00ff88'
  ctx.shadowBlur = 8

  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i]
    if (!lm || (lm.visibility ?? 1) < 0.5) continue

    const radius = i === LandmarkIndex.NOSE ? 6 : 4
    ctx.beginPath()
    ctx.arc(lm.x * width, lm.y * height, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export interface PoseCanvasOverlayProps {
  /** Reference to the video element to sync with */
  videoRef: React.RefObject<HTMLVideoElement>
  /** Array of pose frames (PoseFrame[]) â€” falls back to store if omitted */
  frames?: import('./types').PoseFrame[]
  /** Video duration in seconds â€” used only when frames is passed directly */
  videoDuration?: number
  /** Whether the overlay is visible */
  visible?: boolean
  /** Whether to show L/R side colours */
  showSides?: boolean
  /** Callback when frame changes */
  onFrameChange?: (frameIndex: number) => void
  /** Controlled ghost "Pro Form" visibility */
  showGhost?: boolean
  /** Called when the ghost toggle button is clicked */
  onGhostToggle?: (enabled: boolean) => void
  /** Called with per-frame deviation data (stub until @/features/ghost is wired) */
  onDeviationUpdate?: (deviation: FrameDeviation | null) => void
  /** Extra CSS classes */
  className?: string
}

export function PoseCanvasOverlay({
  videoRef,
  frames: framesProp,
  videoDuration,
  visible = true,
  showSides = false,
  onFrameChange,
  showGhost: showGhostProp,
  onGhostToggle,
  onDeviationUpdate,
  className = '',
}: PoseCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const lastIdxRef = useRef<number>(-1)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [ghostEnabled, setGhostEnabled] = useState(showGhostProp ?? false)
  // Ref mirrors state so the rAF draw loop can read it without stale closure
  const ghostEnabledRef = useRef(showGhostProp ?? false)

  // Sync ghost state when controlled from outside
  useEffect(() => {
    if (showGhostProp !== undefined) setGhostEnabled(showGhostProp)
  }, [showGhostProp])

  // Keep ref in sync with state
  useEffect(() => { ghostEnabledRef.current = ghostEnabled }, [ghostEnabled])

  // Store
  const smoothedLandmarks = useSessionStore((s) => s.smoothedLandmarks)
  const storeFps = useSessionStore((s) => s.fps)
  const selectedSport = useUserStore((s) => s.selectedSport)
  const selectedAction = useUserStore((s) => s.selectedAction)
  // Refs so the rAF loop reads current sport/action without stale closure
  const sportRef = useRef(selectedSport)
  const actionRef = useRef(selectedAction)
  useEffect(() => { sportRef.current = selectedSport }, [selectedSport])
  useEffect(() => { actionRef.current = selectedAction }, [selectedAction])

  // Prefer explicit prop, fall back to store
  const frames = framesProp ?? smoothedLandmarks

  // FPS: explicit prop path uses videoDuration, store path uses storeFps
  const fps = framesProp
    ? (videoDuration && videoDuration > 0 ? frames.length / videoDuration : 30)
    : (storeFps ?? 30)

  // â”€â”€ Resize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const update = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const rect = video.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      setDimensions({ width: rect.width, height: rect.height })
    }

    update()
    const ro = new ResizeObserver(update)
    if (videoRef.current) ro.observe(videoRef.current)
    window.addEventListener('resize', update)
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [videoRef])

  // â”€â”€ Animation loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const draw = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!video || !canvas || !ctx || !visible) return
    if (!frames.length || dimensions.width === 0) { ctx.clearRect(0, 0, canvas.width, canvas.height); return }

    const idx = Math.max(0, Math.min(Math.floor(video.currentTime * fps), frames.length - 1))

    // Only redraw on frame change
    if (idx === lastIdxRef.current) return
    lastIdxRef.current = idx

    const frame = frames[idx]
    const landmarks: NormalizedLandmark[] | undefined =
      Array.isArray(frame) ? frame : (frame as import('./types').PoseFrame)?.landmarks

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (landmarks && landmarks.length > 0) {
      ctx.save()
      // Draw ghost pro-form BELOW user skeleton so it appears behind
      if (ghostEnabledRef.current) {
        const idealLandmarks = getIdealPose(
          sportRef.current ?? 'basketball',
          actionRef.current ?? 'jump_shot'
        )
        if (idealLandmarks && idealLandmarks.length > 0) {
          drawGhostSkeleton(ctx, idealLandmarks, landmarks, dimensions.width, dimensions.height)
        }
      }
      drawConnections(ctx, landmarks, dimensions.width, dimensions.height)
      drawLandmarks(ctx, landmarks, dimensions.width, dimensions.height)
      ctx.restore()
    }

    onFrameChange?.(idx)
  }, [videoRef, frames, fps, visible, dimensions, onFrameChange])

  useEffect(() => {
    if (!visible) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      return
    }
    const loop = () => { draw(); animRef.current = requestAnimationFrame(loop) }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current) }
  }, [visible, draw])

  useEffect(() => () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current) }, [])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 10 }}
    >
      {/* Skeleton canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Ghost Pro Form toggle â€” pointer-events re-enabled for button only */}
      <button
        onClick={() => {
          const next = !ghostEnabled
          setGhostEnabled(next)
          onGhostToggle?.(next)
          onDeviationUpdate?.(null)
        }}
        className="absolute bottom-4 right-4 pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/80 backdrop-blur border border-gray-700 hover:border-green-500/50 transition-all"
      >
        <span className={`w-2 h-2 rounded-full ${ghostEnabled ? 'bg-green-400' : 'bg-gray-500'}`} />
        <span className="text-sm text-white font-medium">
          {ghostEnabled ? 'Hide' : 'Show'} Pro Form
        </span>
      </button>

      {/* Ghost active badge */}
      {ghostEnabled && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
          <span className="text-xs text-green-400">ðŸ‘» Comparing with Pro Form</span>
        </div>
      )}
    </div>
  )
}

export default PoseCanvasOverlay

// ==========================================
