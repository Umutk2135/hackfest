# Architecture (one-page summary)

The full diagrams + agent details live in the plan:
`/Users/AhmetKilic/.claude/plans/claude-code-plan-unified-knuth.md` (Sections 2, 3, 5, 7)

## One-paragraph version

The browser produces transcript text (`useSpeechRecognition` → tr-TR) and POSTs segments every ~3 seconds to Netlify Functions, which write them to `transcript_segments`. A debounced background function batch-embeds them with Voyage (1024d) into pgvector. When a student asks a question via SSE, the orchestrator runs: **Router** (Sonnet 4.6 — classifies into rag/live_transcript/teacher/out_of_scope) → **Retrieval** (top-K cosine over notes + transcript) → **Answer** (Opus 4.7, has `search_more_context` tool for up to 2 extra retrievals, must cite chunk_ids verbatim — citations are server-validated to prevent hallucination) → **Flagger** (Sonnet 4.6 — escalates to the teacher panel if confidence < 0.7 or context was empty). At lecture end, a 15-minute background function loads transcript + notes + Q&A and asks Opus 4.7 to produce a structured pedagogical report; the UI polls 202→200.

## Files to read in order, if you're new

1. `shared/types.ts` — the contract
2. `db/schema.ts` + `db/migrations/0000_initial.sql`
3. `agents/index.ts` (orchestrator) → `router.ts` → `retrieval.ts` → `answer.ts` → `flagger.ts`
4. `netlify/functions/question-ask.ts` (the SSE endpoint that wires the above to the browser)
5. `src/hooks/useQuestionStream.ts` (the browser consumer)
6. `src/pages/TeacherLectureLive.tsx` + `StudentLectureLive.tsx` (the demo UI)
