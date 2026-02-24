/**
 * Metric Grid Component
 * 
 * Responsive grid layout for displaying all metrics
 * with staggered animation entrance.
 */

'use client';

import { motion } from 'framer-motion';
import { MetricCard } from './MetricCard';
import { getMetricConfigs } from '../constants';

interface MetricGridProps {
  metrics: Record<string, number | null>;
  sport: string;
  action: string;
}

export function MetricGrid({ metrics, sport, action }: MetricGridProps) {
  const metricConfigs = getMetricConfigs(sport, action);

  // Filter to only show metrics that have values
  const availableMetrics = metricConfigs.filter(
    (config) => metrics[config.key] !== undefined
  );

  if (availableMetrics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No metrics available for this analysis.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-0.5 h-5 bg-[#F59E0B] rounded-full" />
        <h2
          className="text-sm font-black tracking-widest text-white uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}
        >
          Performance Metrics
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {availableMetrics.map((config, index) => (
          <MetricCard
            key={config.key}
            config={config}
            value={metrics[config.key]}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}