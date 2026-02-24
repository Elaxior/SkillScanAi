'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import {
    onAuthStateChange,
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
    signOutUser,
} from '@/lib/firebase'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthState {
    user: User | null
    isLoading: boolean
    error: string | null
    isAuthenticated: boolean
}

export interface AuthActions {
    login: (email: string, password: string) => Promise<boolean>
    register: (email: string, password: string, displayName?: string) => Promise<boolean>
    loginWithGoogle: () => Promise<boolean>
    logout: () => Promise<void>
    clearError: () => void
}

export type UseAuthReturn = AuthState & AuthActions

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Subscribe to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChange((u) => {
            setUser(u)
            setIsLoading(false)
        })
        return unsubscribe
    }, [])

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setError(null)
        const { user: u, error: e } = await signInWithEmail(email, password)
        if (e) { setError(e); return false }
        setUser(u)
        return true
    }, [])

    const register = useCallback(async (email: string, password: string, displayName?: string): Promise<boolean> => {
        setError(null)
        const { user: u, error: e } = await registerWithEmail(email, password, displayName)
        if (e) { setError(e); return false }
        setUser(u)
        return true
    }, [])

    const loginWithGoogle = useCallback(async (): Promise<boolean> => {
        setError(null)
        const { user: u, error: e } = await signInWithGoogle()
        if (e) { setError(e); return false }
        if (u) setUser(u)
        return !!u
    }, [])

    const logout = useCallback(async () => {
        await signOutUser()
        setUser(null)
    }, [])

    const clearError = useCallback(() => setError(null), [])

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user && !user.isAnonymous,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
    }
}
