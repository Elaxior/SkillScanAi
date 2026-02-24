/**
 * Flaw Card Component
 * 
 * Individual flaw display with severity styling,
 * injury risk indication, and action buttons.
 */

'use client';

import { motion } from 'framer-motion';
import type { DetectedFlaw, FlawSeverity } from '@/features/flaws';

interface FlawCardProps {
  flaw: DetectedFlaw;
  index: number;
}

/**
 * Get left-border accent color by severity
 */
function getSeverityBorder(severity: FlawSeverity, hasInjuryRisk: boolean): string {
  if (hasInjuryRisk) return 'border-l-red-500';
  switch (severity) {
    case 'high': return 'border-l-orange-500';
    case 'medium': return 'border-l-yellow-400';
    case 'low':
    default: return 'border-l-blue-400';
  }
}

function getSeverityBadge(severity: FlawSeverity, hasInjuryRisk: boolean): string {
  if (hasInjuryRisk) return 'bg-red-500/15 text-red-400 border-red-500/25';
  switch (severity) {
    case 'high': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
    case 'medium': return 'bg-yellow-400/15 text-yellow-300 border-yellow-400/25';
    case 'low':
    default: return 'bg-blue-400/15 text-blue-300 border-blue-400/25';
  }
}

export function FlawCard({ flaw, index }: FlawCardProps) {
  const borderClass = getSeverityBorder(flaw.severity, flaw.injuryRisk);
  const badgeClass = getSeverityBadge(flaw.severity, flaw.injuryRisk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 * index }}
    >
      <div className={`rounded-xl bg-[#111418] border border-white/[0.07] border-l-2 ${borderClass} p-4`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2.5">
            {/* Severity badge */}
            <span
              className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${badgeClass}`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {flaw.injuryRisk ? 'Risk' : flaw.severity}
            </span>
            <h3 className="text-sm font-semibold text-white leading-snug">{flaw.title}</h3>
          </div>

          {flaw.injuryRisk && (
            <span className="shrink-0 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              ⚠ Injury Risk
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{flaw.description}</p>

        {/* Correction tip */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] mb-3">
          <span className="text-[#F59E0B] shrink-0 text-sm">💡</span>
          <p className="text-xs text-gray-300 leading-relaxed">{flaw.correction}</p>
        </div>

        {/* Injury details */}
        {flaw.injuryRisk && flaw.injuryDetails && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 mb-3">
            <span className="text-red-400 shrink-0 text-sm">⚕️</span>
            <p className="text-xs text-red-300 leading-relaxed">{flaw.injuryDetails}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {flaw.youtubeUrl && (
            <motion.a
              href={flaw.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/25 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span
                className="text-[10px] font-black tracking-widest text-red-400 uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Watch Fix
              </span>
            </motion.a>
          )}

          {flaw.drill && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-black tracking-widest text-gray-400 uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              🏀 {flaw.drill.duration} drill
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}