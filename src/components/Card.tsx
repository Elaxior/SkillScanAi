import React from 'react'

// Padding options
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

// Card props interface
interface CardProps {
  /** Card contents */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Internal padding size */
  padding?: CardPadding
  /** Whether the card is interactive (shows hover effect) */
  interactive?: boolean
  /** Click handler for interactive cards */
  onClick?: () => void
}

/**
 * Container component for grouping related content
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  onClick,
}: CardProps) {
  // Padding styles mapping
  const paddingStyles: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  // Base styles
  const baseStyles = 'bg-white rounded-xl shadow-sm border border-gray-200'

  // Interactive styles
  const interactiveStyles = interactive
    ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200'
    : ''

  // Combine styles
  const combinedStyles = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${interactiveStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Use button if interactive for accessibility
  if (interactive && onClick) {
    return (
      <div
        className={combinedStyles}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={combinedStyles}>
      {children}
    </div>
  )
}