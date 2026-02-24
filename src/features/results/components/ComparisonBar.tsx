/**
 * Comparison Bar Component
 * 
 * Visual comparison of user value against amateur average
 * and professional range with animated markers.
 */

'use client';

import { motion } from 'framer-motion';
import type { ComparisonData } from '../types';

interface ComparisonBarProps {
  data: ComparisonData;
  index: number;
}

/**
 * Calculate position percentage on the bar
 */
function getPositionPercent(
  value: number,
  min: number,
  max: number
): number {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, percent));
}

export function ComparisonBar({ data, index }: ComparisonBarProps) {
  const {
    label,
    userValue,
    amateurValue,
    proRange,
    minValue,
    maxValue,
    unit,
  } = data;
  
  const userPosition = getPositionPercent(userValue, minValue, maxValue);
  const amateurPosition = getPositionPercent(amateurValue, minValue, maxValue);
  const proStartPosition = getPositionPercent(proRange[0], minValue, maxValue);
  const proEndPosition = getPositionPercent(proRange[1], minValue, maxValue);
  const proWidth = proEndPosition - proStartPosition;
  
  // Determine user value color
  const isInProRange = userValue >= proRange[0] && userValue <= proRange[1];
  const isBetterThanAmateur = userValue > amateurValue;
  
  let userColor = 'bg-yellow-500';
  if (isInProRange) {
    userColor = 'bg-green-500';
  } else if (isBetterThanAmateur) {
    userColor = 'bg-blue-500';
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="mb-4 last:mb-0"
    >
      {/* Label Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">
          {label}
        </span>
        <span className="text-sm font-mono text-white">
          {Math.round(userValue)}{unit}
        </span>
      </div>
      
      {/* Bar Container */}
      <div className="relative h-8 bg-gray-800/80 rounded-lg overflow-hidden">
        {/* Pro Range Zone */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${proWidth}%` }}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          className="absolute top-0 bottom-0 bg-green-500/20 border-l border-r border-green-500/40"
          style={{ left: `${proStartPosition}%` }}
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-green-400 font-medium whitespace-nowrap">
            PRO
          </span>
        </motion.div>
        
        {/* Amateur Marker */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
          className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
          style={{ left: `${amateurPosition}%` }}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap">
            Avg
          </span>
        </motion.div>
        
        {/* User Marker */}
        <motion.div
          initial={{ left: '0%' }}
          animate={{ left: `${userPosition}%` }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3 + index * 0.1,
            type: 'spring',
            stiffness: 80
          }}
          className={`absolute top-0 bottom-0 w-1 ${userColor} shadow-lg`}
          style={{ 
            boxShadow: isInProRange 
              ? '0 0 10px rgba(34, 197, 94, 0.5)' 
              : '0 0 10px rgba(234, 179, 8, 0.3)' 
          }}
        >
          {/* User Value Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap ${userColor}`}
          >
            YOU
          </motion.div>
        </motion.div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
        <span>{minValue}{unit}</span>
        <span>{maxValue}{unit}</span>
      </div>
    </motion.div>
  );
}