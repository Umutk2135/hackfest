/**
 * OWNER: P3 (AI)
 * Flagger Agent — second-pass safety check. Decides whether to escalate to teacher.
 */
import { claude, cachedSystem, MODELS, withRetry } from './claude';
import { FLAGGER_SYSTEM_PROMPT } from './prompts/flagger';
import { xml } from './prompts/shared';
import { ANSWER_CONFIDENCE_FLAG_THRESHOLD } from '../shared/types';

export interface FlagDecision {
  escalate: boolean;
  reason: string;
}

export async function reviewAnswer(input: {
  question: string;
  answer: string;
  confidence: number;
  contextWasEmpty: boolean;
}): Promise<FlagDecision> {
  // Cheap fast path: confidence below threshold or empty context → escalate without an LLM call.
  if (input.confidence < ANSWER_CONFIDENCE_FLAG_THRESHOLD) {
    return { escalate: true, reason: 'Düşük güvenli cevap; öğretmen onayı bekleniyor.' };
  }
  if (input.contextWasEmpty) {
    return { escalate: true, reason: 'İlgili bağlam bulunamadı.' };
  }

  const res = await withRetry(() =>
    claude().messages.create({
      model: MODELS.SMALL,
      max_tokens: 120,
      system: cachedSystem(FLAGGER_SYSTEM_PROMPT),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: xml('question', input.question) },
            { type: 'text', text: xml('answer', input.answer) },
            { type: 'text', text: xml('confidence', String(input.confidence)) },
            { type: 'text', text: xml('context_was_empty', String(input.contextWasEmpty)) },
          ],
        },
      ],
    }),
  );
  const text = res.content.find((b) => b.type === 'text')?.text ?? '';
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned) as FlagDecision;
  } catch {
    return { escalate: false, reason: 'Cevap kaynaklarla destekleniyor.' };
  }
}
