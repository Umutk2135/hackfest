/**
 * OWNER: P1 (Frontend)
 * Posts a question and consumes the SSE stream from /api/lectures/:id/questions.
 */
import { useCallback, useState } from 'react';
import { streamSse } from '@/lib/sse';
import { askQuestionPath, isMockApi } from '@/lib/api';
import { runMockQuestionStream } from '@/lib/mock/question-stream';
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

function isAgentName(v: unknown): v is AgentName {
  return (
    v === 'router' ||
    v === 'retrieval' ||
    v === 'answer' ||
    v === 'flagger' ||
    v === 'feedback'
  );
}

function isAgentState(v: unknown): v is AgentState {
  return v === 'running' || v === 'done' || v === 'error';
}

function isCitation(v: unknown): v is Citation {
  if (!v || typeof v !== 'object') return false;
  const c = v as Citation;
  return (
    (c.source_type === 'note' || c.source_type === 'transcript') &&
    typeof c.reference === 'string' &&
    typeof c.snippet === 'string' &&
    typeof c.chunk_id === 'string'
  );
}

export function useQuestionStream(lectureId: string) {
  const [state, setState] = useState<QuestionStreamState>(INITIAL);

  const ask = useCallback(
    async (studentSessionId: string, questionText: string) => {
      setState({ ...INITIAL, status: 'streaming' });

      if (isMockApi) {
        await runMockQuestionStream(lectureId, studentSessionId, questionText, setState);
        return;
      }

      try {
        const res = await fetch(askQuestionPath(lectureId), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ studentSessionId, questionText }),
        });
        if (!res.ok || !res.body) {
          const message = await readErrorMessage(res);
          setState((s) => ({ ...s, status: 'error', errorMessage: message }));
          return;
        }

        for await (const evt of streamSse(res.body)) {
          const data = safeJson(evt.data);
          if (evt.event === 'status' && isAgentName(data.agent) && isAgentState(data.state)) {
            const agent = data.agent;
            const agentState = data.state;
            setState((s) => ({
              ...s,
              agentTicks: [...s.agentTicks, { agent, state: agentState, extra: data }],
            }));
          } else if (evt.event === 'token' && typeof data.text === 'string') {
            setState((s) => ({ ...s, text: s.text + data.text }));
          } else if (evt.event === 'citation' && isCitation(data)) {
            setState((s) => ({ ...s, citations: [...s.citations, data] }));
          } else if (evt.event === 'done') {
            setState((s) => ({
              ...s,
              status: 'done',
              finalQuestionId: typeof data.questionId === 'string' ? data.questionId : null,
              finalStatus:
                data.status === 'pending' ||
                data.status === 'answered_by_ai' ||
                data.status === 'flagged_for_teacher' ||
                data.status === 'answered_by_teacher'
                  ? data.status
                  : null,
            }));
          } else if (evt.event === 'error') {
            setState((s) => ({
              ...s,
              status: 'error',
              errorMessage: typeof data.message === 'string' ? data.message : 'error',
            }));
          }
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          status: 'error',
          errorMessage: (err as Error).message || 'Soru gönderilemedi.',
        }));
      }
    },
    [lectureId],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  return { state, ask, reset };
}

function safeJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    const parsed = text ? (JSON.parse(text) as { error?: { message?: string } }) : null;
    return parsed?.error?.message ?? `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}
