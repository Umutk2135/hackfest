/**
 * OWNER: P3 (AI)
 * Answer Agent — produces an answer + citations from retrieved context.
 * Supports tool-use: search_more_context (used at most twice).
 */
import { claude, cachedSystem, MODELS, withRetry } from './claude';
import { ANSWER_SYSTEM_PROMPT } from './prompts/answer';
import { ANSWER_TOOLS } from './tools';
import { retrieve, chunkToCitation, type RetrievedChunk } from './retrieval';
import { xml } from './prompts/shared';
import type { Citation } from '../shared/types';

export interface AnswerResult {
  answer: string;
  confidence: number;
  citations: Citation[];
  /** True when context was empty even after tool-use. Used by Flagger. */
  contextWasEmpty: boolean;
}

const MAX_TOOL_CALLS = 2;

export async function answerQuestion(
  lectureId: string,
  question: string,
  initialContext: RetrievedChunk[],
): Promise<AnswerResult> {
  let context = initialContext;
  let toolCalls = 0;

  const messages: Array<{ role: 'user' | 'assistant'; content: unknown }> = [
    { role: 'user', content: buildUserTurn(question, context) },
  ];

  // Multi-turn tool-use loop.
  for (let step = 0; step < 1 + MAX_TOOL_CALLS; step++) {
    const res = await withRetry(() =>
      claude().messages.create({
        model: MODELS.BIG,
        max_tokens: 1200,
        system: cachedSystem(ANSWER_SYSTEM_PROMPT),
        tools: ANSWER_TOOLS,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
      }),
    );

    if (res.stop_reason === 'tool_use') {
      const toolUse = res.content.find((b) => b.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use' || toolCalls >= MAX_TOOL_CALLS) {
        return forceFinal(messages, lectureId, context);
      }
      const input = toolUse.input as { query: string; k?: number };
      const moreChunks = await retrieve(lectureId, input.query, { k: input.k ?? 5 });
      context = mergeChunks(context, moreChunks);
      toolCalls++;
      messages.push({ role: 'assistant', content: res.content });
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: renderContext(moreChunks),
          },
        ],
      });
      continue;
    }

    return parseFinal(res.content as Array<{ type: string; text?: string }>, context);
  }

  return parseFinal([], context);
}

function buildUserTurn(question: string, context: RetrievedChunk[]) {
  return [
    { type: 'text', text: xml('question', question) },
    { type: 'text', text: renderContext(context) },
  ];
}

function renderContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '<context></context>';
  const inner = chunks
    .map((c) =>
      xml('chunk', c.content, {
        id: c.chunk_id,
        source: c.source_type,
        reference: c.reference,
      }),
    )
    .join('\n');
  return `<context>\n${inner}\n</context>`;
}

function mergeChunks(a: RetrievedChunk[], b: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  const out: RetrievedChunk[] = [];
  for (const c of [...a, ...b]) {
    if (!seen.has(c.chunk_id)) {
      seen.add(c.chunk_id);
      out.push(c);
    }
  }
  return out;
}

function parseFinal(
  content: Array<{ type: string; text?: string }>,
  context: RetrievedChunk[],
): AnswerResult {
  const text = content.find((b) => b.type === 'text')?.text ?? '';
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    const obj = JSON.parse(cleaned) as {
      answer: string;
      confidence: number;
      citations: Citation[];
    };
    // Keep only note citations that belong to retrieved context.
    const validIds = new Set(context.map((c) => c.chunk_id));
    const citations = (obj.citations ?? []).filter(
      (c) => c.source_type === 'note' && validIds.has(c.chunk_id),
    );
    return {
      answer: stripTranscriptReferences(obj.answer ?? ''),
      confidence: obj.confidence ?? 0,
      citations,
      contextWasEmpty: context.length === 0,
    };
  } catch {
    return {
      answer: 'Bu soruyu mevcut ders materyallerinden net olarak cevaplayamıyorum.',
      confidence: 0.2,
      citations: context.slice(0, 1).map(chunkToCitation),
      contextWasEmpty: context.length === 0,
    };
  }
}

function forceFinal(
  _messages: unknown[],
  _lectureId: string,
  context: RetrievedChunk[],
): AnswerResult {
  return {
    answer: 'Bu soruyu mevcut ders materyallerinden net olarak cevaplayamıyorum.',
    confidence: 0.3,
    citations: context.slice(0, 1).map(chunkToCitation),
    contextWasEmpty: context.length === 0,
  };
}

function stripTranscriptReferences(answer: string): string {
  return answer
    .replace(/\[Ders:\s*\d{2}:\d{2}\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}
