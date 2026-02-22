/**
 * Store Hydration Provider
 * 
 * Ensures stores are hydrated before rendering children.
 * Prevents hydration mismatches in Next.js.
 */

'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface StoreHydrationProps {
  children: ReactNode
  fallback?: ReactNode
}

export function StoreHydration({ children, fallback = null }: StoreHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default StoreHydration