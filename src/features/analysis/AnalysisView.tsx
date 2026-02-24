/**
 * Analysis View Component - Updated with Ghost Integration
 */

'use client'

import { useRef, useState } from 'react'
import { useSessionStore } from '@/store'
import { PoseCanvasOverlay } from '@/features/pose'
import type { FrameDeviation } from '@/features/ghost'

interface AnalysisViewProps {
  showGhost?: boolean
  onGhostToggle?: (enabled: boolean) => void
  onDeviationUpdate?: (deviation: FrameDeviation | null) => void
}

export function AnalysisView({
  showGhost = false,
  onGhostToggle,
  onDeviationUpdate,
}: AnalysisViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const videoUrl = useSessionStore((state) => state.video.url)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">No video available</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video object-contain bg-black"
        loop
        playsInline
        onClick={handlePlayPause}
      />

      {/* Pose Overlay with Ghost */}
      <PoseCanvasOverlay
        videoRef={videoRef}
        showGhost={showGhost}
        onGhostToggle={onGhostToggle}
        onDeviationUpdate={onDeviationUpdate}
      />

      {/* Play/Pause Overlay */}
      <button
        onClick={handlePlayPause}
        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
      >
        <span className={`text-6xl opacity-0 group-hover:opacity-100 transition-opacity ${isPlaying ? 'hidden' : ''}`}>
          ▶️
        </span>
      </button>

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="flex-1">
            <div className="text-xs text-gray-400">
              {isPlaying ? 'Playing' : 'Paused'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
