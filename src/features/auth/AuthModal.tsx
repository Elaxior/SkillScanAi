'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './useAuth'

// ============================================================================
// TYPES
// ============================================================================

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    /** Which tab to start on */
    defaultTab?: 'login' | 'register'
}

// ============================================================================
// GOOGLE ICON
// ============================================================================

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

// ============================================================================
// AUTH MODAL
// ============================================================================

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
    const { login, register, loginWithGoogle, error, clearError, isLoading } = useAuth()
    const [tab, setTab] = useState<'login' | 'register'>(defaultTab)

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    const firstInputRef = useRef<HTMLInputElement>(null)

    // Focus first input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => firstInputRef.current?.focus(), 150)
        }
    }, [isOpen])

    // Keep tab in sync with prop
    useEffect(() => {
        setTab(defaultTab)
    }, [defaultTab])

    function resetForm() {
        setEmail('')
        setPassword('')
        setDisplayName('')
        setLocalError(null)
        clearError()
    }

    function switchTab(t: 'login' | 'register') {
        resetForm()
        setTab(t)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLocalError(null)

        if (!email.trim()) return setLocalError('Email is required.')
        if (!password) return setLocalError('Password is required.')
        if (tab === 'register' && password.length < 6) return setLocalError('Password must be at least 6 characters.')

        setSubmitting(true)
        let ok: boolean

        if (tab === 'login') {
            ok = await login(email.trim(), password)
        } else {
            ok = await register(email.trim(), password, displayName.trim() || undefined)
        }

        setSubmitting(false)
        if (ok) {
            resetForm()
            onClose()
        }
    }

    async function handleGoogle() {
        setLocalError(null)
        clearError()
        setSubmitting(true)
        const ok = await loginWithGoogle()
        setSubmitting(false)
        if (ok) {
            resetForm()
            onClose()
        }
    }

    const displayedError = localError || error

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -16 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-sm bg-[#0D0D0F] border border-[#24242E] rounded-xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#24242E]">
                                <div>
                                    <h2
                                        className="text-xl font-black uppercase tracking-widest text-white"
                                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                                    >
                                        {tab === 'login' ? 'Sign In' : 'Create Account'}
                                    </h2>
                                    <p className="text-xs text-[#6B6B7A] mt-0.5">
                                        {tab === 'login' ? 'Access your analysis history' : 'Save your sessions to the cloud'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-[#6B6B7A] hover:text-white transition-colors rounded"
                                    aria-label="Close"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Tab switcher */}
                            <div className="flex border-b border-[#24242E]">
                                {(['login', 'register'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => switchTab(t)}
                                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${tab === t
                                                ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
                                                : 'text-[#6B6B7A] hover:text-white'
                                            }`}
                                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                                    >
                                        {t === 'login' ? 'Sign In' : 'Register'}
                                    </button>
                                ))}
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-4">
                                {/* Google sign-in */}
                                <button
                                    onClick={handleGoogle}
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-[#24242E] bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-[#24242E]" />
                                    <span className="text-[#6B6B7A] text-xs">or</span>
                                    <div className="flex-1 h-px bg-[#24242E]" />
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {tab === 'register' && (
                                        <div>
                                            <label className="block text-xs text-[#6B6B7A] mb-1.5 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                Display Name (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Your name"
                                                className="w-full bg-[#14141A] border border-[#24242E] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4A4A5A] focus:outline-none focus:border-[#F59E0B] transition-colors"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-[#6B6B7A] mb-1.5 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            Email
                                        </label>
                                        <input
                                            ref={firstInputRef}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="athlete@example.com"
                                            autoComplete="email"
                                            className="w-full bg-[#14141A] border border-[#24242E] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4A4A5A] focus:outline-none focus:border-[#F59E0B] transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-[#6B6B7A] mb-1.5 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={tab === 'register' ? 'At least 6 characters' : '••••••••'}
                                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                            className="w-full bg-[#14141A] border border-[#24242E] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4A4A5A] focus:outline-none focus:border-[#F59E0B] transition-colors"
                                        />
                                    </div>

                                    {/* Error */}
                                    <AnimatePresence>
                                        {displayedError && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2"
                                            >
                                                {displayedError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-2.5 rounded-lg bg-[#F59E0B] text-black text-sm font-bold uppercase tracking-widest hover:bg-[#f7b731] transition-colors disabled:opacity-60"
                                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                                    >
                                        {submitting
                                            ? 'Please wait…'
                                            : tab === 'login'
                                                ? 'Sign In'
                                                : 'Create Account'}
                                    </button>
                                </form>

                                {/* Switch CTA */}
                                <p className="text-center text-xs text-[#6B6B7A]">
                                    {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                    <button
                                        onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                                        className="text-[#F59E0B] hover:underline font-semibold"
                                    >
                                        {tab === 'login' ? 'Register' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
