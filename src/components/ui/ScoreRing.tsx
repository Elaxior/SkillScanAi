'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface ScoreRingProps {
  /** Score value (0-100) */
  score: number
  /** Size of the ring */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Stroke width */
  strokeWidth?: number
  /** Show score number inside */
  showScore?: boolean
  /** Label below score */
  label?: string
  /** Custom color override (hex) — disables gradient */
  color?: string
  /** Animation duration in ms */
  animationDuration?: number
  /** Whether to animate on mount */
  animate?: boolean
  /** Show glow effect */
  glow?: boolean
  /** Additional class names */
  className?: string
}

// ==========================================
// HELPERS
// ==========================================

function getGradientId(score: number): string {
  if (score >= 80) return 'srGradGreen'
  if (score >= 60) return 'srGradYellow'
  return 'srGradRed'
}

function getScoreTextColor(score: number): string {
  if (score >= 90) return '#22c55e'
  if (score >= 80) return '#10b981'
  if (score >= 70) return '#eab308'
  if (score >= 60) return '#f97316'
  return '#ef4444'
}

// Size configurations
const sizeConfig = {
  sm: { diameter: 80, fontSize: 'text-xl', labelSize: 'text-xs', defaultStroke: 6 },
  md: { diameter: 120, fontSize: 'text-3xl', labelSize: 'text-sm', defaultStroke: 8 },
  lg: { diameter: 160, fontSize: 'text-4xl', labelSize: 'text-base', defaultStroke: 10 },
  xl: { diameter: 200, fontSize: 'text-5xl', labelSize: 'text-lg', defaultStroke: 12 },
}

// ==========================================
// SCORE RING COMPONENT
// ==========================================

const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  strokeWidth,
  showScore = true,
  label,
  color,
  animationDuration = 1500,
  animate = true,
  glow = true,
  className,
}) => {
  const clampedScore = Math.min(Math.max(score, 0), 100)
  const [displayScore, setDisplayScore] = useState(animate ? 0 : clampedScore)
  const [mounted, setMounted] = useState(false)
  const scoreRef = useRef(clampedScore)
  scoreRef.current = clampedScore

  const config = sizeConfig[size]
  const diameter = config.diameter
  const stroke = strokeWidth ?? config.defaultStroke
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (clampedScore / 100) * circumference

  const gradientId = color ? undefined : getGradientId(clampedScore)
  const strokeColor = color ?? `url(#${gradientId})`
  const textColor = color ?? getScoreTextColor(clampedScore)

  // Trigger CSS transition one frame after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Animate score counter
  useEffect(() => {
    if (!animate) { setDisplayScore(clampedScore); return }
    const start = Date.now()
    const tick = () => {
      const t = Math.min((Date.now() - start) / animationDuration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayScore(Math.round(eased * scoreRef.current))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [clampedScore, animate, animationDuration])

  const currentOffset = mounted ? strokeOffset : circumference

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="transform -rotate-90"
      >
        <defs>
          {/* Green → cyan gradient (score ≥ 80) */}
          <linearGradient id="srGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Yellow → orange gradient (score 60–79) */}
          <linearGradient id="srGradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Orange → red gradient (score < 60) */}
          <linearGradient id="srGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Glow filter */}
          {glow && (
            <filter id="srGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-800"
        />

        {/* Progress arc */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={currentOffset}
          filter={glow ? 'url(#srGlow)' : undefined}
          style={{ transition: `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.16,1,0.3,1)` }}
        />
      </svg>

      {/* Center content */}
      {showScore && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn('font-bold tabular-nums', config.fontSize)}
            style={{
              color: textColor,
              transition: 'color 0.5s ease',
            }}
          >
            {displayScore}
          </span>
          {label ? (
            <span className={cn('text-gray-400 font-medium mt-1', config.labelSize)}>
              {label}
            </span>
          ) : (
            <span className={cn('text-gray-500 mt-1', config.labelSize === 'text-xs' ? 'text-[10px]' : 'text-xs')}>
              / 100
            </span>
          )}
        </div>
      )}
    </div>
  )
}

ScoreRing.displayName = 'ScoreRing'

export { ScoreRing }
export default ScoreRing