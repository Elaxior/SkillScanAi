/**
 * Improvement & Progress Calculation Utilities
 * 
 * Functions for calculating progress metrics and trends.
 * 
 * Why relative growth is better than absolute:
 * - "Improved 10 points" means different things at different levels
 * - Going from 50 to 60 (20% improvement) is harder than 80 to 90 (12.5%)
 * - Percentages are more universally understood
 * - Easier to compare across different metrics
 */

import type { SessionDisplay, ProgressStats, ChartDataPoint } from './types';

// ============================================================================
// IMPROVEMENT CALCULATIONS
// ============================================================================

/**
 * Calculate percentage improvement between two scores
 * 
 * @param currentScore - The current/latest score
 * @param previousScore - The previous/baseline score
 * @returns Improvement percentage (can be negative)
 */
export function calculateImprovementPercentage(
  currentScore: number,
  previousScore: number
): number {
  // Handle edge cases
  if (previousScore === 0) {
    // Can't calculate percentage from zero
    // Return current score as "infinite improvement" proxy
    return currentScore > 0 ? 100 : 0;
  }
  
  const improvement = ((currentScore - previousScore) / previousScore) * 100;
  
  // Round to 1 decimal place
  return Math.round(improvement * 10) / 10;
}

/**
 * Calculate absolute improvement between scores
 */
export function calculateAbsoluteImprovement(
  currentScore: number,
  previousScore: number
): number {
  return Math.round(currentScore - previousScore);
}

/**
 * Determine the trend direction
 */
export function determineTrend(
  sessions: SessionDisplay[],
  windowSize: number = 3
): 'improving' | 'declining' | 'stable' {
  if (sessions.length < 2) {
    return 'stable';
  }
  
  // Get recent scores (already sorted by date desc)
  const recentScores = sessions.slice(0, windowSize).map((s) => s.score);
  const olderScores = sessions.slice(windowSize, windowSize * 2).map((s) => s.score);
  
  if (olderScores.length === 0) {
    // Not enough data for comparison
    return 'stable';
  }
  
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
  
  const difference = recentAvg - olderAvg;
  
  // Use threshold to avoid noise
  if (difference > 3) return 'improving';
  if (difference < -3) return 'declining';
  return 'stable';
}

// ============================================================================
// PROGRESS STATISTICS
// ============================================================================

/**
 * Calculate comprehensive progress statistics
 * 
 * @param sessions - Array of sessions (sorted by date desc)
 * @returns Progress statistics object
 */
export function calculateProgressStats(
  sessions: SessionDisplay[]
): ProgressStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: 0,
      overallImprovement: 0,
      weeklyImprovement: 0,
      trend: 'stable',
      sessionsThisWeek: 0,
    };
  }
  
  // Basic stats
  const scores = sessions.map((s) => s.score);
  const totalSessions = sessions.length;
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalSessions);
  const bestScore = Math.max(...scores);
  const latestScore = sessions[0].score; // Assuming sorted desc
  
  // First session score (oldest)
  const firstScore = sessions[sessions.length - 1].score;
  
  // Overall improvement (first to latest)
  const overallImprovement = calculateImprovementPercentage(latestScore, firstScore);
  
  // Weekly stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const thisWeekSessions = sessions.filter((s) => s.createdAt >= oneWeekAgo);
  const lastWeekSessions = sessions.filter((s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return s.createdAt < oneWeekAgo && s.createdAt >= twoWeeksAgo;
  });
  
  let weeklyImprovement = 0;
  if (thisWeekSessions.length > 0 && lastWeekSessions.length > 0) {
    const thisWeekAvg = thisWeekSessions.reduce((a, s) => a + s.score, 0) / thisWeekSessions.length;
    const lastWeekAvg = lastWeekSessions.reduce((a, s) => a + s.score, 0) / lastWeekSessions.length;
    weeklyImprovement = calculateImprovementPercentage(thisWeekAvg, lastWeekAvg);
  }
  
  // Determine trend
  const trend = determineTrend(sessions);
  
  return {
    totalSessions,
    averageScore: Math.round(averageScore),
    bestScore,
    latestScore,
    overallImprovement,
    weeklyImprovement,
    trend,
    sessionsThisWeek: thisWeekSessions.length,
  };
}

// ============================================================================
// CHART DATA
// ============================================================================

/**
 * Convert sessions to chart data points
 * 
 * @param sessions - Sessions to convert (sorted by date desc)
 * @returns Array of chart data points (sorted by date asc for chart)
 */
export function sessionsToChartData(
  sessions: SessionDisplay[]
): ChartDataPoint[] {
  // Reverse to get chronological order (oldest first)
  return sessions
    .slice()
    .reverse()
    .map((session) => ({
      date: formatChartDate(session.createdAt),
      score: session.score,
      sessionId: session.id,
    }));
}

/**
 * Format date for chart display
 */
export function formatChartDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Format relative time for display
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get improvement message based on percentage
 */
export function getImprovementMessage(improvement: number): string {
  if (improvement > 20) {
    return 'Outstanding progress! 🚀';
  } else if (improvement > 10) {
    return 'Great improvement! 📈';
  } else if (improvement > 5) {
    return 'Good progress! 👍';
  } else if (improvement > 0) {
    return 'Slight improvement 📊';
  } else if (improvement === 0) {
    return 'Maintaining level ➡️';
  } else if (improvement > -5) {
    return 'Slight dip 📉';
  } else {
    return 'Room for improvement 💪';
  }
}

/**
 * Get trend icon
 */
export function getTrendIcon(trend: ProgressStats['trend']): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'declining':
      return '📉';
    case 'stable':
      return '➡️';
  }
}

/**
 * Get trend color class
 */
export function getTrendColor(trend: ProgressStats['trend']): string {
  switch (trend) {
    case 'improving':
      return 'text-green-400';
    case 'declining':
      return 'text-red-400';
    case 'stable':
      return 'text-yellow-400';
  }
}