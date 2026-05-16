/**
 * OWNER: P3 (AI)
 * Router Agent — classifies a student question into one of 4 routes.
 */
import { claude, cachedSystem, MODELS, withRetry } from './claude';
import { ROUTER_SYSTEM_PROMPT } from './prompts/router';
import type { RouterDecision } from '../shared/types';

export async function routeQuestion(question: string): Promise<RouterDecision> {
  const res = await withRetry(() =>
    claude().messages.create({
      model: MODELS.SMALL,
      max_tokens: 200,
      system: cachedSystem(ROUTER_SYSTEM_PROMPT),
      messages: [{ role: 'user', content: `<question>${question}</question>` }],
    }),
  );
  const text = res.content.find((b) => b.type === 'text')?.text ?? '';
  return parseRouterJson(text);
}

function parseRouterJson(text: string): RouterDecision {
  // Strip possible markdown fences defensively, then parse.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    const obj = JSON.parse(cleaned) as RouterDecision;
    if (!obj.route || typeof obj.confidence !== 'number') {
      throw new Error('Missing fields in router output');
    }
    return obj;
  } catch (err) {
    // Conservative fallback — defer to teacher on parse failure.
    return {
      route: 'teacher',
      confidence: 0.5,
      reasoning: `Router parse error: ${(err as Error).message}`,
    };
  }
}
