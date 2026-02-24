'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'


// ==========================================
// TERMINAL FEED DATA
// ==========================================

const FEED_LINES = [
  { type: 'ok', text: 'MEDIAPIPE POSE MODEL LOADED...' },
  { type: 'track', text: 'DETECTING 33 BODY LANDMARKS' },
  { type: 'data', text: 'JOINT ANGLES: ELBOW 142° | KNEE 168°' },
  { type: 'ok', text: 'KEYFRAMES EXTRACTED FROM VIDEO' },
  { type: 'track', text: 'SCORING: FORM 88 | BALANCE 74 | TIMING 91' },
  { type: 'data', text: '[FLAW] ELBOW_POSITION: DEVIATION DETECTED' },
  { type: 'ok', text: 'SCORE ENGINE: COMPUTING BREAKDOWN...' },
  { type: 'data', text: '[RESULT] OVERALL SCORE: 83 / 100' },
  { type: 'ok', text: 'AI COACH: SESSION CONTEXT READY' },
  { type: 'track', text: 'GEMINI 2.0 FLASH: RESPONSE GENERATED' },
  { type: 'data', text: 'SESSION SAVED → FIREBASE FIRESTORE' },
  { type: 'track', text: 'HISTORY UPDATED: 1 NEW SESSION LOGGED' },
]

const typeColors: Record<string, string> = {
  ok: 'text-[#F59E0B]',
  track: 'text-[#9CA3AF]',
  data: 'text-[#6B7280]',
}

const SYSTEM_STATS = [
  { label: 'Pose Landmarks', value: '33', unit: '' },
  { label: 'Sports Supported', value: '4', unit: '' },
  { label: 'Scoring Metrics', value: '8', unit: '' },
  { label: 'AI Model', value: 'G2.0', unit: '' },
]

const SPORT_MODULES = [
  {
    id: 'basketball', mode: '01', name: 'BASKETBALL', sub: 'FORM & SHOT ANALYSIS', load: 94, href: '/sports',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  },
  {
    id: 'volleyball', mode: '02', name: 'VOLLEYBALL', sub: 'SPIKE & SERVE FORM', load: 78, href: '/sports',
    img: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
  },
  {
    id: 'badminton', mode: '03', name: 'BADMINTON', sub: 'STROKE MECHANICS', load: 64, href: '/sports',
    img: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=400',
  },
]

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: 'POSE DETECTION',
    body: 'Record your movement on camera and let MediaPipe\'s 33-landmark body model extract your exact joint positions frame by frame. No wearables, no equipment — just your phone camera.',
    bullets: ['33 Body Landmark Tracking', 'Joint Angle Measurement', 'Automatic Keyframe Extraction'],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'FORM SCORING',
    body: 'Each session is broken down into up to 8 sport-specific metrics — form, balance, timing, release point, and more. A weighted score out of 100 tells you exactly where you stand.',
    bullets: ['8 Sport-Specific Metrics', 'Weighted Score 0–100', 'Flaw Detection & Injury Risk'],
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: 'AI COACHING',
    body: 'After every session, your personal AI coach powered by Gemini 2.0 Flash reads your scores and flaws and gives you a detailed, conversational breakdown with actionable drills to improve.',
    bullets: ['Powered by Gemini 2.0 Flash', 'Session-Aware Feedback', 'Interactive Q&A Chat'],
  },
]

const FOOTER_COLS = [
  {
    heading: 'FEATURES',
    links: ['Pose Detection', 'Form Scoring', 'Flaw Analysis', 'AI Coach'],
  },
  {
    heading: 'SPORTS',
    links: ['Basketball', 'Volleyball', 'Badminton'],
  },
  {
    heading: 'POWERED BY',
    links: ['MediaPipe Pose', 'Gemini 2.0 Flash', 'Firebase', 'Next.js 14'],
  },
]

// ==========================================
// CORNER SCAN BRACKETS
// ==========================================

function ScanBrackets({ className = '' }: { className?: string }) {
  const s = 'absolute w-4 h-4 border-[#F59E0B]'
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${s} top-0 left-0 border-t border-l`} />
      <span className={`${s} top-0 right-0 border-t border-r`} />
      <span className={`${s} bottom-0 left-0 border-b border-l`} />
      <span className={`${s} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}

// ==========================================
// LIVE TICKER
// ==========================================

function LiveTicker() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setOffset((v) => (v + 1) % FEED_LINES.length), 1800)
    return () => clearInterval(id)
  }, [])
  const visible = Array.from({ length: 10 }, (_, i) => FEED_LINES[(offset + i) % FEED_LINES.length])
  return (
    <div className="space-y-1.5">
      {visible.map((line, i) => (
        <div
          key={i}
          className={`text-[10px] font-medium uppercase tracking-wide truncate ${typeColors[line.type] ?? 'text-[#6B7280]'}`}
          style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 1 - i * 0.07 }}
        >
          {line.text}
        </div>
      ))}
    </div>
  )
}

// ==========================================
// ANIMATED STAT
// ==========================================

function AnimatedStat({ value, unit }: { value: string; unit: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayed, setDisplayed] = useState('0')
  const numeric = parseFloat(value.replace(',', ''))

  useEffect(() => {
    if (isNaN(numeric)) { setDisplayed(value); return }
    let start = 0
    const end = numeric
    const duration = 1200
    const step = (timestamp: number, startTime: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const cur = start + (end - start) * eased
      setDisplayed(value.includes(',') ? Math.round(cur).toLocaleString() : cur.toFixed(value.includes('.') ? 1 : 0))
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime))
    }
    requestAnimationFrame((t) => step(t, t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span ref={ref} className="text-[#F59E0B]">
      {displayed}
      {unit && <span className="text-base text-[#9CA3AF] ml-1">{unit}</span>}
    </span>
  )
}

// ==========================================
// MAIN HOME VIEW
// ==========================================

export default function HomeView() {
  return (
    <div className="bg-[#080809] min-h-screen">

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-[#24242E] relative overflow-hidden">
        {/* subtle grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Left â€“ headline + CTAs */}
            <div className="lg:col-span-2">
              {/* section tag */}
              <div className="inline-flex items-center gap-2 border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  POSE ANALYSIS ENGINE · MEDIAPIPE + GEMINI AI
                </span>
              </div>

              <h1
                className="font-black uppercase leading-none tracking-wide mb-4"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)' }}
              >
                <span className="text-[#F5F5F5]">RECORD YOUR FORM</span>
                <br />
                <em className="not-italic text-[#F59E0B]">GET SCORED</em>
                <br />
                <span className="text-[#F5F5F5]">IMPROVE FASTER</span>
              </h1>

              <p className="text-[#9CA3AF] text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
                Point your camera, perform your move, and SkillScan AI analyses
                your body mechanics using 33-point pose detection — then your personal
                AI coach tells you exactly what to fix.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/sports">
                  <button
                    className="relative flex items-center gap-3 px-7 py-3 bg-[#F59E0B] text-black font-black uppercase tracking-[0.15em] text-sm hover:bg-[#D97706] transition-colors"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    SELECT YOUR SPORT
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
                <Link href="/camera">
                  <button
                    className="flex items-center gap-3 px-7 py-3 border border-[#F59E0B]/40 text-[#F59E0B] font-black uppercase tracking-[0.15em] text-sm hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/70 transition-colors"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    OPEN CAMERA
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="15" /><polyline points="17 2 12 7 7 2" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* Right â€“ Live Feed panel */}
            <div className="lg:col-span-1">
              <div className="relative border border-[#24242E] bg-[#0D0D0F] h-full flex flex-col">
                <ScanBrackets />
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#24242E]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9CA3AF]"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      Analysis Pipeline
                    </span>
                  </div>
                  <button className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-hidden min-h-[200px]">
                  <LiveTicker />
                </div>
                <div className="border-t border-[#24242E] px-4 py-3">
                  <p
                    className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    Landmark Confidence
                  </p>
                  <div className="flex items-end gap-0.5 h-10">
                    {[4, 7, 5, 9, 6, 8, 10, 7, 9, 11, 8, 6, 9, 10, 8, 7, 11, 9, 6, 10].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#F59E0B]/50 hover:bg-[#F59E0B] transition-colors"
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
        <div className="border-t border-[#24242E] bg-[#0D0D0F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#24242E]">
              {SYSTEM_STATS.map((stat) => (
                <div key={stat.label} className="px-6 py-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-1"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-black text-[#F5F5F5] leading-none"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    <AnimatedStat value={stat.value} unit={stat.unit} />
                  </p>
                  {/* thin gold progress bar */}
                  <div className="mt-2 h-px bg-[#24242E]">
                    <motion.div
                      className="h-full bg-[#F59E0B]/60"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ SPORTS SELECTION MATRIX â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-[#24242E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 border border-[#24242E] px-3 py-1">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B7280]"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                SPORT MODULES
              </span>
            </div>
            <div className="flex items-center gap-1">
              {['â—€', 'â–¶'].map((arrow, i) => (
                <button
                  key={i}
                  className="w-7 h-7 border border-[#24242E] text-[#6B7280] hover:border-[#F59E0B]/50 hover:text-[#F59E0B] transition-colors flex items-center justify-center text-xs"
                >
                  {arrow}
                </button>
              ))}
            </div>
          </div>

          <h2
            className="font-black uppercase tracking-wide text-[#F5F5F5] mb-8"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}
          >
            CHOOSE YOUR <em className="not-italic text-[#F59E0B]/80">SPORT</em>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SPORT_MODULES.map((sport, idx) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Link href={`/sports?sport=${sport.id}`}>
                  <div className="group border border-[#24242E] bg-[#111114] hover:border-[#F59E0B]/40 transition-all duration-200 cursor-pointer overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sport.img}
                        alt={sport.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/15 transition-colors" />
                      <div className="absolute top-2 left-2 border border-[#F59E0B]/60 bg-black/60 px-1.5 py-0.5">
                        <span className="text-[9px] font-bold text-[#F59E0B]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          MODE: {sport.mode}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-black uppercase tracking-wider text-[#F5F5F5] text-sm mb-0.5"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        {sport.name}
                      </h3>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {sport.sub}
                      </p>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-[#6B7280] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            Model Depth
                          </span>
                          <span className="text-[10px] font-bold text-[#F59E0B]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {sport.load}%
                          </span>
                        </div>
                        <div className="h-px bg-[#24242E]">
                          <motion.div
                            className="h-full bg-[#F59E0B]"
                            initial={{ width: 0 }}
                            animate={{ width: `${sport.load}%` }}
                            transition={{ duration: 0.9, delay: 0.4 + idx * 0.1 }}
                          />
                        </div>
                      </div>
                      <button
                        className="w-full py-2 border border-[#24242E] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest group-hover:border-[#F59E0B]/50 group-hover:text-[#F59E0B] transition-all flex items-center justify-center gap-2"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        ANALYSE NOW
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ FEATURE COLUMNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-[#24242E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#24242E]">
            {FEATURES.map((feat, idx) => (
              <motion.div
                key={feat.title}
                className="p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                {/* Icon badge */}
                <div className="w-10 h-10 border border-[#F59E0B]/40 bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] mb-5">
                  {feat.icon}
                </div>
                <h3
                  className="text-lg font-black uppercase tracking-wide text-[#F5F5F5] mb-3"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {feat.title}
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed mb-5">{feat.body}</p>
                <ul className="space-y-1.5">
                  {feat.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs text-[#6B7280] uppercase tracking-wide"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      <span className="text-[#F59E0B]">â€”</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {/* â”€â”€ FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <footer className="bg-[#080809] border-t border-[#24242E] pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[#F59E0B] flex items-center justify-center">
                  <span className="text-black text-xs font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>SS</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black uppercase tracking-widest text-[#F5F5F5]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>SkillScan</span>
                  <span className="text-sm font-black uppercase tracking-widest text-[#F59E0B]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>AI</span>
                </div>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-[200px]">
                AI-powered sports form analysis. Record, score, and improve your technique with real-time pose detection and a personal Gemini AI coach.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  <path key="rss" d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />,
                  <path key="share" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />,
                  <circle key="globe" cx="12" cy="12" r="10" />,
                ].map((d, i) => (
                  <button key={i} className="w-7 h-7 border border-[#24242E] flex items-center justify-center text-[#6B7280] hover:border-[#F59E0B]/40 hover:text-[#F59E0B] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{d}</svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {FOOTER_COLS.map((col) => (
              <div key={col.heading}>
                <h4
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B] mb-4"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {col.heading}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-[#6B7280] hover:text-[#9CA3AF] uppercase tracking-wide transition-colors"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#24242E] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p
              className="text-[10px] text-[#4B5563] uppercase tracking-wide"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              © 2026 SkillScan AI • POWERED BY GEMINI 2.0 FLASH • MEDIAPIPE POSE
            </p>
            <div className="flex items-center gap-4">
              {['MEDIAPIPE: ACTIVE', 'GEMINI 2.0 FLASH', 'LANDMARKS: 33'].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold uppercase tracking-widest text-[#4B5563]"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {tag}
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#22c55e]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ONLINE
                </span>
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
