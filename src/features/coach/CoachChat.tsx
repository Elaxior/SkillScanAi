/**
 * CoachChat — Full AI Coach conversation panel
 *
 * Renders the chat history, loading indicator, error state, and the
 * text input area. Designed to drop into the Results Dashboard below
 * the history section.
 *
 * Receives all session data as props — the hook serialises them into
 * the LLM context internally so this component stays declarative.
 */

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DetectedFlaw } from '@/features/flaws';
import { Card } from '@/components/ui';
import { CoachMessage } from './CoachMessage';
import { useCoach } from './useCoach';

interface CoachChatProps {
    sport: string;
    action: string;
    score: number;
    metrics: Record<string, number | null>;
    scoreBreakdown: Record<string, number>;
    flaws: DetectedFlaw[];
}

export function CoachChat({
    sport,
    action,
    score,
    metrics,
    scoreBreakdown,
    flaws,
}: CoachChatProps) {
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    const { messages, isLoading, error, sendMessage, clearError, retryInitial } = useCoach({
        sport,
        action,
        score,
        metrics,
        scoreBreakdown,
        flaws,
    });

    // Auto-scroll chat container (not the page) when messages or loading state change
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        const text = draft.trim();
        if (!text || isLoading) return;
        setDraft('');
        await sendMessage(text);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Shift+Enter = new line, Enter alone = send
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    // Filter out system messages — only show user + assistant turns
    const visibleMessages = messages.filter((m) => m.role !== 'system');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pt-8 border-t border-gray-800"
        >
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-full" />
                <h2 className="text-lg font-semibold text-white">AI Coach</h2>
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Beta
                </span>
            </div>

            <Card className="flex flex-col overflow-hidden border-gray-700/50 bg-gray-900/60">
                {/* Message Area */}
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[220px] max-h-[420px]">
                    {/* Empty state — while the opening message loads */}
                    {visibleMessages.length === 0 && !isLoading && !error && (
                        <div className="flex items-center justify-center h-full py-8">
                            <p className="text-sm text-gray-500">Analysing your session…</p>
                        </div>
                    )}

                    {/* Empty + error state — show retry button */}
                    {visibleMessages.length === 0 && !isLoading && error && (
                        <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
                            <p className="text-sm text-red-400">{error}</p>
                            <button
                                onClick={() => { clearError(); retryInitial(); }}
                                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {visibleMessages.map((msg, idx) => (
                            <CoachMessage key={idx} message={msg} />
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px]">🤖</span>
                            </div>
                            <div className="bg-gray-800 border border-gray-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                                {[0, 0.15, 0.3].map((delay) => (
                                    <motion.span
                                        key={delay}
                                        className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity, delay }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Error state — only show inline when conversation is already in progress */}
                    {error && visibleMessages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-2 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3"
                        >
                            <span className="text-red-400 mt-0.5">⚠</span>
                            <div className="flex-1">
                                <p className="text-sm text-red-300">{error}</p>
                                <button
                                    onClick={clearError}
                                    className="mt-1 text-xs text-red-400 underline hover:text-red-300"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    )}


                </div>

                {/* Separator */}
                <div className="border-t border-gray-700/50" />

                {/* Input Row */}
                <div className="px-4 py-3 flex items-end gap-3">
                    <textarea
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Ask your coach anything… (Enter to send)"
                        rows={1}
                        className="flex-1 resize-none bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors leading-relaxed"
                        style={{ minHeight: '42px', maxHeight: '120px' }}
                    />

                    <button
                        onClick={() => void handleSend()}
                        disabled={!draft.trim() || isLoading}
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </Card>

            <p className="mt-2 text-[11px] text-gray-600 text-center">
                AI Coach uses only your session data — it does not invent metrics or scores.
            </p>
        </motion.div>
    );
}
