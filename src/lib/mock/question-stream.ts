/**
 * OWNER: P1 (Frontend)
 * Simulates POST /api/lectures/:id/questions SSE for mock mode.
 */
import type { Dispatch, SetStateAction } from 'react';
import type { AgentName, AgentState, Citation, QuestionStatus } from '@shared/types';
import type { QuestionStreamState } from '@/hooks/useQuestionStream';
import { addQuestion, delay } from './store';

const MOCK_ANSWER =
  'Lambda (α) büyüdükçe L2 cezası katsayıları daha güçlü küçültür; model daha basit kalır ve varyans azalır. Çok büyük λ underfitting yapabilir — bias artar.';

const MOCK_CITATIONS: Citation[] = [
  {
    source_type: 'note',
    reference: 'sayfa 2',
    snippet: 'Ridge regresyon λ ile katsayı normunu cezalandırır.',
    chunk_id: 'mock-chunk-note-2',
  },
  {
    source_type: 'transcript',
    reference: '03:42',
    snippet: 'Lambda büyüdükçe katsayılar sıfıra yaklaşır.',
    chunk_id: 'mock-chunk-tr-1',
  },
];

export async function runMockQuestionStream(
  lectureId: string,
  studentSessionId: string,
  questionText: string,
  setState: Dispatch<SetStateAction<QuestionStreamState>>,
): Promise<void> {
  const agents: Array<{ agent: AgentName; ms: number }> = [
    { agent: 'router', ms: 400 },
    { agent: 'retrieval', ms: 500 },
    { agent: 'answer', ms: 600 },
    { agent: 'flagger', ms: 350 },
  ];

  for (const { agent, ms } of agents) {
    setState((s) => ({
      ...s,
      agentTicks: [...s.agentTicks, { agent, state: 'running' as AgentState }],
    }));
    await delay(ms);
    setState((s) => ({
      ...s,
      agentTicks: [...s.agentTicks, { agent, state: 'done' as AgentState }],
    }));
  }

  const words = MOCK_ANSWER.split(' ');
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
    setState((s) => ({ ...s, text: s.text + chunk }));
    await delay(60);
  }

  for (const citation of MOCK_CITATIONS) {
    setState((s) => ({ ...s, citations: [...s.citations, citation] }));
    await delay(100);
  }

  const q = addQuestion(lectureId, studentSessionId, questionText, {
    status: 'answered_by_ai',
    aiAnswer: MOCK_ANSWER,
    citations: MOCK_CITATIONS,
    confidence: 0.88,
  });

  setState((s) => ({
    ...s,
    status: 'done',
    finalQuestionId: q.id,
    finalStatus: 'answered_by_ai' as QuestionStatus,
  }));
}
