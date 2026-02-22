'use client'

import React from 'react'
import { cn } from '@/utils/cn'

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface GridContainerProps {
  /** Grid contents */
  children: React.ReactNode
  /** Number of columns on different breakpoints */
  cols?: {
    default?: 1 | 2 | 3 | 4 | 5 | 6
    sm?: 1 | 2 | 3 | 4 | 5 | 6
    md?: 1 | 2 | 3 | 4 | 5 | 6
    lg?: 1 | 2 | 3 | 4 | 5 | 6
    xl?: 1 | 2 | 3 | 4 | 5 | 6
  }
  /** Gap between items */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Additional class names */
  className?: string
  /** As element */
  as?: 'div' | 'ul' | 'section'
}

// ==========================================
// CONFIGURATION
// ==========================================

const colsConfig = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

const smColsConfig = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
}

const mdColsConfig = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
}

const lgColsConfig = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

const xlColsConfig = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
}

const gapConfig = {
  none: 'gap-0',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10',
}

// ==========================================
// GRID CONTAINER COMPONENT
// ==========================================

const GridContainer: React.FC<GridContainerProps> = ({
  children,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
  className,
  as: Component = 'div',
}) => {
  return (
    <Component
      className={cn(
        'grid',
        cols.default && colsConfig[cols.default],
        cols.sm && smColsConfig[cols.sm],
        cols.md && mdColsConfig[cols.md],
        cols.lg && lgColsConfig[cols.lg],
        cols.xl && xlColsConfig[cols.xl],
        gapConfig[gap],
        className
      )}
    >
      {children}
    </Component>
  )
}

GridContainer.displayName = 'GridContainer'

export { GridContainer }
export default GridContainer