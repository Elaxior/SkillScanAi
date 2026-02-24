/**
 * Demo Banner Component
 * 
 * Displays a banner when demo mode is active, with options
 * to load demo data or exit demo mode.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { useDemoMode } from './useDemoMode';

interface DemoBannerProps {
  className?: string;
  showLoadButton?: boolean;
  onLoadDemo?: () => void;
}

export function DemoBanner({
  className = '',
  showLoadButton = true,
  onLoadDemo,
}: DemoBannerProps) {
  const { demoMode, setDemoMode, loadDemoData, isDemoSession } = useDemoMode();
  
  const handleLoadDemo = () => {
    loadDemoData();
    onLoadDemo?.();
  };
  
  if (!demoMode) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`
          relative overflow-hidden rounded-lg
          bg-gradient-to-r from-purple-500/20 to-pink-500/20
          border border-purple-500/30
          p-4 ${className}
        `}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none" />
        
        <div className="relative flex items-center justify-between gap-4">
          {/* Left: Info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="font-medium text-white">
                Demo Mode {isDemoSession ? '- Viewing Sample Results' : 'Active'}
              </p>
              <p className="text-sm text-gray-400">
                {isDemoSession
                  ? 'This is precomputed demo data for demonstration purposes.'
                  : 'Using precomputed data instead of live AI processing.'}
              </p>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {showLoadButton && !isDemoSession && (
              <Button
                size="sm"
                onClick={handleLoadDemo}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Load Demo
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDemoMode(false)}
              className="text-gray-400 hover:text-white"
            >
              Exit Demo
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Demo Mode Toggle for Settings/Debug
 */
export function DemoModeToggle() {
  const { demoMode, setDemoMode } = useDemoMode();
  
  return (
    <button
      onClick={() => setDemoMode(!demoMode)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        border transition-all
        ${demoMode
          ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}
      `}
    >
      <span>{demoMode ? '🎬' : '🔬'}</span>
      <span className="text-sm font-medium">
        {demoMode ? 'Demo Mode ON' : 'Demo Mode OFF'}
      </span>
      
      {/* Toggle Switch */}
      <div className={`
        w-8 h-4 rounded-full transition-colors
        ${demoMode ? 'bg-purple-500' : 'bg-gray-600'}
      `}>
        <motion.div
          animate={{ x: demoMode ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-4 h-4 rounded-full bg-white shadow"
        />
      </div>
    </button>
  );
}