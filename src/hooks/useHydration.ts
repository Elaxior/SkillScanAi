/**
 * Hydration Safety Hook
 * 
 * Ensures components don't render until client-side hydration is complete.
 * This prevents mismatches between server-rendered and client-rendered content.
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if component has hydrated
 * 
 * Usage:
 * const isHydrated = useHydration()
 * if (!isHydrated) return <Skeleton />
 * return <ActualContent />
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}

/**
 * Hook for store that needs hydration
 * 
 * Usage:
 * const height = useStoreHydration(useUserStore, (state) => state.height)
 */
export function useStoreHydration<T, U>(
  useStore: (selector: (state: T) => U) => U,
  selector: (state: T) => U,
  fallback: U
): U {
  const [isHydrated, setIsHydrated] = useState(false)
  const storeValue = useStore(selector)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated ? storeValue : fallback
}

export default useHydration