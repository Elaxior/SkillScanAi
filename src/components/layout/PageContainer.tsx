'use client'

import React from 'react'
import { cn } from '@/utils/cn'

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface PageContainerProps {
  /** Page contents */
  children: React.ReactNode
  /** Maximum width */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Add padding */
  padding?: boolean
  /** Vertical padding size */
  paddingY?: 'none' | 'sm' | 'md' | 'lg'
  /** Center content vertically (for full-page layouts) */
  centerVertically?: boolean
  /** Additional class names */
  className?: string
  /** As element */
  as?: 'div' | 'main' | 'section' | 'article'
}

// ==========================================
// SIZE CONFIGURATIONS
// ==========================================

const maxWidthConfig = {
  sm: 'max-w-2xl',      // 672px
  md: 'max-w-4xl',      // 896px
  lg: 'max-w-5xl',      // 1024px
  xl: 'max-w-6xl',      // 1152px
  '2xl': 'max-w-7xl',   // 1280px
  full: 'max-w-full',
}

const paddingYConfig = {
  none: '',
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-8 lg:py-12',
  lg: 'py-8 sm:py-12 lg:py-16',
}

// ==========================================
// PAGE CONTAINER COMPONENT
// ==========================================

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = '2xl',
  padding = true,
  paddingY = 'md',
  centerVertically = false,
  className,
  as: Component = 'main',
}) => {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        maxWidthConfig[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        paddingYConfig[paddingY],
        centerVertically && 'min-h-[calc(100vh-4rem)] flex flex-col justify-center',
        className
      )}
    >
      {children}
    </Component>
  )
}

PageContainer.displayName = 'PageContainer'

export { PageContainer }
export default PageContainer