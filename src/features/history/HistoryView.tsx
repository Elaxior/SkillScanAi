'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSessionHistory } from './hooks/useSessionHistory'
import { SessionHistory } from './components/SessionHistory'
import { ProgressChart } from './components/ProgressChart'
import { ImprovementBadge } from './components/ImprovementBadge'
import { sessionsToChartData } from './improvementUtils'

// ==========================================
// SPORT FILTER PILLS
// ==========================================

const SPORT_FILTERS = [
    { id: 'all', label: 'All Sports' },
    { id: 'basketball', label: '🏀 Basketball' },
    { id: 'volleyball', label: '🏐 Volleyball' },
    { id: 'badminton', label: '🏸 Badminton' },
]

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
    label,
    value,
    sub,
    accent,
}: {
    label: string
    value: string | number
    sub?: string
    accent?: boolean
}) {
    return (
        <div className="bg-[#0D0D0F] border border-[#24242E] rounded-lg p-4 flex flex-col gap-1">
            <p
                className="text-[10px] uppercase tracking-[0.18em] text-[#6B6B7A]"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
                {label}
            </p>
            <p
                className={`text-2xl font-black ${accent ? 'text-[#F59E0B]' : 'text-white'}`}
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
                {value}
            </p>
            {sub && <p className="text-xs text-[#6B6B7A]">{sub}</p>}
        </div>
    )
}

// ==========================================
// SKELETON LOADER
// ==========================================

function HistorySkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="h-16 bg-[#0D0D0F] border border-[#24242E] rounded-lg"
                />
            ))}
        </div>
    )
}

// ==========================================
// MAIN HISTORY VIEW
// ==========================================

export default function HistoryView() {
    const { sessions, stats, isLoading, error } = useSessionHistory()
    const [sportFilter, setSportFilter] = useState('all')
    const [view, setView] = useState<'list' | 'chart'>('list')

    // Apply filter
    const filteredSessions =
        sportFilter === 'all'
            ? sessions
            : sessions.filter((s) => s.sport === sportFilter)

    // Chart data derived from filtered sessions
    const filteredChartData = sessionsToChartData(filteredSessions)

    return (
        <div className="min-h-screen bg-[#080809] pt-6 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* ── Header ───────────────────────────── */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {/* Bracket decorators */}
                            <span className="text-[#F59E0B] text-lg font-mono">[</span>
                            <h1
                                className="text-2xl font-black uppercase tracking-widest text-white"
                                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                            >
                                Analysis History
                            </h1>
                            <span className="text-[#F59E0B] text-lg font-mono">]</span>
                        </div>
                        <p className="text-sm text-[#6B6B7A]">
                            Review your recorded performance sessions
                        </p>
                    </div>

                    <Link
                        href="/camera"
                        className="flex items-center gap-2 px-4 py-2 rounded bg-[#F59E0B] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#f7b731] transition-colors"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        New Analysis
                    </Link>
                </div>

                {/* ── Stats Row ─────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
                >
                    <StatCard label="Total Sessions" value={stats.totalSessions} />
                    <StatCard label="Best Score" value={stats.bestScore ?? '—'} accent />
                    <StatCard label="Average Score" value={stats.averageScore > 0 ? stats.averageScore : '—'} />
                    <StatCard
                        label="This Week"
                        value={stats.sessionsThisWeek}
                        sub={`${stats.weeklyImprovement > 0 ? '+' : ''}${stats.weeklyImprovement}% vs last week`}
                    />
                </motion.div>

                {/* ── View Toggle + Filter ──────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-[#0D0D0F] border border-[#24242E] rounded p-1 w-fit">
                        {(['list', 'chart'] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${view === v
                                    ? 'bg-[#F59E0B] text-black'
                                    : 'text-[#6B6B7A] hover:text-white'
                                    }`}
                                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Sport filters */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {SPORT_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setSportFilter(f.id)}
                                className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${sportFilter === f.id
                                    ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10'
                                    : 'border-[#24242E] text-[#6B6B7A] hover:border-[#F59E0B]/40 hover:text-white'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Main Content Area ─────────────────── */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <HistorySkeleton />
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 text-red-400 border border-red-500/20 rounded-lg bg-red-500/5"
                        >
                            <p className="text-sm mb-2">Failed to load sessions</p>
                            <p className="text-xs text-[#6B6B7A]">{error}</p>
                        </motion.div>
                    ) : view === 'chart' ? (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Weekly improvement badge */}
                            {stats.totalSessions >= 2 && (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-[#6B6B7A]">Weekly trend:</span>
                                    <ImprovementBadge improvement={stats.weeklyImprovement} period="this week" />
                                </div>
                            )}
                            <div className="bg-[#0D0D0F] border border-[#24242E] rounded-lg p-4">
                                <ProgressChart
                                    data={filteredChartData}
                                    stats={stats}
                                    height={280}
                                />
                            </div>
                            {/* Also show list */}
                            <div className="border-t border-[#24242E] pt-6">
                                <h2
                                    className="text-xs font-bold uppercase tracking-widest text-[#6B6B7A] mb-4"
                                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                                >
                                    Session Log
                                </h2>
                                <SessionHistory sessions={filteredSessions} maxDisplay={10} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {filteredSessions.length === 0 && !isLoading ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div
                                        className="w-16 h-16 border border-[#24242E] rounded-lg flex items-center justify-center mb-6"
                                        style={{ background: 'linear-gradient(135deg, #0D0D0F 0%, #14141A 100%)' }}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5">
                                            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                        </svg>
                                    </div>
                                    <h3
                                        className="text-lg font-black uppercase tracking-widest text-white mb-2"
                                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                                    >
                                        No Sessions Recorded
                                    </h3>
                                    <p className="text-sm text-[#6B6B7A] mb-8 max-w-xs">
                                        {sportFilter !== 'all'
                                            ? `No ${sportFilter.replace('_', ' ')} sessions yet. Try a different filter or record a new session.`
                                            : "Complete your first analysis to start tracking performance over time."}
                                    </p>
                                    <Link
                                        href="/camera"
                                        className="px-6 py-2.5 bg-[#F59E0B] text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#f7b731] transition-colors"
                                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                                    >
                                        Start Recording
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-[#0D0D0F] border border-[#24242E] rounded-lg p-4">
                                    <SessionHistory sessions={filteredSessions} maxDisplay={50} />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
