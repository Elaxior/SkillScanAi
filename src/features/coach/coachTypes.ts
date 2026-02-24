/**
 * AI Coach Type Definitions
 *
 * These types define the data structures for the hybrid AI coach feature.
 * The coach receives pre-computed metrics/flaws from our engine — it never
 * computes values itself, preventing hallucination.
 */

/**
 * Structured context passed to the LLM as the grounding system message.
 * Built once per session from the analysis output.
 */
export interface CoachContext {
    sport: string;
    action: string;
    overallScore: number;
    metrics: Record<string, number | null>;
    scoreBreakdown: Record<string, number>;
    flaws: {
        id: string;
        title: string;
        severity: string;
        injuryRisk: boolean;
        correction: string;
        category: string;
    }[];
}

/**
 * A single message in the coach conversation.
 * Mirrors OpenAI's chat message structure.
 */
export interface CoachMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Request body sent to /api/coach
 */
export interface CoachRequestBody {
    messages: CoachMessage[];
}

/**
 * Successful response from /api/coach
 */
export interface CoachResponse {
    message: string;
}

/**
 * Error response from /api/coach
 */
export interface CoachErrorResponse {
    error: string;
}
