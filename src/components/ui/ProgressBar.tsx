'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// ==========================================
// PROGRESS BAR VARIANTS CONFIGURATION
// ==========================================

const progressVariants = cva(
  // Base container styles
  [
    'relative w-full overflow-hidden rounded-full',
    'bg-surface-light',
  ],
  {
    variants: {
      // ----------------------------------------
      // SIZE STYLES
      // ----------------------------------------
      size: {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const progressBarVariants = cva(
  // Base bar styles
  [
    'h-full rounded-full',
    'transition-all duration-700 ease-out',
  ],
  {
    variants: {
      // ----------------------------------------
      // COLOR VARIANTS
      // ----------------------------------------
      variant: {
        default: 'bg-primary-500',
        primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
        accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
        success: 'bg-gradient-to-r from-success-600 to-success-400',
        warning: 'bg-gradient-to-r from-warning-600 to-warning-400',
        danger: 'bg-gradient-to-r from-danger-600 to-danger-400',
        gradient: 'bg-gradient-to-r from-primary-500 via-accent-500 to-success-500',
        // Dynamic variant based on value
        dynamic: '', // Will be set based on value
      },

      // ----------------------------------------
      // ANIMATION
      // ----------------------------------------
      animated: {
        true: 'animate-progress',
        false: '',
      },

      // ----------------------------------------
      // GLOW EFFECT
      // ----------------------------------------
      glow: {
        true: '',
        false: '',
      },

      // ----------------------------------------
      // STRIPED PATTERN
      // ----------------------------------------
      striped: {
        true: [
          'bg-[length:1rem_1rem]',
          'bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]',
        ],
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      animated: true,
      glow: false,
      striped: false,
    },
  }
)

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  /** Progress value (0-100) */
  value: number
  /** Maximum value */
  max?: number
  /** Show percentage label */
  showLabel?: boolean
  /** Custom label */
  label?: string
  /** Label position */
  labelPosition?: 'top' | 'right' | 'inside'
  /** Show value inside bar (only for lg/xl sizes) */
  showValue?: boolean
  /** Use dynamic color based on value */
  dynamicColor?: boolean
}

// ==========================================
// HELPER FUNCTION - Get color based on value
// ==========================================

function getColorByValue(value: number): string {
  if (value < 30) return 'bg-gradient-to-r from-danger-600 to-danger-400'
  if (value < 50) return 'bg-gradient-to-r from-warning-600 to-warning-400'
  if (value < 75) return 'bg-gradient-to-r from-primary-500 to-primary-400'
  return 'bg-gradient-to-r from-success-600 to-success-400'
}

function getGlowByValue(value: number): string {
  if (value < 30) return 'shadow-glow-danger'
  if (value < 50) return 'shadow-glow-warning'
  if (value < 75) return 'shadow-glow-primary'
  return 'shadow-glow-success'
}

// ==========================================
// PROGRESS BAR COMPONENT
// ==========================================

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant,
      animated,
      glow,
      striped,
      value,
      max = 100,
      showLabel = false,
      label,
      labelPosition = 'top',
      showValue = false,
      dynamicColor = false,
      ...props
    },
    ref
  ) => {
    // Clamp value between 0 and max
    const clampedValue = Math.min(Math.max(value, 0), max)
    const percentage = (clampedValue / max) * 100

    // Determine bar color
    const barColorClass = dynamicColor
      ? getColorByValue(percentage)
      : undefined

    const barGlowClass = dynamicColor && glow
      ? getGlowByValue(percentage)
      : glow
        ? 'shadow-glow-primary-sm'
        : ''

    // Label content
    const labelContent = label || `${Math.round(percentage)}%`

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {/* Top label */}
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">{label || 'Progress'}</span>
            <span className="text-sm font-medium text-text-primary">
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress container with optional right label */}
        <div className={cn(
          'flex items-center gap-3',
          labelPosition === 'right' && showLabel && 'flex-row'
        )}>
          {/* Progress track */}
          <div
            className={cn(progressVariants({ size }), 'flex-1')}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={max}
          >
            {/* Progress bar fill */}
            <div
              className={cn(
                progressBarVariants({
                  variant: dynamicColor ? 'dynamic' : variant,
                  animated,
                  striped,
                }),
                barColorClass,
                barGlowClass,
                'relative'
              )}
              style={{
                width: `${percentage}%`,
                ['--progress-width' as string]: `${percentage}%`,
              }}
            >
              {/* Inside value (for larger sizes) */}
              {showValue && (size === 'lg' || size === 'xl') && percentage > 15 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          </div>

          {/* Right label */}
          {showLabel && labelPosition === 'right' && (
            <span className="text-sm font-medium text-text-primary min-w-[3rem] text-right">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export { ProgressBar, progressVariants, progressBarVariants }
export default ProgressBar