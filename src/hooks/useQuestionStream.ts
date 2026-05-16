/**
 * OWNER: P1 (Frontend)
 * Posts a question and consumes the SSE stream from /api/lectures/:id/questions.
 */
import { useCallback, useState } from 'react';
import { streamSse } from '@/lib/sse';
import { askQuestionPath } from '@/lib/api';
import type { AgentName, AgentState, Citation, QuestionStatus } from '@shared/types';

export interface AgentTick {
  agent: AgentName;
  state: AgentState;
  extra?: Record<string, unknown>;
}

export interface QuestionStreamState {
  status: 'idle' | 'streaming' | 'done' | 'error';
  agentTicks: AgentTick[];
  text: string;
  citations: Citation[];
  finalQuestionId: string | null;
  finalStatus: QuestionStatus | null;
  errorMessage: string | null;
}

const INITIAL: QuestionStreamState = {
  status: 'idle',
  agentTicks: [],
  text: '',
  citations: [],
  finalQuestionId: null,
  finalStatus: null,
  errorMessage: null,
};

export function useQuestionStream(lectureId: string) {
  const [state, setState] = useState<QuestionStreamState>(INITIAL);

  const ask = useCallback(
    async (studentSessionId: string, questionText: string) => {
      setState({ ...INITIAL, status: 'streaming' });

      const res = await fetch(askQuestionPath(lectureId), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ studentSessionId, questionText }),
      });
      if (!res.ok || !res.body) {
        setState((s) => ({ ...s, status: 'error', errorMessage: `${res.status}` }));
        return;
      }

      for await (const evt of streamSse(res.body)) {
        const data = safeJson(evt.data);
        if (evt.event === 'status') {
          setState((s) => ({
            ...s,
            agentTicks: [
              ...s.agentTicks,
              { agent: data.agent, state: data.state, extra: data },
            ],
          }));
        } else if (evt.event === 'token') {
          setState((s) => ({ ...s, text: s.text + (data.text ?? '') }));
        } else if (evt.event === 'citation') {
          setState((s) => ({ ...s, citations: [...s.citations, data as Citation] }));
        } else if (evt.event === 'done') {
          setState((s) => ({
            ...s,
            status: 'done',
            finalQuestionId: data.questionId,
            finalStatus: data.status,
          }));
        } else if (evt.event === 'error') {
          setState((s) => ({ ...s, status: 'error', errorMessage: data.message }));
        }
      }
    },
    [lectureId],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  return { state, ask, reset };
}

function safeJson(text: string): Record<string, unknown> & { [k: string]: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
