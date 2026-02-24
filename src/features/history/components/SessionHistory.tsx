/**
 * Session History Component
 * 
 * Displays a list of recent sessions with scores and dates.
 */

'use client';

import { motion } from 'framer-motion';
import type { SessionDisplay } from '../types';
import { formatRelativeTime } from '../improvementUtils';

interface SessionHistoryProps {
  sessions: SessionDisplay[];
  maxDisplay?: number;
  onSessionClick?: (sessionId: string) => void;
}

/**
 * Get score color based on value
 */
function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get action display name
 */
function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SessionHistory({
  sessions,
  maxDisplay = 5,
  onSessionClick,
}: SessionHistoryProps) {
  const displaySessions = sessions.slice(0, maxDisplay);
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <span className="text-3xl mb-2 block">📝</span>
        <p>No sessions recorded yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Complete your first analysis to start tracking
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {displaySessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          onClick={() => onSessionClick?.(session.id)}
          className={`
            flex items-center justify-between p-3 rounded-lg
            bg-gray-800/50 border border-gray-700/50
            ${onSessionClick ? 'cursor-pointer hover:bg-gray-800 hover:border-gray-600' : ''}
            transition-all duration-200
          `}
        >
          {/* Left: Info */}
          <div className="flex items-center gap-3">
            {/* Sport Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              {session.sport === 'basketball' && '🏀'}
              {session.sport === 'volleyball' && '🏐'}
              {session.sport === 'badminton' && '🏸'}
              {session.sport === 'cricket' && '🏏'}
              {session.sport === 'table_tennis' && '🏓'}
            </div>
            
            {/* Details */}
            <div>
              <p className="text-white font-medium">
                {formatAction(session.action)}
              </p>
              <p className="text-xs text-gray-400">
                {formatRelativeTime(session.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Right: Score */}
          <div className="flex items-center gap-3">
            {/* Injury Risk Warning */}
            {session.hasInjuryRisk && (
              <span className="text-red-400" title="Injury risk detected">
                ⚠️
              </span>
            )}
            
            {/* Flaw Count */}
            {session.flawCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-700 text-xs text-gray-400">
                {session.flawCount} flaw{session.flawCount !== 1 ? 's' : ''}
              </span>
            )}
            
            {/* Score */}
            <span className={`text-2xl font-bold ${getScoreColor(session.score)}`}>
              {session.score}
            </span>
          </div>
        </motion.div>
      ))}
      
      {/* Show More */}
      {sessions.length > maxDisplay && (
        <p className="text-center text-sm text-gray-500 pt-2">
          +{sessions.length - maxDisplay} more sessions
        </p>
      )}
    </div>
  );
}