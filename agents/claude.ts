/**
 * OWNER: P3 (AI)
 * Anthropic Claude SDK wrapper. Centralizes model IDs, retries, and prompt-cache setup.
 * Per Open Question Q1 in the plan, models are: Opus 4.7 (heavy) + Sonnet 4.6 (light).
 */
import Anthropic from '@anthropic-ai/sdk';

export const MODELS = {
  /** Heavy reasoning: Answer Agent, Feedback Agent. */
  BIG: 'claude-opus-4-7' as const,
  /** Routing / classification: Router Agent, Flagger Agent. */
  SMALL: 'claude-sonnet-4-6' as const,
} as const;

let _client: Anthropic | null = null;
export function claude() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  _client = new Anthropic({ apiKey });
  return _client;
}

/**
 * Wrap a system prompt with cache_control: ephemeral so the static parts of the prompt
 * are cached across requests (huge cost + TTFT win when the same agent is called repeatedly).
 */
export function cachedSystem(text: string): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

/**
 * Lightweight retry wrapper for 429/5xx. Keep it simple — hackathon scale.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const retryable = status === 429 || status === 503 || status === 529;
      if (!retryable || i === attempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}
