import React from 'react'

// Container max width options
type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

// Props interface
interface ScreenContainerProps {
  /** Container contents */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Maximum width of the container */
  size?: ContainerSize
  /** Whether to add vertical padding */
  verticalPadding?: boolean
  /** Whether to center content vertically */
  centerVertically?: boolean
}

/**
 * Responsive container component for page content
 * Provides consistent horizontal padding and max-width across screens
 */
export default function ScreenContainer({
  children,
  className = '',
  size = 'xl',
  verticalPadding = true,
  centerVertically = false,
}: ScreenContainerProps) {
  // Max width styles mapping
  const maxWidthStyles: Record<ContainerSize, string> = {
    sm: 'max-w-2xl',      // 672px
    md: 'max-w-4xl',      // 896px
    lg: 'max-w-5xl',      // 1024px
    xl: 'max-w-7xl',      // 1280px
    full: 'max-w-full',   // 100%
  }

  // Vertical padding styles
  const verticalPaddingStyles = verticalPadding ? 'py-8 sm:py-12' : ''

  // Center vertically styles
  const centerVerticallyStyles = centerVertically
    ? 'min-h-[calc(100vh-4rem)] flex flex-col justify-center'
    : ''

  // Combine styles
  const combinedStyles = `
    mx-auto
    px-4 sm:px-6 lg:px-8
    ${maxWidthStyles[size]}
    ${verticalPaddingStyles}
    ${centerVerticallyStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={combinedStyles}>
      {children}
    </div>
  )
}