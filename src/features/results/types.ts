/**
 * Results Dashboard Type Definitions
 */

import type { DetectedFlaw } from '@/features/flaws';

/**
 * Metric display configuration
 */
export interface MetricDisplayConfig {
  key: string;
  label: string;
  unit: string;
  icon: string;
  description: string;
  idealRange: [number, number];
  amateurAverage: number;
  proRange: [number, number];
  format: 'decimal' | 'integer' | 'percentage';
  higherIsBetter: boolean;
}

/**
 * Comparison bar data
 */
export interface ComparisonData {
  metricKey: string;
  label: string;
  userValue: number;
  amateurValue: number;
  proRange: [number, number];
  minValue: number;
  maxValue: number;
  unit: string;
  higherIsBetter: boolean;
}

/**
 * Score display data
 */
export interface ScoreDisplayData {
  overall: number;
  grade: string;
  level: string;
  confidence: number;
}

/**
 * Dashboard props
 */
export interface ResultsDashboardProps {
  score: number | null;
  scoreBreakdown: Record<string, number>;
  metrics: Record<string, number | null>;
  flaws: DetectedFlaw[];
  confidence?: number;
  sport: string;
  action: string;
}