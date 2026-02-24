/**
 * Progress Chart Component
 * 
 * Displays a line chart of score progression over time.
 * Uses Recharts for responsive, animated charts.
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ChartDataPoint, ProgressStats } from '../types';
import { getTrendIcon, getTrendColor } from '../improvementUtils';

interface ProgressChartProps {
  data: ChartDataPoint[];
  stats: ProgressStats;
  height?: number;
  showTrendLine?: boolean;
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const score = payload[0].value;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white font-bold text-lg">{score}</p>
      <p className="text-gray-500 text-xs">Score</p>
    </div>
  );
}

export function ProgressChart({
  data,
  stats,
  height = 200,
  showTrendLine = true,
}: ProgressChartProps) {
  // Calculate trend line data
  const trendLineData = useMemo(() => {
    if (!showTrendLine || data.length < 2) return null;

    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.score, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.score, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      startY: intercept,
      endY: slope * (n - 1) + intercept,
    };
  }, [data, showTrendLine]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <span className="text-4xl mb-2">📊</span>
        <p>No session data yet</p>
        <p className="text-sm text-gray-500">Complete a session to see your progress</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Progress Over Time</h3>
          <p className="text-sm text-gray-400">
            {data.length} session{data.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {/* Trend Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 ${getTrendColor(stats.trend)}`}>
          <span>{getTrendIcon(stats.trend)}</span>
          <span className="text-sm font-medium capitalize">
            {stats.trend}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              vertical={false}
            />

            {/* Axes */}
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Reference Lines */}
            <ReferenceLine
              y={stats.averageScore}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{
                value: 'Avg',
                position: 'right',
                fill: '#6b7280',
                fontSize: 10,
              }}
            />

            {/* Area under curve */}
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="transparent"
              fill="url(#scoreGradient)"
            />

            {/* Main Line */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{
                fill: '#22c55e',
                strokeWidth: 2,
                stroke: '#1a1a1a',
                r: 4,
              }}
              activeDot={{
                fill: '#22c55e',
                strokeWidth: 3,
                stroke: '#fff',
                r: 6,
              }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.bestScore}</p>
          <p className="text-xs text-gray-400">Best Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{stats.averageScore}</p>
          <p className="text-xs text-gray-400">Average</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${stats.overallImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.overallImprovement > 0 ? '+' : ''}{stats.overallImprovement}%
          </p>
          <p className="text-xs text-gray-400">Overall</p>
        </div>
      </div>
    </motion.div>
  );
}