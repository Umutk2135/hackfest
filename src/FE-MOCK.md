# Frontend mock mode (P1)

<!--
  OWNER: P1 (Frontend)
-->

Branch **`feat/fe-mock-ui`** runs the full UI against an **in-memory mock API** — no Netlify, no database, no API keys.

## Run

```bash
npm install
npm run dev:vite
```

Open http://localhost:5173

`.env.development` sets `VITE_MOCK_API=true` on this branch.

## Demo path

1. **Teacher:** `/teacher` → see **Ridge Regresyon Nedir?** (`KRSU-DEMO`) or create a new lecture.
2. Upload notes (paste or PDF) → wait ~1s → chunks appear.
3. **Canlı oturumu başlat** → live page; optional mic (real Web Speech) or read seeded transcript on student side after start.
4. **Student:** `/student` → code `KRSU-DEMO`, name `Zeynep` → ask `Lambda büyürse modele ne olur?` → mock SSE pipeline + citations.
5. **Teacher:** end session → feedback page with sample scores (~1.5s “generating”).

Amber banner at top: **Mock API — veriler yerel bellekte**.

## Architecture

| File | Role |
|------|------|
| `src/lib/mock/config.ts` | `isMockApi` flag |
| `src/lib/mock/store.ts` | In-memory lectures, notes, transcript, Q&A, feedback |
| `src/lib/mock/api.ts` | Drop-in replacement for REST `api.*` |
| `src/lib/mock/question-stream.ts` | Fake SSE for student chat |
| `src/lib/api.ts` | Switches `api` → `mockApi` when mock on |

## Turn off mock (use real API)

Remove or set `VITE_MOCK_API=false` and run `npm run dev` (Netlify on :8888) with DB + env keys.

## Merge note

Before merging to `main`, either remove `.env.development` mock flag or document that production builds must not set `VITE_MOCK_API=true`.
