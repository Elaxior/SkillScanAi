/**
 * Ghost Toggle Component
 * 
 * Standalone toggle button for enabling/disabling the ghost overlay.
 * Can be used in the results dashboard or video player.
 */

'use client';

import { motion } from 'framer-motion';

interface GhostToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  alignmentScore?: number;
  className?: string;
}

export function GhostToggle({
  enabled,
  onToggle,
  alignmentScore,
  className = '',
}: GhostToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          relative flex items-center gap-3 px-4 py-2.5 rounded-xl
          border transition-all duration-300
          ${enabled
            ? 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30'
            : 'bg-gray-800/80 border-gray-700 hover:border-gray-600'
          }
        `}
      >
        {/* Ghost Icon */}
        <span className="text-lg">👻</span>
        
        {/* Label */}
        <div className="flex flex-col items-start">
          <span className={`text-sm font-medium ${enabled ? 'text-green-400' : 'text-white'}`}>
            Pro Form Overlay
          </span>
          <span className="text-xs text-gray-400">
            {enabled ? 'Comparing with ideal form' : 'Click to compare'}
          </span>
        </div>
        
        {/* Toggle Indicator */}
        <div className={`
          w-10 h-5 rounded-full transition-colors duration-300
          ${enabled ? 'bg-green-500' : 'bg-gray-600'}
        `}>
          <motion.div
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-white shadow-md"
          />
        </div>
      </button>
      
      {/* Alignment Score Badge (when enabled) */}
      {enabled && alignmentScore !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            px-3 py-1.5 rounded-lg border
            ${alignmentScore >= 80
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : alignmentScore >= 60
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
              : 'bg-red-500/20 border-red-500/30 text-red-400'
            }
          `}
        >
          <span className="text-xs font-medium">
            {alignmentScore}% Aligned
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}