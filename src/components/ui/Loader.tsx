'use client'

import React from 'react'
import { cn } from '@/utils/cn'

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface LoaderProps {
  /** Size of the loader */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Loader variant */
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring' | 'ai'
  /** Color variant */
  color?: 'primary' | 'accent' | 'white' | 'current'
  /** Additional class names */
  className?: string
  /** Loading text */
  text?: string
  /** Show overlay */
  overlay?: boolean
  /** Center in container */
  center?: boolean
}

// ==========================================
// SIZE CONFIGURATIONS
// ==========================================

const sizeConfig = {
  xs: { spinner: 'w-4 h-4', text: 'text-xs', gap: 'gap-2' },
  sm: { spinner: 'w-6 h-6', text: 'text-sm', gap: 'gap-2' },
  md: { spinner: 'w-8 h-8', text: 'text-base', gap: 'gap-3' },
  lg: { spinner: 'w-12 h-12', text: 'text-lg', gap: 'gap-4' },
  xl: { spinner: 'w-16 h-16', text: 'text-xl', gap: 'gap-4' },
}

const colorConfig = {
  primary: {
    spinner: 'text-primary-500',
    track: 'text-primary-500/20',
    glow: 'shadow-glow-primary',
  },
  accent: {
    spinner: 'text-accent-500',
    track: 'text-accent-500/20',
    glow: 'shadow-glow-accent',
  },
  white: {
    spinner: 'text-white',
    track: 'text-white/20',
    glow: '',
  },
  current: {
    spinner: 'text-current',
    track: 'text-current/20',
    glow: '',
  },
}

// ==========================================
// SPINNER VARIANT
// ==========================================

const SpinnerLoader: React.FC<{ size: string; color: typeof colorConfig.primary }> = ({
  size,
  color,
}) => (
  <svg
    className={cn('animate-spin', size, color.spinner)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className={cn('opacity-25', color.track)}
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-100"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

// ==========================================
// DOTS VARIANT
// ==========================================

const DotsLoader: React.FC<{ size: string; color: typeof colorConfig.primary }> = ({
  size,
  color,
}) => (
  <div className={cn('flex items-center gap-1', size)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full animate-pulse',
          color.spinner.replace('text-', 'bg-')
        )}
        style={{
          animationDelay: `${i * 150}ms`,
          animationDuration: '600ms',
        }}
      />
    ))}
  </div>
)

// ==========================================
// PULSE VARIANT
// ==========================================

const PulseLoader: React.FC<{ size: string; color: typeof colorConfig.primary }> = ({
  size,
  color,
}) => (
  <div className={cn('relative', size)}>
    <div
      className={cn(
        'absolute inset-0 rounded-full animate-ping opacity-75',
        color.spinner.replace('text-', 'bg-')
      )}
    />
    <div
      className={cn(
        'relative rounded-full w-full h-full',
        color.spinner.replace('text-', 'bg-')
      )}
    />
  </div>
)

// ==========================================
// RING VARIANT
// ==========================================

const RingLoader: React.FC<{ size: string; color: typeof colorConfig.primary }> = ({
  size,
  color,
}) => (
  <div className={cn('relative', size)}>
    <div
      className={cn(
        'absolute inset-0 rounded-full border-4 border-t-transparent animate-spin',
        color.spinner.replace('text-', 'border-')
      )}
    />
    <div
      className={cn(
        'absolute inset-2 rounded-full border-4 border-b-transparent animate-spin',
        'animation-direction-reverse',
        color.track.replace('text-', 'border-')
      )}
      style={{ animationDuration: '1.5s' }}
    />
  </div>
)

// ==========================================
// AI VARIANT (Special for AI Analysis)
// ==========================================

const AILoader: React.FC<{ size: string; color: typeof colorConfig.primary }> = ({
  size,
  color,
}) => (
  <div className={cn('relative flex items-center justify-center', size)}>
    {/* Outer ring */}
    <div
      className={cn(
        'absolute inset-0 rounded-full border-2 animate-spin',
        'border-t-transparent border-r-transparent',
        color.spinner.replace('text-', 'border-')
      )}
      style={{ animationDuration: '1s' }}
    />
    {/* Middle ring */}
    <div
      className={cn(
        'absolute inset-2 rounded-full border-2 animate-spin',
        'border-b-transparent border-l-transparent',
        color.spinner.replace('text-', 'border-')
      )}
      style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
    />
    {/* Center pulse */}
    <div
      className={cn(
        'w-3 h-3 rounded-full animate-pulse',
        color.spinner.replace('text-', 'bg-'),
        color.glow
      )}
    />
  </div>
)

// ==========================================
// LOADER COMPONENT
// ==========================================

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className,
  text,
  overlay = false,
  center = false,
}) => {
  const config = sizeConfig[size]
  const colorCfg = colorConfig[color]

  // Render the appropriate loader variant
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader size={config.spinner} color={colorCfg} />
      case 'pulse':
        return <PulseLoader size={config.spinner} color={colorCfg} />
      case 'ring':
        return <RingLoader size={config.spinner} color={colorCfg} />
      case 'ai':
        return <AILoader size={config.spinner} color={colorCfg} />
      default:
        return <SpinnerLoader size={config.spinner} color={colorCfg} />
    }
  }

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        config.gap,
        center && 'absolute inset-0',
        className
      )}
    >
      {renderLoader()}
      {text && (
        <span className={cn('text-text-secondary font-medium', config.text)}>
          {text}
        </span>
      )}
    </div>
  )

  // If overlay, wrap in overlay container
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}

Loader.displayName = 'Loader'

export { Loader }
export default Loader