# CLAUDE.md — guidance for Claude Code agents in this repo

## Project

Kürsü — a live lecture platform with a multi-agent AI teaching assistant. Hackathon MVP. Turkish-first.

## Locked decisions (do not relitigate)

- **No authentication.** A `RoleSwitcher` in the header decides teacher vs student. Teacher id is hardcoded to `teacher_demo_001`. Do not add login screens, JWTs, or session cookies.
- **No websockets.** Real-time uses 2-second polling for transcript + question panel, and Server-Sent Events for answer streaming.
- **Speech is browser-side only.** Web Speech API on the teacher's browser. We never upload audio.
- **API contract lives in `shared/types.ts`.** It is the source of truth for frontend + backend + agents. Always read it before editing endpoint shapes.
- **Models**: Opus 4.7 for Answer + Feedback agents (`claude-opus-4-7`), Sonnet 4.6 for Router + Flagger (`claude-sonnet-4-6`). All centralized in `agents/claude.ts`.
- **Embeddings**: Voyage `voyage-3-large` at 1024 dimensions.
- **DB**: Netlify DB (Neon Postgres) + pgvector + HNSW indexes (already in initial migration).

## File ownership

Each file starts with `OWNER: P{1|2|3|4}`. Match the lane:
- **P1 Frontend** owns `src/**`
- **P2 Backend** owns `netlify/functions/**`, `db/**`
- **P3 AI** owns `agents/**`, `netlify/background-functions/**`
- **P4 DevOps** owns `netlify.toml`, `docs/**`, demo content

If you change a shared file (`shared/types.ts`), update the consumers in the same PR.

## Hard rules

- Do NOT hardcode user-facing strings in components — use `src/lib/i18n.ts`.
- Do NOT call Claude or Voyage from frontend code. All AI traffic goes through Netlify functions.
- Do NOT log API keys. Use `process.env.*` only inside `netlify/**` and `agents/**`.
- Validate citations against the retrieved chunk_ids set. Drop hallucinated citations (already done in `agents/answer.ts`).
- Background functions get 15 minutes, regular functions ~26 seconds — pick the right place.

## Plan

The full implementation plan lives at:
`/Users/AhmetKilic/.claude/plans/claude-code-plan-unified-knuth.md`

Read it before doing non-trivial work. It has the API table, agent prompts, demo script, risk register, and per-phase task breakdown.
