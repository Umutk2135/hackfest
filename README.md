# Kürsü

> AI Teaching Assistant — HSIL Hackathon 2026

Live lecture platform. The teacher speaks; the AI listens, answers student questions from the lecture notes + transcript with inline citations, and produces a pedagogical feedback report after class.

## Stack

- **Frontend**: React 18 + Vite, Tailwind v4, shadcn-style primitives, React Router 7, recharts.
- **Backend**: Netlify Functions (Node 20, TypeScript) + Netlify Background Functions.
- **DB**: Netlify DB (Neon Postgres) + pgvector (HNSW, 1024d).
- **AI**: Anthropic Claude (Opus 4.7 for Answer/Feedback, Sonnet 4.6 for Router/Flagger) + Voyage AI `voyage-3-large` embeddings.
- **Speech**: Web Speech API (`tr-TR`) on the teacher's browser.

## Quick start

```bash
npm install
cp .env.example .env.local           # then fill in keys
npm run db:migrate                   # apply db/migrations/0000_initial.sql
npm run db:seed                      # optional: insert demo lecture row
npm run dev                          # netlify dev — serves SPA + functions at http://localhost:8888
```

`NETLIFY_DATABASE_URL` is injected automatically when you run `netlify dev` against a Netlify site that has Netlify DB enabled. For local-only development you can paste a Neon connection string into `.env.local`.

## Repo layout

```
shared/types.ts       The locked API contract. Edits go through the team channel.
db/                   Drizzle schema + migrations + seed.
agents/               Five-agent pipeline + prompts.
netlify/functions/    REST endpoints.
netlify/background-*  Long-running jobs (embedding, feedback).
src/                  React app (pages, components, hooks, lib).
docs/                 Pitch deck exports, architecture diagrams, demo script.
```

See `/Users/AhmetKilic/.claude/plans/claude-code-plan-unified-knuth.md` for the full plan: architecture diagrams, agent prompts, demo script, risk register, and the 4-person task breakdown.

## Team ownership

- **P1 — Frontend**: `src/**`
- **P2 — Backend**: `netlify/functions/**`, `db/**`, `shared/types.ts`
- **P3 — AI**: `agents/**`, `netlify/background-functions/**`
- **P4 — DevOps + Demo**: `netlify.toml`, `docs/**`, pitch deck, backup video, demo prova

## Conventions

- TypeScript strict mode. No `any`.
- Every file starts with an `OWNER:` comment so people stay out of each other's lane.
- All UI strings live in `src/lib/i18n.ts` — never hardcode user-facing copy in components.
- API contract is law: `shared/types.ts` is edited together; never one-side it.
- Branch naming: `feat/fe-*`, `feat/be-*`, `feat/ai-*`, `feat/ops-*`.

## Privacy

No audio is uploaded. The teacher's browser transcribes locally via the Web Speech API and posts the resulting text. Students see a consent line on the join page.
