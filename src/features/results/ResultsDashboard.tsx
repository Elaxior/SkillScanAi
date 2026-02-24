/**
 * Results Dashboard - Updated with History Integration
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreSection } from './components/ScoreSection';
import { MetricGrid } from './components/MetricGrid';
import { ComparisonSection } from './components/ComparisonSection';
import { FlawList } from './components/FlawList';
import { CoachChat } from '@/features/coach/CoachChat';
import {
  ProgressChart,
  SessionHistory,
  ImprovementSummary,
  useSessionHistory,
} from '@/features/history';
import { Loader } from '@/components/ui';
import type { ResultsDashboardProps } from './types';

interface ExtendedResultsDashboardProps extends ResultsDashboardProps {
  onGhostToggle?: (enabled: boolean) => void;
  ghostEnabled?: boolean;
}

export function ResultsDashboard({
  score,
  scoreBreakdown,
  metrics,
  flaws,
  confidence = 95,
  sport,
  action,
  onGhostToggle,
  ghostEnabled = false,
}: ExtendedResultsDashboardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History hook
  const {
    sessions,
    stats,
    chartData,
    isLoading: isLoadingHistory,
    isSaving,
    error: historyError,
    saveError,
    saveCurrentSession,
    refreshSessions,
  } = useSessionHistory();

  const hasScore = score !== null;
  const hasMetrics = Object.keys(metrics).length > 0;
  const flawCount = flaws.length;
  const hasInjuryRisk = flaws.some((f) => f.injuryRisk);

  // Handle save session
  const handleSaveSession = async () => {
    if (!hasScore) return;

    const success = await saveCurrentSession(
      sport,
      action,
      score,
      scoreBreakdown,
      metrics,
      flawCount,
      hasInjuryRisk
    );

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Load history on mount
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  if (!hasScore && !hasMetrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="text-gray-500 text-sm">No analysis data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-2xl font-black tracking-widest text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Analysis Results
          </h1>
          <p className="text-xs text-gray-600 tracking-widest uppercase mt-0.5"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {sport} · {action?.replace(/_/g, ' ')}
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveSession}
          disabled={isSaving || saveSuccess}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all border ${saveSuccess
              ? 'bg-green-500/15 border-green-500/40 text-green-400'
              : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/20'
            } disabled:opacity-50`}
        >
          {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved' : '↑ Save Session'}
        </button>
      </motion.div>

      {/* Save error */}
      {saveError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      {/* ── Main grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left — score */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-5">
            {hasScore && <ScoreSection score={score} confidence={confidence} />}
            {stats.totalSessions > 1 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <ImprovementSummary weeklyImprovement={stats.weeklyImprovement} sessionsThisWeek={stats.sessionsThisWeek} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right — details */}
        <div className="lg:col-span-8 space-y-5">
          {hasMetrics && <MetricGrid metrics={metrics} sport={sport} action={action} />}
          <ComparisonSection metrics={metrics} sport={sport} action={action} />
          <FlawList flaws={flaws} />
        </div>
      </div>

      {/* ── Progress history ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-xl bg-[#111418] border border-white/[0.07] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2
            className="text-sm font-black tracking-widest text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}
          >
            Your Progress
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-gray-500 hover:text-gray-300 tracking-wider uppercase transition-colors"
          >
            {showHistory ? 'Hide history' : 'Show sessions'}
          </button>
        </div>
        <div className="p-5">
          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8"><Loader size="md" text="Loading..." /></div>
          )}
          {historyError && !isLoadingHistory && (
            <div className="text-center py-6">
              <p className="text-yellow-400 text-sm mb-3">{historyError}</p>
              <button onClick={refreshSessions} className="text-xs text-gray-400 hover:text-white underline">Retry</button>
            </div>
          )}
          {!isLoadingHistory && !historyError && (
            <ProgressChart data={chartData} stats={stats} height={220} />
          )}
          <AnimatePresence>
            {showHistory && !isLoadingHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="mt-5 pt-5 border-t border-white/[0.06]"
              >
                <SessionHistory sessions={sessions} maxDisplay={10} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── AI Coach ─────────────────────────────────────────────── */}
      {hasScore && (
        <CoachChat
          sport={sport} action={action} score={score as number}
          metrics={metrics} scoreBreakdown={scoreBreakdown} flaws={flaws}
        />
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <p className="text-center text-xs text-gray-700 pb-4 tracking-widest uppercase"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        Powered by MediaPipe Pose · Gemini 2.0 Flash
      </p>
    </div>
  );
}