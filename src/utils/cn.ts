import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with Tailwind CSS class conflict resolution.
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // → 'py-1 px-4' (px-4 wins)
 * cn('text-red-500', condition && 'text-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}