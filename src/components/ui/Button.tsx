'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// ==========================================
// BUTTON VARIANTS CONFIGURATION
// ==========================================

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center',
    'font-bold uppercase tracking-[0.12em]',
    'transition-all duration-150 ease-out',
    'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'disabled:opacity-40 disabled:pointer-events-none',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        // Gold filled — main CTA
        primary: [
          'bg-primary-500 text-black',
          'hover:bg-primary-400',
          'shadow-md hover:shadow-glow-gold-sm',
          'focus-visible:ring-primary-500',
        ],
        // Dark with border
        secondary: [
          'bg-surface-light text-text-primary',
          'border border-surface-border-light',
          'hover:bg-surface-lighter hover:border-primary-600/40',
          'focus-visible:ring-primary-500',
        ],
        // Gold outlined
        outline: [
          'bg-transparent text-primary-400',
          'border border-primary-500/60',
          'hover:bg-primary-500/10 hover:border-primary-400 hover:text-primary-300',
          'focus-visible:ring-primary-500',
        ],
        // Minimal ghost
        ghost: [
          'bg-transparent text-text-secondary',
          'hover:bg-surface hover:text-text-primary',
          'focus-visible:ring-primary-500',
        ],
        // Danger
        danger: [
          'bg-danger-600 text-white',
          'hover:bg-danger-500',
          'shadow-md hover:shadow-glow-danger',
          'focus-visible:ring-danger-500',
        ],
        // Success
        success: [
          'bg-success-600 text-white',
          'hover:bg-success-500',
          'shadow-md hover:shadow-glow-success',
          'focus-visible:ring-success-500',
        ],
        // Gold glow — hero CTA
        glow: [
          'bg-primary-500 text-black',
          'shadow-glow-primary hover:shadow-glow-primary-lg',
          'hover:bg-primary-400',
          'focus-visible:ring-primary-500',
        ],
      },

      // SIZE STYLES — sharp (no rounded)
      size: {
        xs:      'h-7  px-3   text-[10px] gap-1',
        sm:      'h-8  px-3.5 text-xs     gap-1.5',
        md:      'h-10 px-5   text-xs     gap-2',
        lg:      'h-12 px-7   text-sm     gap-2',
        xl:      'h-14 px-9   text-base   gap-2.5',
        icon:    'h-10 w-10',
        'icon-sm': 'h-8  w-8',
        'icon-lg': 'h-12 w-12',
      },

      fullWidth: {
        true:  'w-full',
        false: '',
      },
    },

    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

// ==========================================
// COMPONENT TYPES
// ==========================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows loading spinner and disables button */
  isLoading?: boolean
  /** Icon to display before children */
  leftIcon?: React.ReactNode
  /** Icon to display after children */
  rightIcon?: React.ReactNode
  /** Makes button circular (for icons) */
  isRound?: boolean
}

// ==========================================
// LOADING SPINNER COMPONENT
// ==========================================

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

// ==========================================
// BUTTON COMPONENT
// ==========================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      isRound = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          isRound && 'rounded-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner or left icon */}
        {isLoading ? (
          <LoadingSpinner className="h-4 w-4" />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        ) : null}

        {/* Button text */}
        {children}

        {/* Right icon (hidden when loading) */}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button