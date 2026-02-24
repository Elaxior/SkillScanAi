/**
 * Flaw List Component
 * 
 * Container for displaying detected flaws with proper
 * empty state and section styling.
 */

'use client';

import { motion } from 'framer-motion';
import { FlawCard } from './FlawCard';
import type { DetectedFlaw } from '@/features/flaws';

interface FlawListProps {
  flaws: DetectedFlaw[];
}

export function FlawList({ flaws }: FlawListProps) {
  const hasFlaws = flaws.length > 0;
  const injuryRiskCount = flaws.filter((f) => f.injuryRisk).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-5 bg-[#F59E0B] rounded-full" />
          <h2
            className="text-sm font-black tracking-widest text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}
          >
            Areas to Improve
          </h2>
        </div>

        {hasFlaws && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold tracking-wider text-gray-400 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {flaws.length} issue{flaws.length !== 1 ? 's' : ''}
            </span>
            {injuryRiskCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-[10px] font-bold tracking-wider text-red-400 uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                ⚠ {injuryRiskCount} risk{injuryRiskCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasFlaws && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-[#111418] border border-white/[0.07] p-8 text-center"
        >
          <span className="text-4xl mb-3 block">✨</span>
          <h3
            className="text-base font-black tracking-widest text-[#F59E0B] uppercase mb-1"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Excellent Form
          </h3>
          <p className="text-sm text-gray-500">No critical technique issues detected.</p>
        </motion.div>
      )}

      {/* Flaw Cards */}
      {hasFlaws && (
        <div className="space-y-4">
          {flaws.map((flaw, index) => (
            <FlawCard key={flaw.id} flaw={flaw} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}