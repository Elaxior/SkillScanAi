/**
 * useCoach — AI Coach Conversation Hook
 *
 * Fully local — no API key, no network calls, instant responses.
 * Generates rich, context-aware coaching feedback from the real session
 * data using the localCoachEngine. Every response references actual
 * numbers from the analysis so nothing is hallucinated.
 *
 * Architecture:
 * - Opening message: generated from session data via generateOpeningMessage
 * - Follow-up replies: intent-classified and routed via generateReply
 * - Simulated 400–700ms typing delay for natural UX feel
 * - All state is component-local (ephemeral per session)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { DetectedFlaw } from '@/features/flaws';
import { buildCoachContext } from './buildCoachContext';
import { generateOpeningMessage, generateReply } from './localCoachEngine';
import type { CoachMessage } from './coachTypes';

interface UseCoachArgs {
    sport: string;
    action: string;
    score: number;
    confidence?: number;
    metrics: Record<string, number | null>;
    scoreBreakdown: Record<string, number>;
    flaws: DetectedFlaw[];
}

interface UseCoachReturn {
    messages: CoachMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    clearError: () => void;
    retryInitial: () => void;
}

/** Simulates a natural "thinking" pause (400–700 ms) */
function thinkingDelay(): Promise<void> {
    const ms = 400 + Math.random() * 300;
    return new Promise((r) => setTimeout(r, ms));
}

export function useCoach({
    sport,
    action,
    score,
    confidence = 95,
    metrics,
    scoreBreakdown,
    flaws,
}: UseCoachArgs): UseCoachReturn {
    const [messages, setMessages] = useState<CoachMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Build context once — stable ref so the opening effect only fires once
    const ctxRef = useRef(buildCoachContext({ sport, action, score, confidence, metrics, scoreBreakdown, flaws }));

    useEffect(() => {
        let cancelled = false;

        async function showOpening() {
            setIsLoading(true);
            await thinkingDelay();
            if (cancelled) return;

            const text = generateOpeningMessage(ctxRef.current);
            const assistantMsg: CoachMessage = { role: 'assistant', content: text };
            setMessages([assistantMsg]);
            setIsLoading(false);
        }

        void showOpening();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function retryInitial() {
        if (isLoading) return;
        setMessages([]);
        setError(null);
        setIsLoading(true);
        void thinkingDelay().then(() => {
            const text = generateOpeningMessage(ctxRef.current);
            setMessages([{ role: 'assistant', content: text }]);
            setIsLoading(false);
        });
    }

    async function sendMessage(text: string) {
        if (!text.trim() || isLoading) return;

        const userMsg: CoachMessage = { role: 'user', content: text.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        await thinkingDelay();

        const replyText = generateReply(text.trim(), ctxRef.current);
        const assistantMsg: CoachMessage = { role: 'assistant', content: replyText };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);
    }

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearError: () => setError(null),
        retryInitial,
    };
}
