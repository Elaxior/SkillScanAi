/**
 * CoachMessage — Single message bubble in the AI Coach chat
 *
 * User messages are right-aligned with a blue accent.
 * Assistant messages are left-aligned with a dark-gray card.
 * Framer Motion provides a subtle fade+slide entrance.
 *
 * Includes a lightweight inline markdown renderer so the local coach
 * engine's **bold**, bullet lists, and section headers display correctly.
 */

'use client';

import { memo, Fragment } from 'react';
import { motion } from 'framer-motion';
import type { CoachMessage as CoachMessageType } from './coachTypes';

interface CoachMessageProps {
    message: CoachMessageType;
}

// ─── Lightweight inline markdown → JSX ───────────────────────────────────────

/** Render inline **bold** markers within a single line of text */
function renderInline(text: string): React.ReactNode {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1
            ? <strong key={i} className="font-semibold text-white">{part}</strong>
            : <Fragment key={i}>{part}</Fragment>
    );
}

/** Render a full assistant message with basic markdown formatting */
function renderMarkdown(content: string): React.ReactNode {
    const lines = content.split('\n');
    const nodes: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        const trimmed = line.trim();

        // Empty line → vertical spacer
        if (trimmed === '') {
            nodes.push(<div key={i} className="h-1.5" />);
            return;
        }

        // Bullet lines: •, *, -  (but not --- dividers)
        if (/^[•\*\-]\s+/.test(trimmed) && !/^---/.test(trimmed)) {
            const text = trimmed.replace(/^[•\*\-]\s+/, '');
            nodes.push(
                <div key={i} className="flex items-start gap-1.5 pl-1">
                    <span className="mt-[3px] text-violet-400 flex-shrink-0 text-xs">•</span>
                    <span>{renderInline(text)}</span>
                </div>
            );
            return;
        }

        // Numbered lines: 1. 2. 3.
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
            nodes.push(
                <div key={i} className="flex items-start gap-1.5 pl-1">
                    <span className="mt-[1px] text-violet-400 flex-shrink-0 font-mono text-xs min-w-[14px]">{numberedMatch[1]}.</span>
                    <span>{renderInline(numberedMatch[2])}</span>
                </div>
            );
            return;
        }

        // Divider ---
        if (/^---+$/.test(trimmed)) {
            nodes.push(<hr key={i} className="border-gray-700 my-1" />);
            return;
        }

        // Arrow lines → 
        if (trimmed.startsWith('→')) {
            nodes.push(
                <div key={i} className="flex items-start gap-1.5 pl-1 text-amber-300/90">
                    <span className="flex-shrink-0">→</span>
                    <span>{renderInline(trimmed.slice(1).trim())}</span>
                </div>
            );
            return;
        }

        // Normal line (may contain inline **bold**)
        nodes.push(<div key={i}>{renderInline(trimmed)}</div>);
    });

    return <div className="space-y-0.5">{nodes}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────

function CoachMessageComponent({ message }: CoachMessageProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {/* Avatar — coach side only */}
            {!isUser && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-[11px]">🤖</span>
                </div>
            )}

            <div
                className={`
          max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-100 border border-gray-700/60 rounded-tl-sm'
                    }
        `}
            >
                {isUser
                    ? message.content
                    : renderMarkdown(message.content)
                }
            </div>
        </motion.div>
    );
}

export const CoachMessage = memo(CoachMessageComponent);
