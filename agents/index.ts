/**
 * OWNER: P3 (AI)
 * Orchestrator: Router → Retrieval → Answer → Flagger.
 *
 * Consumed by netlify/functions/question-ask.ts which converts each yielded event
 * into an SSE message for the browser.
 */
import { routeQuestion } from './router';
import { retrieve, type RetrievedChunk } from './retrieval';
import { answerQuestion, type AnswerResult } from './answer';
import { reviewAnswer, type FlagDecision } from './flagger';
import type { AgentName, AgentState, Citation, RouterDecision } from '../shared/types';

export type OrchestratorEvent =
  | { type: 'status'; agent: AgentName; state: AgentState; payload?: Record<string, unknown> }
  | { type: 'answer'; result: AnswerResult; routerDecision: RouterDecision; flag: FlagDecision }
  | { type: 'decline'; reason: string }
  | { type: 'forward_to_teacher'; routerDecision: RouterDecision };

export async function* orchestrate(
  lectureId: string,
  question: string,
): AsyncGenerator<OrchestratorEvent> {
  // 1) Router
  yield { type: 'status', agent: 'router', state: 'running' };
  let router = await routeQuestion(question);
  let prefetchedChunks: RetrievedChunk[] | null = null;

  if (router.route === 'teacher' || router.route === 'out_of_scope') {
    const probeChunks = await retrieve(lectureId, question, { k: 5, minScore: 0.3 });
    if (probeChunks.length > 0) {
      router = {
        route: 'rag',
        confidence: Math.max(router.confidence, 0.6),
        reasoning: 'Question matched lecture materials during retrieval probe.',
      };
      prefetchedChunks = probeChunks;
    }
  }

  yield {
    type: 'status',
    agent: 'router',
    state: 'done',
    payload: { route: router.route, confidence: router.confidence },
  };

  if (router.route === 'out_of_scope') {
    yield {
      type: 'decline',
      reason:
        'Bu soru bu dersin kapsamı dışında. Lütfen dersle ilgili bir soru sorun.',
    };
    return;
  }
  if (router.route === 'teacher') {
    yield { type: 'forward_to_teacher', routerDecision: router };
    return;
  }

  // 2) Retrieval
  yield { type: 'status', agent: 'retrieval', state: 'running' };
  const chunks: RetrievedChunk[] =
    prefetchedChunks ??
    (await retrieve(lectureId, question, {
      transcriptOnly: router.route === 'live_transcript',
    }));
  yield {
    type: 'status',
    agent: 'retrieval',
    state: 'done',
    payload: { chunks_found: chunks.length },
  };

  // 3) Answer
  yield { type: 'status', agent: 'answer', state: 'running' };
  const answer = await answerQuestion(lectureId, question, chunks);
  yield {
    type: 'status',
    agent: 'answer',
    state: 'done',
    payload: { confidence: answer.confidence },
  };

  // 4) Flagger
  yield { type: 'status', agent: 'flagger', state: 'running' };
  const flag = await reviewAnswer({
    question,
    answer: answer.answer,
    confidence: answer.confidence,
    contextWasEmpty: answer.contextWasEmpty,
  });
  yield {
    type: 'status',
    agent: 'flagger',
    state: 'done',
    payload: { escalated: flag.escalate },
  };

  yield { type: 'answer', result: answer, routerDecision: router, flag };
}

export type { AnswerResult, FlagDecision, Citation };
