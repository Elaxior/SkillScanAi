/**
 * ComparisonSection — "PERFORMANCE COMPARISON"
 *
 * Two-mode toggle: VS AMATEUR (gold vs gray) / VS PRO (gold vs blue).
 * Each metric shows two proportional bars + value labels.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMetricConfigs } from '../constants';

interface ComparisonSectionProps {
  metrics: Record<string, number | null>;
  sport: string;
  action: string;
}

type Mode = 'amateur' | 'pro';

export function ComparisonSection({ metrics, sport, action }: ComparisonSectionProps) {
  const [mode, setMode] = useState<Mode>('amateur');

  const configs = getMetricConfigs(sport, action);

  // Build rows — only metrics that have a user value
  const rows = configs
    .map((cfg) => {
      const raw = metrics[cfg.key];
      if (raw === null || raw === undefined) return null;
      const userVal = cfg.format === 'percentage' ? Math.round(raw * 100) : Math.round(raw);
      const amateurVal = Math.round(cfg.amateurAverage);
      const proVal = Math.round((cfg.proRange[0] + cfg.proRange[1]) / 2);
      return { key: cfg.key, label: cfg.label, unit: cfg.unit, userVal, amateurVal, proVal };
    })
    .filter(Boolean) as Array<{
      key: string; label: string; unit: string;
      userVal: number; amateurVal: number; proVal: number;
    }>;

  if (rows.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl bg-[#111418] border border-white/[0.07] overflow-hidden"
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2
          className="text-sm font-black tracking-widest text-white uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}
        >
          Performance Comparison
        </h2>

        {/* Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-white/[0.1]">
          <button
            onClick={() => setMode('amateur')}
            className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors ${mode === 'amateur'
                ? 'bg-[#F59E0B] text-black'
                : 'bg-transparent text-gray-400 hover:text-white'
              }`}
          >
            VS Amateur
          </button>
          <button
            onClick={() => setMode('pro')}
            className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors border-l border-white/[0.1] ${mode === 'pro'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-transparent text-gray-400 hover:text-white'
              }`}
          >
            VS Pro
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-5">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
            <span className="text-gray-300">You</span>
          </div>
          <AnimatePresence mode="wait">
            {mode === 'amateur' ? (
              <motion.div key="leg-a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" />
                <span className="text-gray-400">Amateur Avg</span>
              </motion.div>
            ) : (
              <motion.div key="leg-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" />
                <span className="text-gray-400">Pro Avg</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Metric rows */}
        <div className="space-y-5">
          {rows.map((row, i) => {
            const benchmark = mode === 'amateur' ? row.amateurVal : row.proVal;
            const benchColor = mode === 'amateur' ? '#6B7280' : '#3B82F6';
            const benchNumColor = mode === 'amateur' ? '#9CA3AF' : '#60A5FA';
            const maxVal = Math.max(row.userVal, benchmark) * 1.18;
            const userPct = Math.min((row.userVal / maxVal) * 100, 100);
            const benchPct = Math.min((benchmark / maxVal) * 100, 100);
            const unitLabel = row.unit === '/100' ? '' : row.unit;

            return (
              <div key={row.key}>
                <p className="text-[10px] tracking-[0.18em] text-gray-500 uppercase mb-2"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {row.label}
                </p>

                {/* You */}
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs text-[#F59E0B] w-8 shrink-0">You</span>
                  <div className="flex-1 h-[9px] bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${userPct}%` }}
                      transition={{ duration: 0.65, delay: 0.05 * i, ease: 'easeOut' }}
                      className="h-full rounded-full bg-[#F59E0B]"
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-12 text-right tabular-nums shrink-0">
                    {row.userVal}{unitLabel}
                  </span>
                </div>

                {/* Benchmark */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8 shrink-0">
                    {mode === 'amateur' ? 'Avg' : 'Pro'}
                  </span>
                  <div className="flex-1 h-[9px] bg-white/[0.05] rounded-full overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${row.key}-${mode}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${benchPct}%` }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.65, delay: 0.05 * i, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: benchColor }}
                      />
                    </AnimatePresence>
                  </div>
                  <span className="text-xs font-bold w-12 text-right tabular-nums shrink-0"
                    style={{ color: benchNumColor }}>
                    {benchmark}{unitLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
