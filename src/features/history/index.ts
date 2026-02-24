/**
 * History Feature Module Exports
 */

// Components
export { ProgressChart } from './components/ProgressChart';
export { SessionHistory } from './components/SessionHistory';
export { ImprovementBadge, ImprovementSummary } from './components/ImprovementBadge';

// Hooks
export { useSessionHistory } from './hooks/useSessionHistory';

// Functions
export { saveSession, prepareSessionData } from './saveSession';
export { fetchUserSessions, fetchSessionsBySport, fetchRecentSessions } from './fetchSessions';
export {
  calculateImprovementPercentage,
  calculateAbsoluteImprovement,
  calculateProgressStats,
  sessionsToChartData,
  determineTrend,
  getImprovementMessage,
  getTrendIcon,
  getTrendColor,
  formatRelativeTime,
  formatChartDate,
} from './improvementUtils';

// Types
export type {
  SessionData,
  SessionDocument,
  SessionDisplay,
  ProgressStats,
  ChartDataPoint,
} from './types';