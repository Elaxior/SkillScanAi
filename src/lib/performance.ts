/**
 * Performance Optimization Utilities
 * 
 * Functions and patterns for optimizing React rendering
 * and processing performance.
 * 
 * Why React re-renders slow video processing:
 * - Each state update triggers reconciliation
 * - Heavy calculations block the main thread
 * - Unnecessary renders waste CPU cycles
 * - Canvas operations are expensive to repeat
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum frames to process (prevents infinite loops)
 */
export const MAX_FRAME_COUNT = 300;

/**
 * Maximum processing time in milliseconds
 * Pose detection on a 5-10s video takes ~25-60s, so allow 3 minutes
 */
export const MAX_PROCESSING_TIME_MS = 180000;

/**
 * Target FPS for processing
 */
export const TARGET_PROCESS_FPS = 15;

// ============================================================================
// DEBOUNCING
// ============================================================================

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

// ============================================================================
// THROTTLING
// ============================================================================

/**
 * Throttle function calls to max once per interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRan = useRef(Date.now());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [limit]
  );
}

// ============================================================================
// ANIMATION FRAME MANAGEMENT
// ============================================================================

/**
 * Safe requestAnimationFrame hook with cleanup
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList = []
): void {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
}

/**
 * Controlled animation frame that can be stopped
 */
export function useControllableAnimationFrame() {
  const requestRef = useRef<number | null>(null);
  const isRunning = useRef(false);

  const start = useCallback((callback: () => void) => {
    if (isRunning.current) return;

    isRunning.current = true;

    const animate = () => {
      if (!isRunning.current) return;
      callback();
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const stop = useCallback(() => {
    isRunning.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, isRunning: () => isRunning.current };
}

// ============================================================================
// OBJECT URL MANAGEMENT
// ============================================================================

/**
 * Hook for managing object URLs with proper cleanup
 */
export function useObjectUrl(blob: Blob | null): string | null {
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    // Revoke previous URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    // Create new URL
    if (blob) {
      urlRef.current = URL.createObjectURL(blob);
    }

    // Cleanup on unmount
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [blob]);

  return urlRef.current;
}

// ============================================================================
// PROCESSING OPTIMIZATION
// ============================================================================

/**
 * Batch frame processing with progress callback
 */
export async function processFramesBatched<T>(
  frames: T[],
  processor: (frame: T, index: number) => Promise<unknown>,
  options: {
    batchSize?: number;
    onProgress?: (progress: number) => void;
    maxTime?: number;
    onTimeout?: () => void;
  } = {}
): Promise<void> {
  const {
    batchSize = 10,
    onProgress,
    maxTime = MAX_PROCESSING_TIME_MS,
    onTimeout,
  } = options;

  const startTime = Date.now();
  const total = Math.min(frames.length, MAX_FRAME_COUNT);

  for (let i = 0; i < total; i += batchSize) {
    // Check timeout
    if (Date.now() - startTime > maxTime) {
      console.warn('[Performance] Processing timeout reached');
      onTimeout?.();
      break;
    }

    // Process batch
    const batch = frames.slice(i, Math.min(i + batchSize, total));
    await Promise.all(
      batch.map((frame, idx) => processor(frame, i + idx))
    );

    // Report progress
    const progress = Math.min((i + batchSize) / total, 1);
    onProgress?.(progress);

    // Yield to main thread
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/**
 * Skip frames for faster processing
 */
export function sampleFrames<T>(
  frames: T[],
  targetCount: number = 100
): T[] {
  if (frames.length <= targetCount) {
    return frames;
  }

  const step = frames.length / targetCount;
  const sampled: T[] = [];

  for (let i = 0; i < frames.length; i += step) {
    sampled.push(frames[Math.floor(i)]);
  }

  return sampled;
}

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

/**
 * Clear large arrays to free memory
 */
export function clearArrayMemory<T>(arr: T[]): void {
  arr.length = 0;
}

/**
 * Check estimated memory usage
 */
export function estimateMemoryUsage(obj: unknown): number {
  const str = JSON.stringify(obj);
  // Rough estimate: 2 bytes per character in JavaScript string
  return str.length * 2;
}

/**
 * Log memory warning if usage is high
 */
export function checkMemoryUsage(): void {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
    const usagePercent = (usedMB / limitMB) * 100;

    if (usagePercent > 80) {
      console.warn(`[Performance] High memory usage: ${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB (${usagePercent.toFixed(0)}%)`);
    }
  }
}

// ============================================================================
// TIMING UTILITIES
// ============================================================================

/**
 * Measure execution time
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; timeMs: number }> {
  const start = performance.now();
  const result = await fn();
  const timeMs = performance.now() - start;

  console.log(`[Performance] ${label}: ${timeMs.toFixed(2)}ms`);

  return { result, timeMs };
}

/**
 * Create a timer for measuring durations
 */
export function createTimer() {
  const start = performance.now();

  return {
    elapsed: () => performance.now() - start,
    elapsedSeconds: () => (performance.now() - start) / 1000,
    log: (label: string) => {
      console.log(`[Timer] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    },
  };
}

// Need to import useState
import { useState } from 'react';