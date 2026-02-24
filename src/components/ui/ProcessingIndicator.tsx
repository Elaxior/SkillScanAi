/**
 * Processing Indicator Component
 * 
 * Shows processing status with time and progress.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress?: number; // 0-100
  stage?: string;
  startTime?: number;
}

export function ProcessingIndicator({
  isProcessing,
  progress = 0,
  stage = 'Processing',
  startTime,
}: ProcessingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  
  // Update elapsed time
  useEffect(() => {
    if (!isProcessing || !startTime) {
      setElapsed(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);
    
    return () => clearInterval(interval);
  }, [isProcessing, startTime]);
  
  if (!isProcessing) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl p-4 shadow-xl min-w-[240px]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {/* Spinner */}
          <div className="relative w-8 h-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full"
            />
          </div>
          
          {/* Stage */}
          <div>
            <p className="text-white font-medium text-sm">{stage}</p>
            <p className="text-xs text-gray-400">
              {elapsed.toFixed(1)}s elapsed
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            />
          </div>
        )}
        
        {/* AI Badge */}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-green-400 text-xs">⚡</span>
          <span className="text-xs text-gray-500">
            Powered by AI Pose Analysis
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Processing time display after completion
 */
export function ProcessingComplete({
  timeMs,
  frameCount,
}: {
  timeMs: number;
  frameCount: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      <span className="text-green-400">✓</span>
      <span>
        Processed {frameCount} frames in {(timeMs / 1000).toFixed(1)}s
      </span>
    </div>
  );
}