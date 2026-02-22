'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// ==========================================
// CARD VARIANTS CONFIGURATION
// ==========================================

const cardVariants = cva(
  // Base styles — sharp, military
  [
    'transition-all duration-200 ease-out',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface',
          'border border-surface-border',
          'shadow-card',
        ],
        glass: [
          'bg-white/[0.04]',
          'backdrop-blur-md',
          'border border-white/[0.08]',
        ],
        gradient: [
          'bg-gradient-to-br from-surface-light to-surface',
          'border border-surface-border',
          'shadow-card',
        ],
        elevated: [
          'bg-surface-light',
          'border border-surface-border-light',
          'shadow-dark-lg',
        ],
        outline: [
          'bg-transparent',
          'border border-surface-border',
        ],
        glow: [
          'bg-surface',
          'border border-primary-500/40',
          'shadow-glow-primary-sm',
        ],
      },

      padding: {
        none: 'p-0',
        sm:   'p-4',
        md:   'p-6',
        lg:   'p-8',
      },

      hover: {
        none:   '',
        lift:   'hover:-translate-y-0.5 hover:shadow-card-hover',
        glow:   'hover:shadow-glow-primary hover:border-primary-500/60',
        border: 'hover:border-primary-500/50',
        scale:  'hover:scale-[1.01]',
      },

      interactive: {
        true:  'cursor-pointer',
        false: '',
      },
    },

    defaultVariants: {
      variant:     'default',
      padding:     'md',
      hover:       'none',
      interactive: false,
    },
  }
)

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Card header content */
  header?: React.ReactNode
  /** Card footer content */
  footer?: React.ReactNode
  /** Renders as different element */
  as?: React.ElementType
}

// ==========================================
// CARD COMPONENT
// ==========================================

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      interactive,
      header,
      footer,
      children,
      as: Component = 'div',
      onClick,
      ...props
    },
    ref
  ) => {
    // Determine if card should be interactive
    const isInteractive = interactive || !!onClick

    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({
            variant,
            padding: header || footer ? 'none' : padding,
            hover,
            interactive: isInteractive,
          }),
          className
        )}
        onClick={onClick}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={
          isInteractive
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
                }
              }
            : undefined
        }
        {...props}
      >
        {/* Card Header */}
        {header && (
          <div className="px-6 py-4 border-b border-surface-border">
            {header}
          </div>
        )}

        {/* Card Body */}
        <div className={header || footer ? 'p-6' : undefined}>
          {children}
        </div>

        {/* Card Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-surface-border bg-surface-light/50">
            {footer}
          </div>
        )}
      </Component>
    )
  }
)

Card.displayName = 'Card'

// ==========================================
// CARD SUB-COMPONENTS
// ==========================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-bold uppercase tracking-wide text-text-primary', className)}
    style={{ fontFamily: 'Barlow Condensed, Space Grotesk, sans-serif' }}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}

export default Card