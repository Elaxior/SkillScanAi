/**
 * Score Section Component
 * 
 * Prominently displays the overall performance score with
 * animated effects and contextual information.
 */

'use client';

import { motion } from 'framer-motion';
import { ScoreRing } from '@/components/ui';
import { getGradeFromScore, getPerformanceLevel } from '../constants';

interface ScoreSectionProps {
  score: number;
  confidence?: number;
}

export function ScoreSection({ score, confidence = 95 }: ScoreSectionProps) {
  const grade = getGradeFromScore(score);
  const { label: performanceLevel } = getPerformanceLevel(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="rounded-xl bg-[#111418] border border-white/[0.07] p-6 flex flex-col items-center">
        {/* Score ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 120 }}
        >
          <ScoreRing score={score} size="xl" strokeWidth={12} animate />
        </motion.div>

        {/* Grade + level */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-4 flex items-center gap-2"
        >
          <span
            className="text-2xl font-black text-[#F59E0B] tracking-widest"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {grade}
          </span>
          <span className="text-gray-600">/</span>
          <span
            className="text-sm font-bold tracking-widest text-gray-300 uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {performanceLevel}
          </span>
        </motion.div>

        {/* Confidence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
          <span className="text-xs font-bold tracking-wider text-[#F59E0B]/80 uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {confidence}% confidence
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}