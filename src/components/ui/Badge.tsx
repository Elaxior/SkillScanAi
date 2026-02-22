'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// ==========================================
// BADGE VARIANTS CONFIGURATION
// ==========================================

const badgeVariants = cva(
  // Base styles — sharp military
  [
    'inline-flex items-center justify-center',
    'font-bold uppercase tracking-[0.1em]',
    'transition-colors duration-200',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface-light text-text-secondary border border-surface-border',
        ],
        primary: [
          'bg-primary-500/15 text-primary-400 border border-primary-500/30',
        ],
        accent: [
          'bg-accent-500/15 text-accent-400 border border-accent-500/30',
        ],
        success: [
          'bg-success-500/15 text-success-400 border border-success-500/30',
        ],
        warning: [
          'bg-warning-500/15 text-warning-400 border border-warning-500/30',
        ],
        danger: [
          'bg-danger-500/15 text-danger-400 border border-danger-500/30',
        ],
        info: [
          'bg-accent-500/15 text-accent-400 border border-accent-500/30',
        ],
        // Solid variants
        'solid-primary': ['bg-primary-500 text-black'],
        'solid-success': ['bg-success-500 text-white'],
        'solid-warning': ['bg-warning-500 text-black'],
        'solid-danger':  ['bg-danger-500  text-white'],
        // Outline variants
        'outline-primary': ['bg-transparent text-primary-400 border border-primary-500'],
        'outline-success': ['bg-transparent text-success-400 border border-success-500'],
        'outline-warning': ['bg-transparent text-warning-400 border border-warning-500'],
        'outline-danger':  ['bg-transparent text-danger-400  border border-danger-500'],
        // Glow variants
        'glow-primary': [
          'bg-primary-500/15 text-primary-400 border border-primary-500/40 shadow-glow-primary-sm',
        ],
        'glow-success': [
          'bg-success-500/15 text-success-400 border border-success-500/40 shadow-glow-success',
        ],
      },

      size: {
        xs: 'h-5 px-1.5 text-[9px]',
        sm: 'h-6 px-2   text-[10px]',
        md: 'h-7 px-2.5 text-xs',
        lg: 'h-8 px-3   text-sm',
      },

      shape: {
        rounded: '',
        pill:    '',
        square:  '',
      },
    },

    defaultVariants: {
      variant: 'default',
      size:    'sm',
      shape:   'pill',
    },
  }
)

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional icon to display before text */
  icon?: React.ReactNode
  /** Pulsing animation for live status */
  pulse?: boolean
  /** Dot indicator before text */
  dot?: boolean
  /** Dot color (for status indicators) */
  dotColor?: 'success' | 'warning' | 'danger' | 'primary' | 'accent'
}

// ==========================================
// BADGE COMPONENT
// ==========================================

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      icon,
      pulse = false,
      dot = false,
      dotColor,
      children,
      ...props
    },
    ref
  ) => {
    // Dot color classes
    const dotColorClasses = {
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      danger: 'bg-danger-500',
      primary: 'bg-primary-500',
      accent: 'bg-accent-500',
    }

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, shape }),
          'gap-1.5',
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative flex h-2 w-2">
            {pulse && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                  dotColor ? dotColorClasses[dotColor] : 'bg-current'
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                dotColor ? dotColorClasses[dotColor] : 'bg-current'
              )}
            />
          </span>
        )}

        {/* Icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Text content */}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
export default Badge