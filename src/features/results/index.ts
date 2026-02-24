/**
 * Results Feature Module Exports
 */

export { ResultsDashboard } from './ResultsDashboard';
export { ScoreSection } from './components/ScoreSection';
export { MetricGrid } from './components/MetricGrid';
export { MetricCard } from './components/MetricCard';
export { ComparisonBar } from './components/ComparisonBar';
export { ComparisonSection } from './components/ComparisonSection';
export { FlawList } from './components/FlawList';
export { FlawCard } from './components/FlawCard';

export type {
  MetricDisplayConfig,
  ComparisonData,
  ScoreDisplayData,
  ResultsDashboardProps,
} from './types';

export {
  getMetricConfigs,
  getGradeFromScore,
  getPerformanceLevel,
  BASKETBALL_JUMPSHOT_METRICS,
  GRADE_THRESHOLDS,
  PERFORMANCE_LEVELS,
} from './constants';