'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { StoreHydration } from '@/components/providers'
import { useUserStore, useSessionStore } from '@/store'
import { SPORTS_CONFIG } from '@/types'

// ==========================================
// TERMINAL FEED DATA
// ==========================================

const FEED_LINES = [
  { type: 'ok',    text: 'COGNITIVE BENCHMARKING: COMPLETE' },
  { type: 'track', text: 'EXTRACT PLAYER.22.112 VELOCITY: 8.4m/s' },
  { type: 'data',  text: 'INJECTING NEURAL_METRICS_DATA...' },
  { type: 'track', text: 'EXTRACT PLAYER.ID: RAW_POSITION.LOAD: MMS' },
  { type: 'data',  text: 'EXTRACT WRIST_DATA: 25.4/HZN | 33-842' },
  { type: 'ok',    text: 'DIRECT BIOMETRICS HARDWARE: COMPLETE' },
  { type: 'track', text: 'FAST PATTERN_RECOGNITION: DISABLE_SEQUENCE_B' },
  { type: 'data',  text: '[VERIFIED] 0.68 NEUTRALITY AT SHOT_ATTEMPT' },
  { type: 'ok',    text: 'ENTERING DECRYPTING DATA PACKET...' },
  { type: 'data',  text: '[AXIS] AGGREGATE_DATE: 274.399 | 128-946' },
  { type: 'ok',    text: 'SYNC CALIBRATING SPATIAL_INPUT...' },
  { type: 'data',  text: '[PREDICT] 0.66 PROBABILITY AT SHOT_ATTEMPT' },
]

const typeColors: Record<string, string> = {
  ok: 'text-primary-500',
  track: 'text-text-secondary',
  data: 'text-text-tertiary',
}

const SYSTEM_STATS = [
  { label: 'Latency',    value: '12',    unit: 'ms' },
  { label: 'Sync Depth', value: '98.4',  unit: '%' },
  { label: 'Sensors',    value: '1,240', unit: '' },
  { label: 'Processing', value: '4.2',   unit: 'TF' },
]

const SPORT_MODULES = [
  {
    id: 'basketball', mode: '01', name: 'BASKETBALL', sub: 'POSITIONAL MAPPING', load: 94, href: '/sports',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  },
  {
    id: 'volleyball', mode: '02', name: 'VOLLEYBALL', sub: 'REACTION ANALYSIS', load: 78, href: '/sports',
    img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
  },
  {
    id: 'badminton', mode: '03', name: 'BADMINTON', sub: 'TRAJECTORY SCAN', load: 64, href: '/sports',
    img: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=400',
  },
  {
    id: 'table_tennis', mode: '04', name: 'TABLE TENNIS', sub: 'BIOMETRIC ANALYSIS', load: 88, href: '/sports',
    img: 'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=400',
  },
]

const FEATURES = [
  {
    title: 'ADVANCED BIOMETRICS',
    body: 'Monitor physiological strain in real-time. Our sensors capture heart rate variability, sweat sodium concentration, and muscular fatigue index across the entire roster simultaneously.',
    bullets: ['Metabolic Rate Tracking', 'Sleep-Performance Correlation', 'Recovery Time Prediction'],
  },
  {
    title: 'TACTICAL PATTERNS',
    body: 'Uncover the hidden geometries of the game. Our AI identifies tactical patterns, space creation efficiency, and player positioning errors before they cost you the match.',
    bullets: ['Dynamic Heat Mapping', 'Line-Break Efficiency', 'Zonal Control Analysis'],
  },
  {
    title: 'PREDICTIVE SCOUTING',
    body: 'The future of recruitment is here. Scan thousands of athletes globally and predict their development curve based on proprietary growth modeling and historical comparisons.',
    bullets: ['Market Value Forecasting', 'Technical Upside Index', 'Character Risk Assessment'],
  },
]

// ==========================================
// LIVE TICKER (client component)
// ==========================================

function LiveTicker() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((v) => (v + 1) % FEED_LINES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const visible = Array.from({ length: 10 }, (_, i) =>
    FEED_LINES[(offset + i) % FEED_LINES.length]
  )

  return (
    <div className="space-y-1.5">
      {visible.map((line, i) => (
        <div key={i} className={`terminal-line ${typeColors[line.type] ?? 'text-text-tertiary'}`}>
          {line.text}
        </div>
      ))}
    </div>
  )
}

// ==========================================
// MAIN HOME VIEW
// ==========================================

export default function HomeView() {
  return (
    <div className="bg-[#080809] min-h-screen">

      {/* HERO SECTION */}
      <section className="border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Left – headline + CTAs */}
            <div className="lg:col-span-2">
              <div className="section-tag mb-6">SPATIAL INTELLIGENCE ENGINE V4.2</div>

              <h1
                className="font-black uppercase leading-none tracking-wide mb-6"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2.6rem, 6vw, 5rem)' }}
              >
                <span className="text-text-primary">ELITE PERFORMANCE</span>
                <br />
                <em className="not-italic text-primary-500">ANALYSIS:</em>
                <span className="text-text-primary"> PRECISION</span>
                <br />
                <span className="text-text-primary">SCANNED.</span>
              </h1>

              <p className="text-text-secondary text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
                Deploying hyper-spectral tracking and neural pattern recognition
                to quantify athletic potential with 99.8% precision.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/sports">
                  <button
                    className="flex items-center gap-3 px-6 py-3 bg-primary-500 text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-primary-400 transition-colors shadow-glow-gold-sm hover:shadow-glow-primary"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    INITIATE DEEP SCAN
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <Link href="/camera">
                  <button
                    className="flex items-center gap-3 px-6 py-3 border border-primary-500/50 text-primary-400 font-black uppercase tracking-[0.15em] text-sm hover:bg-primary-500/10 hover:border-primary-400 transition-colors"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    LIVE TELEMETRY
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="15" />
                      <polyline points="17 2 12 7 7 2" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right – Live Feed panel */}
            <div className="lg:col-span-1">
              <div className="border border-surface-border bg-[#0D0D0F] h-full flex flex-col">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-blink" />
                  <span
                    className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    Live Feedback Stream
                  </span>
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  <LiveTicker />
                </div>
                <div className="border-t border-surface-border px-4 py-3">
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-2"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Positional Evidence
                  </p>
                  <div className="flex items-end gap-1 h-8">
                    {[4, 7, 5, 9, 6, 8, 10, 7, 9, 11, 8, 6, 9, 10, 8].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary-500/60 hover:bg-primary-500 transition-colors"
                        style={{ height: `${(h / 12) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-surface-border bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-surface-border">
              {SYSTEM_STATS.map((stat) => (
                <div key={stat.label} className="px-6 py-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-tertiary mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-black text-text-primary leading-none"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    <span className="text-primary-400">{stat.value}</span>
                    {stat.unit && <span className="text-base text-text-secondary ml-1">{stat.unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPORTS SELECTION MATRIX */}
      <section className="border-b border-surface-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-tag mb-2">MODULE SELECTION</div>

          <h2
            className="font-black uppercase tracking-wide text-text-primary mb-8"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}
          >
            SPORTS SELECTION <em className="not-italic text-primary-500/80">MATRIX</em>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SPORT_MODULES.map((sport) => (
              <Link key={sport.id} href={sport.href}>
                <div className="group border border-surface-border bg-surface hover:border-primary-500/50 transition-all duration-200 cursor-pointer overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sport.img}
                      alt={sport.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 left-2 border border-primary-500/60 px-1.5 py-0.5">
                      <span className="text-[9px] font-bold text-primary-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        MODE: {sport.mode}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-black uppercase tracking-wider text-text-primary text-sm mb-0.5"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      {sport.name}
                    </h3>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wide mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {sport.sub}
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-text-tertiary uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          Analysis Load
                        </span>
                        <span className="text-[10px] font-bold text-primary-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {sport.load}%
                        </span>
                      </div>
                      <div className="h-0.5 bg-surface-border">
                        <div className="h-full bg-primary-500 transition-all duration-700" style={{ width: `${sport.load}%` }} />
                      </div>
                    </div>
                    <button
                      className="w-full py-1.5 border border-surface-border text-text-secondary text-[10px] font-bold uppercase tracking-widest group-hover:border-primary-500/60 group-hover:text-primary-400 transition-all flex items-center justify-center gap-2"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      SCAN SPORT
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE COLUMNS */}
      <section className="border-b border-surface-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-surface-border">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="p-8">
                <h3
                  className="text-lg font-black uppercase tracking-wide text-text-primary mb-3"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">{feat.body}</p>
                <ul className="space-y-1.5">
                  {feat.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs text-text-tertiary uppercase tracking-wide"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <span className="text-primary-500">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATUS STRIP – only when hydrated */}
      <StoreHydration fallback={null}>
        <StatusStrip />
      </StoreHydration>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-tag inline-block mb-6">READY FOR DEPLOYMENT</div>
          <h2
            className="font-black uppercase tracking-wide text-text-primary mb-2 leading-none"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            OPTIMIZE YOUR
          </h2>
          <h2
            className="font-black uppercase tracking-wide text-primary-500 mb-10 leading-none"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            ATHLETIC ROSTER
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/sports">
              <button
                className="flex items-center gap-3 px-8 py-3.5 bg-primary-500 text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-primary-400 transition-colors shadow-glow-gold-sm"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                REQUEST SYSTEM DEMO
              </button>
            </Link>
            <Link href="/analysis">
              <button
                className="px-8 py-3.5 border border-primary-500/50 text-primary-400 font-black uppercase tracking-[0.15em] text-sm hover:bg-primary-500/10 hover:border-primary-400 transition-colors"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                VIEW DOCUMENTATION
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

// ==========================================
// STATUS STRIP
// ==========================================

function StatusStrip() {
  const height         = useUserStore((state) => state.height)
  const selectedSport  = useUserStore((state) => state.selectedSport)
  const selectedAction = useUserStore((state) => state.selectedAction)
  const score          = useSessionStore((state) => state.score)

  const isReady = height !== null && selectedSport !== null && selectedAction !== null

  const items = [
    { label: `HT: ${height != null ? String(height) : '-'}`,                                                        ok: height !== null },
    { label: `SPORT: ${selectedSport ? (SPORTS_CONFIG[selectedSport]?.name ?? selectedSport).toUpperCase() : '-'}`, ok: !!selectedSport },
    { label: `ACTION: ${selectedAction?.toUpperCase() ?? '-'}`,                                                     ok: !!selectedAction },
    ...(score != null ? [{ label: `SCORE: ${score}`, ok: true }] : []),
  ]

  return (
    <section className="border-b border-surface-border bg-background-secondary py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Active Profile:
            </span>
            {items.map(({ label, ok }, i) => (
              <span
                key={i}
                className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${ok ? 'border-primary-500/30 text-primary-400' : 'border-surface-border text-text-tertiary'}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-primary-500' : 'bg-surface-border'}`} />
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <Link href="/settings">
              <button
                className="px-4 py-1.5 border border-surface-border text-text-secondary text-[10px] font-bold uppercase tracking-widest hover:border-primary-500/50 hover:text-primary-400 transition-colors"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Configure
              </button>
            </Link>
            {isReady ? (
              <Link href="/camera">
                <button
                  className="px-4 py-1.5 bg-primary-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-primary-400 transition-colors"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Open Camera
                </button>
              </Link>
            ) : (
              <Link href="/sports">
                <button
                  className="px-4 py-1.5 border border-primary-500/50 text-primary-400 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500/10 transition-colors"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Select Sport
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
