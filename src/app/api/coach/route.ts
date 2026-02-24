/**
 * AI Coach API Route — POST /api/coach
 *
 * Server-side only. GEMINI_API_KEY is never exposed to the browser bundle.
 * Receives the full conversation history and returns the next assistant message.
 *
 * Security notes:
 * - Key read from process.env (no NEXT_PUBLIC_ prefix → server only)
 * - Input validated before forwarding to Gemini
 * - Errors are caught and returned as structured JSON with appropriate HTTP codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CoachMessage, CoachRequestBody } from '@/features/coach/coachTypes';

const SYSTEM_PROMPT = `You are an expert sports performance coach and biomechanics analyst embedded in SkillScan AI.

Your role:
- Analyze the athlete's session data provided at the start of the conversation
- Give specific, actionable coaching advice grounded ONLY in the data provided
- Never invent metrics, scores, or measurements not present in the data
- Use encouraging, professional language — like a real coach, not a textbook
- Keep responses concise (2-4 sentences for simple answers, up to 6 for detailed ones)
- Prioritize injury-risk flaws with urgency
- If asked about something not in the data, say so clearly rather than guessing

You have access to: overall score, per-component score breakdown, measured biomechanics metrics, and detected technique flaws with correction cues.`;

const MAX_HISTORY = 10;

export async function POST(req: NextRequest) {
    // Validate API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'AI Coach is not configured. Please add GEMINI_API_KEY to your environment.' },
            { status: 503 }
        );
    }

    // Parse and validate request body
    let body: CoachRequestBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { messages } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // Trim to last N non-system messages
    const nonSystemMessages = messages.filter((m: CoachMessage) => m.role !== 'system');
    const trimmedMessages = nonSystemMessages.slice(-MAX_HISTORY);

    // Build Gemini chat history — all turns except the last (that becomes the prompt)
    // Gemini roles: 'user' | 'model'
    const history = trimmedMessages.slice(0, -1).map((m: CoachMessage) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
    }));

    const lastMessage = trimmedMessages[trimmedMessages.length - 1];
    if (!lastMessage) {
        return NextResponse.json({ error: 'No user message found.' }, { status: 400 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({
            history,
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 350,
            },
        });

        const result = await chat.sendMessage(lastMessage.content);
        const reply = result.response.text().trim();

        if (!reply) {
            return NextResponse.json({ error: 'Empty response from AI.' }, { status: 502 });
        }

        return NextResponse.json({ message: reply });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';

        if (message.includes('API_KEY_INVALID') || message.includes('401')) {
            return NextResponse.json(
                { error: 'Invalid Gemini API key. Check your GEMINI_API_KEY setting.' },
                { status: 401 }
            );
        }
        if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
            return NextResponse.json(
                { error: 'Rate limit reached. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        console.error('[/api/coach] Unexpected error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
