'use client'

import React, { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { StoreHydration } from '@/components/providers'
import { useUserStore } from '@/store'
import { Sport, SPORTS_CONFIG, getSportActions } from '@/types'

// ==========================================
// SPORTS VIEW COMPONENT
// ==========================================

export default function SportsView() {
  const selectedSport = useUserStore((state) => state.selectedSport)
  const selectedAction = useUserStore((state) => state.selectedAction)
  const setSport = useUserStore((state) => state.setSport)
  const setAction = useUserStore((state) => state.setAction)

  const searchParams = useSearchParams()

  // Pre-select sport passed via ?sport= query param (e.g. from home page sport cards)
  useEffect(() => {
    const param = searchParams.get('sport') as Sport | null
    if (param && SPORTS_CONFIG[param]) {
      setSport(param)
      setAction(null)
    }
    // Only on mount / when params change — ignore selectedSport to avoid resetting user clicks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const allSports = Object.values(SPORTS_CONFIG)
  const sportActions = selectedSport ? getSportActions(selectedSport) : []

  const handleSelectSport = useCallback((sport: Sport) => {
    setSport(sport)
    setAction(null)
  }, [setSport, setAction])

  const handleSelectAction = useCallback((actionId: string) => {
    setAction(actionId)
  }, [setAction])

  const canProceed = selectedSport !== null && selectedAction !== null

  return (
    <div className="bg-[#080809] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back nav */}
        <div className="mb-8">
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary hover:text-primary-400 transition-colors" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="section-tag mb-3">SPORT MODULE SELECTION</div>
          <h1
            className="font-black uppercase tracking-wide text-text-primary mb-2 leading-none"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            SELECT SPORT &amp; ACTION
          </h1>
          <p className="text-text-secondary text-sm">
            Choose a sport profile and action to initialize the analysis engine.
          </p>
        </div>

        {/* ===== SPORT GRID ===== */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              01 / SPORT PROFILE
            </span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <StoreHydration fallback={<SportsSkeleton />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {allSports.map((sport) => {
                const active = selectedSport === sport.id
                return (
                  <button
                    key={sport.id}
                    onClick={() => handleSelectSport(sport.id)}
                    className={`group relative border text-left p-4 transition-all duration-200 cursor-pointer
                      ${active
                        ? 'border-primary-500 bg-primary-500/8 shadow-glow-gold-sm'
                        : 'border-surface-border bg-surface hover:border-primary-500/40 hover:bg-surface-light'
                      }`}
                  >
                    {/* Active indicator dot */}
                    {active && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}

                    <div className="text-3xl mb-3">{sport.icon}</div>
                    <div
                      className={`text-sm font-black uppercase tracking-wider mb-1 ${active ? 'text-primary-400' : 'text-text-primary'}`}
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      {sport.name}
                    </div>
                    <p className="text-[10px] text-text-tertiary line-clamp-2 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {sport.description}
                    </p>
                    {active && (
                      <div className="mt-3 pt-2 border-t border-primary-500/30">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ● SELECTED
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </StoreHydration>
        </section>

        {/* ===== ACTION GRID ===== */}
        {selectedSport && sportActions.length > 0 && (
          <section className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                02 / ACTION TYPE
              </span>
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {SPORTS_CONFIG[selectedSport]?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {sportActions.map((action) => {
                const active = selectedAction === action.id
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSelectAction(action.id)}
                    className={`group relative border text-left p-4 transition-all duration-200 cursor-pointer
                      ${active
                        ? 'border-primary-500 bg-primary-500/8 shadow-glow-gold-sm'
                        : 'border-surface-border bg-surface hover:border-primary-500/40 hover:bg-surface-light'
                      }`}
                  >
                    {active && (
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}

                    <div
                      className={`text-sm font-black uppercase tracking-wider mb-2 ${active ? 'text-primary-400' : 'text-text-primary'}`}
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      {action.name}
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {action.description}
                    </p>

                    {/* Key points */}
                    <div className="flex flex-wrap gap-1">
                      {action.keyPoints.slice(0, 3).map((point) => (
                        <span
                          key={point}
                          className="px-1.5 py-0.5 border border-surface-border text-[8px] font-bold uppercase tracking-widest text-text-tertiary"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {point}
                        </span>
                      ))}
                      {action.keyPoints.length > 3 && (
                        <span className="px-1.5 py-0.5 border border-surface-border text-[8px] font-bold text-text-tertiary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          +{action.keyPoints.length - 3}
                        </span>
                      )}
                    </div>

                    {active && (
                      <div className="mt-3 pt-2 border-t border-primary-500/30">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ● SELECTED
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ===== SELECTION SUMMARY & PROCEED ===== */}
        <section>
          <div className="border border-surface-border bg-background-secondary p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              {/* Current selection readout */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Current Selection
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className={`flex items-center gap-2 px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${selectedSport ? 'border-primary-500/40 text-primary-400' : 'border-surface-border text-text-tertiary'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedSport ? 'bg-primary-500' : 'bg-surface-border'}`} />
                    SPORT: {selectedSport ? SPORTS_CONFIG[selectedSport]?.name?.toUpperCase() ?? selectedSport.toUpperCase() : 'NOT SET'}
                  </div>
                  <div className={`flex items-center gap-2 px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${selectedAction ? 'border-primary-500/40 text-primary-400' : 'border-surface-border text-text-tertiary'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedAction ? 'bg-primary-500' : 'bg-surface-border'}`} />
                    ACTION: {selectedAction ? selectedAction.replace(/_/g, ' ').toUpperCase() : 'NOT SET'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  className="px-5 py-2 border border-surface-border text-text-secondary text-[10px] font-bold uppercase tracking-widest hover:border-primary-500/50 hover:text-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  onClick={() => { setSport(null); setAction(null) }}
                  disabled={!selectedSport}
                >
                  Clear
                </button>

                {canProceed ? (
                  <Link href="/camera">
                    <button
                      className="flex items-center gap-3 px-6 py-2 bg-primary-500 text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-primary-400 transition-colors shadow-glow-gold-sm"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      OPEN CAMERA
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>
                ) : (
                  <button
                    className="px-6 py-2 bg-surface border border-surface-border text-text-tertiary text-sm font-bold uppercase tracking-[0.15em] cursor-not-allowed opacity-50"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    disabled
                  >
                    Select Sport & Action
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </div>
  )
}

// ==========================================
// SKELETON
// ==========================================

function SportsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-surface-border bg-surface animate-pulse p-4">
          <div className="w-10 h-10 bg-surface-light mb-3" />
          <div className="h-3 bg-surface-light w-3/4 mb-2" />
          <div className="h-2 bg-surface-light w-full" />
        </div>
      ))}
    </div>
  )
}

// ==========================================
// DEBUG PANEL (development only)
// ==========================================

function DebugPanel() {
  const state = useUserStore()

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <section className="mt-10">
      <div className="border border-surface-border bg-surface p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          DEV: User Store State
        </p>
        <pre className="text-[10px] text-text-tertiary overflow-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {JSON.stringify(
            {
              height: state.height,
              heightUnit: state.heightUnit,
              selectedSport: state.selectedSport,
              selectedAction: state.selectedAction,
              skillLevel: state.skillLevel,
            },
            null,
            2
          )}
        </pre>
      </div>
    </section>
  )
}
