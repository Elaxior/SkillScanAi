'use client'

import React, { useEffect, useState } from 'react'
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
  /** Custom color override */
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
// HELPER FUNCTIONS
// ==========================================

// Get color based on score range
function getScoreColor(score: number): {
  stroke: string
  text: string
  glow: string
  bg: string
} {
  if (score < 30) {
    return {
      stroke: '#ef4444', // danger
      text: 'text-danger-400',
      glow: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]',
      bg: 'bg-danger-500/10',
    }
  }
  if (score < 50) {
    return {
      stroke: '#f97316', // orange
      text: 'text-orange-400',
      glow: 'drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]',
      bg: 'bg-orange-500/10',
    }
  }
  if (score < 75) {
    return {
      stroke: '#eab308', // warning
      text: 'text-warning-400',
      glow: 'drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]',
      bg: 'bg-warning-500/10',
    }
  }
  return {
    stroke: '#22c55e', // success
    text: 'text-success-400',
    glow: 'drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    bg: 'bg-success-500/10',
  }
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
  // State for animation
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)
  const [isAnimating, setIsAnimating] = useState(animate)

  // Get size configuration
  const config = sizeConfig[size]
  const diameter = config.diameter
  const stroke = strokeWidth || config.defaultStroke
  const radius = (diameter - stroke) / 2
  const circumference = 2 * Math.PI * radius

  // Clamp score
  const clampedScore = Math.min(Math.max(score, 0), 100)

  // Get colors
  const colors = color ? {
    stroke: color,
    text: 'text-white',
    glow: `drop-shadow-[0_0_10px_${color}80]`,
    bg: `${color}1A`,
  } : getScoreColor(clampedScore)

  // Calculate stroke offset
  const strokeOffset = circumference - (clampedScore / 100) * circumference

  // Animate score number
  useEffect(() => {
    if (!animate) {
      setDisplayScore(clampedScore)
      return
    }

    setIsAnimating(true)
    const startTime = Date.now()
    const startScore = 0

    const animateScore = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      
      // Easing function (ease-out cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentScore = Math.round(startScore + (clampedScore - startScore) * easeOutCubic)
      setDisplayScore(currentScore)

      if (progress < 1) {
        requestAnimationFrame(animateScore)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animateScore)
  }, [clampedScore, animate, animationDuration])

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center justify-center',
        className
      )}
    >
      {/* SVG Ring */}
      <svg
        width={diameter}
        height={diameter}
        className={cn(
          'transform -rotate-90',
          glow && colors.glow,
          'transition-[filter] duration-300'
        )}
      >
        {/* Background circle (track) */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-surface-border"
        />

        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isAnimating ? circumference : strokeOffset}
          className="transition-[stroke-dashoffset] ease-out"
          style={{
            transitionDuration: `${animationDuration}ms`,
            ['--circumference' as string]: circumference,
            ['--dash-offset' as string]: strokeOffset,
          }}
        />

        {/* Glow effect circle (optional decorative) */}
        {glow && (
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={stroke / 2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isAnimating ? circumference : strokeOffset}
            className="opacity-50 blur-sm transition-[stroke-dashoffset] ease-out"
            style={{
              transitionDuration: `${animationDuration}ms`,
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showScore && (
          <span
            className={cn(
              'font-bold tabular-nums',
              config.fontSize,
              colors.text
            )}
          >
            {displayScore}
          </span>
        )}
        {label && (
          <span
            className={cn(
              'text-text-secondary font-medium mt-1',
              config.labelSize
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

ScoreRing.displayName = 'ScoreRing'

export { ScoreRing }
export default ScoreRing