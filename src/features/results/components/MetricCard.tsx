/**
 * Metric Card Component
 * 
 * Individual metric display with glassmorphism styling,
 * hover effects, and animated entrance.
 */

'use client';

import { motion } from 'framer-motion';
import type { MetricDisplayConfig } from '../types';

interface MetricCardProps {
  config: MetricDisplayConfig;
  value: number | null;
  index: number;
}

/**
 * Format metric value based on configuration
 */
function formatValue(
  value: number | null,
  format: MetricDisplayConfig['format']
): string {
  if (value === null) return '—';

  switch (format) {
    case 'percentage':
      return `${(value * 100).toFixed(0)}`;
    case 'decimal':
      return value.toFixed(2);
    case 'integer':
    default:
      return Math.round(value).toString();
  }
}

/**
 * Get status dot color based on how close to ideal
 */
function getStatusColor(
  value: number | null,
  config: MetricDisplayConfig
): string {
  if (value === null) return 'bg-gray-600';

  const normalizedValue = config.format === 'percentage' ? value * 100 : value;
  const [idealMin, idealMax] = config.idealRange;

  if (normalizedValue >= idealMin && normalizedValue <= idealMax) {
    return 'bg-green-400';
  }

  const rangeMid = (idealMin + idealMax) / 2;
  const rangeSpan = idealMax - idealMin;
  const deviation = Math.abs(normalizedValue - rangeMid);

  if (deviation <= rangeSpan) return 'bg-yellow-400';
  return 'bg-orange-400';
}

export function MetricCard({ config, value, index }: MetricCardProps) {
  const formattedValue = formatValue(value, config.format);
  const statusDot = getStatusColor(value, config);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 * index, ease: 'easeOut' }}
      className="group"
    >
      <div className="rounded-xl bg-[#111418] border border-white/[0.07] p-4 transition-colors duration-200 hover:border-white/[0.12]">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-black tracking-widest text-gray-500 uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {config.label}
          </span>
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <motion.span
            key={formattedValue}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black text-[#F59E0B]"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {formattedValue}
          </motion.span>
          <span className="text-xs text-gray-600">{config.unit}</span>
        </div>

        {/* Ideal range */}
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[10px] text-gray-600 tracking-wider uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Ideal</span>
          <span className="text-[10px] text-gray-500">
            {config.format === 'percentage'
              ? `${config.idealRange[0]}–${config.idealRange[1]}%`
              : `${config.idealRange[0]}–${config.idealRange[1]}${config.unit}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}