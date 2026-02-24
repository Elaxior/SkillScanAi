/**
 * Improvement Badge Component
 * 
 * Displays improvement percentage with visual styling.
 */

'use client';

import { motion } from 'framer-motion';
import { getImprovementMessage } from '../improvementUtils';

interface ImprovementBadgeProps {
  improvement: number;
  period?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ImprovementBadge({
  improvement,
  period = 'overall',
  size = 'md',
}: ImprovementBadgeProps) {
  const isPositive = improvement > 0;
  const isNegative = improvement < 0;
  const isNeutral = improvement === 0;
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };
  
  const colorClasses = isPositive
    ? 'bg-green-500/20 border-green-500/30 text-green-400'
    : isNegative
    ? 'bg-red-500/20 border-red-500/30 text-red-400'
    : 'bg-gray-500/20 border-gray-500/30 text-gray-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${sizeClasses[size]}
        ${colorClasses}
      `}
    >
      {/* Arrow Icon */}
      <span>
        {isPositive && '↑'}
        {isNegative && '↓'}
        {isNeutral && '→'}
      </span>
      
      {/* Percentage */}
      <span className="font-bold">
        {isPositive && '+'}
        {improvement}%
      </span>
      
      {/* Period */}
      <span className="text-gray-500 text-xs">
        {period}
      </span>
    </motion.div>
  );
}

/**
 * Improvement Summary Component
 */
interface ImprovementSummaryProps {
  weeklyImprovement: number;
  sessionsThisWeek: number;
}

export function ImprovementSummary({
  weeklyImprovement,
  sessionsThisWeek,
}: ImprovementSummaryProps) {
  const message = getImprovementMessage(weeklyImprovement);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">{message}</p>
          <p className="text-sm text-gray-400 mt-1">
            {sessionsThisWeek} session{sessionsThisWeek !== 1 ? 's' : ''} this week
          </p>
        </div>
        
        <ImprovementBadge
          improvement={weeklyImprovement}
          period="7 days"
          size="lg"
        />
      </div>
    </motion.div>
  );
}