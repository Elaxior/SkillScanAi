'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import { useAuth } from '@/features/auth/useAuth'
import { AuthModal } from '@/features/auth/AuthModal'

// ==========================================
// NAV LINKS (mapped to app routes)
// ==========================================

const navLinks = [
  { href: '/history', label: 'Analysis' },
  { href: '/sports', label: 'Scouting' },
  { href: '/camera', label: 'Biometrics' },
]

// ==========================================
// SYSTEM CLOCK (client-side only)
// ==========================================

function SystemClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = () => {
      const now = new Date()
      return now.toUTCString().split(' ').slice(4, 5)[0] + ' UTC'
    }
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className="text-xs text-text-secondary tabular-nums"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      {time || 'â€“â€“:â€“â€“:â€“â€“ UTC'}
    </span>
  )
}

// ==========================================
// USER MENU (auth-aware)
// ==========================================

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')

  function openAuth(tab: 'login' | 'register') {
    setAuthTab(tab)
    setAuthOpen(true)
    setOpen(false)
  }

  // Avatar initials
  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email
      ? user.email[0].toUpperCase()
      : 'U'

  return (
    <>
      <div className="relative">
        {isAuthenticated ? (
          /* Logged-in: avatar button â†’ dropdown */
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 group"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-black text-xs font-black select-none">
              {initials}
            </div>
          </button>
        ) : (
          /* Logged-out: profile icon â†’ opens auth */
          <button
            onClick={() => openAuth('login')}
            className="p-1.5 text-text-tertiary hover:text-primary-400 transition-colors"
            aria-label="Sign in"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        )}

        {/* Dropdown (authenticated) */}
        {open && isAuthenticated && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#0D0D0F] border border-[#24242E] rounded-lg shadow-2xl z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-[#24242E]">
                <p className="text-xs font-bold text-white truncate">
                  {user?.displayName || 'Athlete'}
                </p>
                <p className="text-[10px] text-[#6B6B7A] truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              {/* Links */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A0A0B0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Profile & Settings
                </Link>
                <Link
                  href="/history"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#A0A0B0] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Analysis History
                </Link>
              </div>
              {/* Sign out */}
              <div className="border-t border-[#24242E] py-1">
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Auth modal (rendered at this level so it's in the portal) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  )
}

// ==========================================
// NAVBAR COMPONENT
// ==========================================

export default function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-[#080809] border-b border-[#24242E]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* â”€â”€ Logo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-primary-500 flex items-center justify-center transition-all group-hover:shadow-glow-gold-sm">
              <span className="text-black text-xs font-black tracking-tight"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                SS
              </span>
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span
                className="text-base font-black uppercase tracking-widest text-text-primary"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                SkillScan
              </span>
              <span
                className="text-base font-black uppercase tracking-widest text-primary-500"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                AI
              </span>
            </div>
          </Link>

          {/* â”€â”€ Nav Links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hidden md:flex items-center gap-0">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-150',
                    'hover:text-primary-400',
                    active
                      ? 'text-primary-500'
                      : 'text-text-tertiary',
                  )}
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-500" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* â”€â”€ Right Side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex items-center gap-4 shrink-0">
            {/* System online indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success-400 animate-blink" />
              <span
                className="text-xs text-text-tertiary uppercase tracking-widest"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                SYSTEM: ONLINE
              </span>
            </div>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <SystemClock />
            </div>

            {/* Settings icon â†’ /settings */}
            <Link
              href="/settings"
              className="p-1.5 text-text-tertiary hover:text-primary-400 transition-colors"
              aria-label="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>

            {/* User / Auth */}
            <UserMenu />

            {/* Mobile nav */}
            <div className="md:hidden flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs font-bold uppercase tracking-wider transition-colors px-2 py-1',
                    pathname.startsWith(link.href)
                      ? 'text-primary-500'
                      : 'text-text-tertiary hover:text-primary-400',
                  )}
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {link.label.substring(0, 4)}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </nav>

      {/* Bottom border accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-600/30 to-transparent" />
    </header>
  )
}
