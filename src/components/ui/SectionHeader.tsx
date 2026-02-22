'use client'

import React from 'react'
import { cn } from '@/utils/cn'

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface SectionHeaderProps {
  /** Main title */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Action element (button, link, etc.) */
  action?: React.ReactNode
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Alignment */
  align?: 'left' | 'center'
  /** Additional class names */
  className?: string
  /** Title class names */
  titleClassName?: string
  /** Subtitle class names */
  subtitleClassName?: string
  /** Show decorative accent line */
  accent?: boolean
  /** Accent color */
  accentColor?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'
  /** Icon before title */
  icon?: React.ReactNode
}

// ==========================================
// SIZE CONFIGURATIONS
// ==========================================

const sizeConfig = {
  sm: {
    title: 'text-lg font-bold uppercase tracking-wider',
    subtitle: 'text-xs',
    gap: 'gap-1',
    iconSize: 'w-5 h-5',
  },
  md: {
    title: 'text-xl font-bold uppercase tracking-wider',
    subtitle: 'text-sm',
    gap: 'gap-1',
    iconSize: 'w-6 h-6',
  },
  lg: {
    title: 'text-2xl font-bold uppercase tracking-wider',
    subtitle: 'text-base',
    gap: 'gap-1.5',
    iconSize: 'w-7 h-7',
  },
}

// Accent color classes
const accentColors = {
  primary: 'bg-primary-500',
  accent:  'bg-accent-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
}

// ==========================================
// SECTION HEADER COMPONENT
// ==========================================

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  size = 'md',
  align = 'left',
  className,
  titleClassName,
  subtitleClassName,
  accent = false,
  accentColor = 'primary',
  icon,
}) => {
  const config = sizeConfig[size]

  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className
      )}
    >
      {/* Accent line */}
      {accent && (
        <div
          className={cn(
            'h-px w-10 mb-3',
            accentColors[accentColor]
          )}
        />
      )}

      {/* Header row with title and action */}
      <div
        className={cn(
          'flex w-full',
          align === 'center'
            ? 'flex-col items-center gap-4'
            : 'flex-row items-start justify-between gap-4'
        )}
      >
        {/* Title section */}
        <div className={cn('flex flex-col', config.gap)}>
          {/* Title with optional icon */}
          <div className="flex items-center gap-2">
            {icon && (
              <span className={cn('text-primary-400', config.iconSize)}>
                {icon}
              </span>
            )}
            <h2
              className={cn(
                config.title,
                'text-text-primary',
                titleClassName
              )}
              style={{ fontFamily: 'Barlow Condensed, Space Grotesk, sans-serif' }}
            >
              {title}
            </h2>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={cn(
                config.subtitle,
                'text-text-secondary',
                subtitleClassName
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

SectionHeader.displayName = 'SectionHeader'

export { SectionHeader }
export default SectionHeader