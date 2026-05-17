---
version: alpha
name: Kursu-design-system
description: A warm-paper editorial interface for Kürsü — a live-lecture AI teaching assistant (Turkish-first). The system anchors on classroom-cream canvas with scholarly serif headlines, seminar-blue structure, and terracotta human warmth for teacher actions. Brand voltage comes from the paper/ink pairing plus a dedicated "live session" green — calm and legible for long transcript reading, not the cool-slate look of generic AI chat. Type voice runs Fraunces / Literata for display and DM Sans for UI. The wordmark uses a simple podium mark (rounded lectern silhouette), not a tech-radial glyph.

colors:
  primary: "#3d5a80"
  primary-active: "#2f4763"
  primary-disabled: "#d8dde6"
  accent-warm: "#c17f59"
  accent-warm-active: "#a56847"
  ink: "#1a1a18"
  body: "#3a3a36"
  body-strong: "#252522"
  muted: "#6b6962"
  muted-soft: "#8c8980"
  text-on-soft: "#3a3a36"
  hairline: "#e4e0d6"
  hairline-soft: "#ebe8e0"
  canvas: "#faf8f4"
  surface-soft: "#f3efe6"
  surface-card: "#ebe6da"
  surface-cream-strong: "#e2dbd0"
  surface-dark: "#1c1f24"
  surface-dark-elevated: "#282c33"
  surface-dark-soft: "#23272e"
  on-primary: "#ffffff"
  on-accent: "#ffffff"
  on-dark: "#f5f3ee"
  on-dark-soft: "#9a968d"
  live: "#3d8f72"
  live-muted: "#d4ebe3"
  citation-note: "#5c4d8a"
  citation-transcript: "#3d6b52"
  role-teacher: "#3d5a80"
  role-student: "#6b5b3e"
  success: "#3d8f72"
  warning: "#c9922a"
  error: "#b84a4a"
  mock-banner: "#f5e6c8"

typography:
  display-xl:
    fontFamily: "Fraunces, Literata, Georgia, serif"
    fontSize: 56px
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: -1.2px
  display-lg:
    fontFamily: "Fraunces, Literata, Georgia, serif"
    fontSize: 42px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.8px
  display-md:
    fontFamily: "Fraunces, Literata, Georgia, serif"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.4px
  display-sm:
    fontFamily: "Fraunces, Literata, Georgia, serif"
    fontSize: 26px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.2px
  title-lg:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  title-sm:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  caption:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  caption-uppercase:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 1.2px
  transcript:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0.01em
  timestamp:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  button:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0
  nav-link:
    fontFamily: "DM Sans, Inter, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.accent-warm}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
  button-primary-active:
    backgroundColor: "{colors.accent-warm-active}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
  button-teacher:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 56px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "{spacing.section}"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  feature-card-description:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
  session-code-card:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  live-banner:
    backgroundColor: "{colors.live-muted}"
    textColor: "{colors.live}"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.md}"
    padding: 8px 14px
  transcript-panel:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body}"
    typography: "{typography.transcript}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  question-chat-panel:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    border: "1px {colors.hairline}"
  chat-bubble-student:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
  chat-bubble-ai:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 12px 16px
    border: "1px {colors.hairline}"
  citation-badge-note:
    backgroundColor: "#ede9f4"
    textColor: "{colors.citation-note}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  citation-badge-transcript:
    backgroundColor: "#e4f0e8"
    textColor: "{colors.citation-transcript}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  agent-status-chip:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 12px
  agent-status-chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 12px
  teacher-question-row:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  teacher-question-row-flagged:
    backgroundColor: "#faf0e8"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    border: "1px {colors.accent-warm}"
  feedback-score-ring:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary}"
    typography: "{typography.title-lg}"
    rounded: "{rounded.full}"
    size: 120px
  feedback-report-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px 14px
    height: 44px
  role-switcher-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  role-switcher-pill-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  badge-live:
    backgroundColor: "{colors.live}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-draft:
    backgroundColor: "{colors.surface-cream-strong}"
    textColor: "{colors.muted}"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  mock-mode-banner:
    backgroundColor: "{colors.mock-banner}"
    textColor: "#7a5c20"
    typography: "{typography.caption}"
    padding: 8px 16px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: "{spacing.xxl}"
---

## Overview

Kürsü is a **live-lecture teaching surface**, not a generic AI chatbot skin. The base atmosphere is **classroom paper** (`{colors.canvas}` — #faf8f4): warm, slightly matte, comfortable for 45+ minutes of transcript reading. Headlines use **Fraunces / Literata** at weight 500 with light negative tracking — scholarly and calm, like a university reader, not a SaaS hero.

Brand voltage splits across three ideas:

1. **Seminar blue** (`{colors.primary}` — #3d5a80) — structure, navigation, teacher authority, agent pipeline chips when active.
2. **Terracotta warmth** (`{colors.accent-warm}` — #c17f59) — human actions: start session, upload notes, primary CTAs students notice in the room.
3. **Live green** (`{colors.live}` — #3d8f72) — session is broadcasting; transcript is flowing; mic is on.

This deliberately avoids the coral + cool-gray palette common on AI marketing sites. Kürsü should feel like **a lecture hall with good lighting**, not a model picker.

### Surface rhythm (light only)

Kürsü ships **one theme**: warm paper. There is no dark-mode toggle and no `prefers-color-scheme` inversion.

1. **Paper canvas** (`{colors.canvas}`) — dashboards, forms, student join, feedback overview.
2. **Soft lecture cards** (`{colors.surface-card}`, `{colors.surface-soft}`) — feature tiles, question rows, note upload zones. Secondary copy on these surfaces uses `{colors.body}` or `{colors.muted}` — never a surface fill color as text.
3. **Footer band** (`{colors.surface-dark}`) — site chrome only (`{component.footer}`), not product panels.

Alternate **paper → soft card → paper** on marketing pages; on **live session** pages, keep transcript and chat on light surfaces so long reading stays easy.

### Key characteristics

- Warm paper canvas with ink text (`{colors.ink}`). Never pure #ffffff page floors in product UI.
- **Dual accent**: terracotta for action, seminar blue for structure — not a single hype color.
- Serif display for **course titles and section heads**; sans for **transcript, chat, and controls**.
- **Citation chroma**: purple-tint for notes (`{colors.citation-note}`), green-tint for transcript (`{colors.citation-transcript}`) — students learn source type at a glance.
- **Agent pipeline** as small pills (`agent-status-chip`), not a flashy progress bar — fits “multi-agent” without looking like DevOps.
- **Session code** as a first-class component (`session-code-card`) — large, scannable, QR-friendly.
- Touch-friendly controls: 44px button height, 44px inputs — jury phones and classroom tablets.
- Turkish-first copy in UI; design tokens are language-agnostic.

## Colors

### Brand & accent

- **Seminar blue / Primary** (`{colors.primary}`): Nav active state, teacher role, agent chip “running”, links on light surfaces.
- **Terracotta / Accent warm** (`{colors.accent-warm}`): “Yeni ders”, “Canlı oturumu başlat”, “Katıl”, destructive-adjacent warm actions.
- **Live** (`{colors.live}`): `CANLI` badge, live banner, success states tied to session health.
- **Citation note** (`{colors.citation-note}`): `[Not: sayfa 2]` chips.
- **Citation transcript** (`{colors.citation-transcript}`): `[Ders: 03:42]` chips.

### Surface

Cream paper steps on all product surfaces; `{colors.surface-dark}` is reserved for the global footer band. Hairlines stay warm (`{colors.hairline}`), never cool gray `#e5e7eb`.

**Secondary text on soft/card surfaces:** use `{colors.body}` (`#3a3a36`) or `{colors.muted}` (`#6b6962`). In CSS, `--muted` is the **background** token (maps to `surface-soft`); `--muted-foreground` / `--text-muted` is **text only** — never alias text to a surface color.

### Semantic

- **Success** aligns with **live green** where it means “session healthy / answer delivered”.
- **Warning** for “flagged for teacher” borders, not alarm red.
- **Error** for join failures, mic denied, API errors.
- **Mock banner** (`{colors.mock-banner}`): dev-only strip; never ships to production demo.

## Typography

### Font families

| Role | Stack | Use |
|------|--------|-----|
| Display | Fraunces, Literata, Georgia, serif | Course titles, landing hero, feedback report headline |
| UI / transcript | DM Sans, Inter, sans-serif | Nav, buttons, chat, **live transcript body** |
| Mono | JetBrains Mono | Timestamps `03:42`, session codes `KRSU-DEMO`, optional code in ML courses |

**`{typography.transcript}`** is slightly larger line-height (1.65) than body — optimized for scrolling speech text.

Display uses **500** weight (not 400): Fraunces at 500 feels taught, not magazine-flair.

### Open-source substitutes

- Display: **Fraunces** (Google Fonts) primary; **Literata** backup.
- UI: **DM Sans** primary; **Inter** backup.
- Do not use geometric sans (Montserrat, Poppins) for body — too “startup”, not classroom.

## Layout

### Spacing

Same 4px base. **`{spacing.section}` = 80px** (slightly tighter than 96px marketing sites) — product pages are task-focused, not brochure.

### Live session layout (signature)

| Breakpoint | Teacher live | Student live |
|------------|--------------|--------------|
| Desktop | 2/3 transcript + 1/3 question panel | 3/5 transcript + 2/5 chat |
| Mobile | Stacked: transcript then questions / chat | Stacked: transcript (min 38vh) then chat (min 48vh) |

Session code + live badge sit **above** the grid, full width.

### Whitespace

Transcript panels need **vertical rhythm between segments** (`{spacing.sm}` gap), not dense chat bubbles. Questions in teacher panel are **rows**, not a message thread — reduces confusion with student chat.

## Elevation & depth

**Color-block first, shadow rare** (inherited principle).

Education-specific depth:

- **Citation badges** lift slightly with tinted backgrounds, not drop shadows.
- **Flagged questions** use warm border (`teacher-question-row-flagged`), not red fill — teacher isn’t being punished, student needs help.
- **Feedback score rings** are flat circles with stroke progress — calm assessment, not gamified leaderboard.

## Shapes

| Token | Value | Kürsü use |
|-------|-------|-----------|
| `{rounded.md}` | 8px | Buttons, inputs, tabs |
| `{rounded.lg}` | 12px | Transcript panel, chat panel, cards |
| `{rounded.xl}` | 16px | Feedback report, hero |
| `{rounded.pill}` | 9999px | Citations, agent chips, role switcher |

**Chat bubbles** use `{rounded.lg}` with one corner slightly tighter optional — avoid perfect iMessage mimic; Kürsü is classroom, not DM.

## Components (product-specific)

### Session & roles

**`session-code-card`** — Monospace-friendly large code, `{colors.surface-soft}` background, copy button. Used on teacher live + share slide.

**`live-banner`** + **`badge-live`** — “CANLI” when `lecture.status === 'live'`.

**`role-switcher-pill`** — Teacher vs student in header; active pill uses `{colors.primary}`.

### Live lecture

**`transcript-panel`** — Scroll region, `{typography.transcript}`, timestamp in `{typography.timestamp}` at line start (muted). Teacher mic mode shows interim line in `{colors.muted}` italic.

**`question-chat-panel`** — Student ask + AI stream; houses `agent-status-chip` row and citation badges under answer.

**`agent-status-chip`** / **`agent-status-chip-active`** — Router → Retrieval → Answer → Flagger; active = seminar blue fill.

**`citation-badge-note`** / **`citation-badge-transcript`** — Tappable; toast shows snippet on press (demo script moment).

### Teacher

**`teacher-question-row`** / **`teacher-question-row-flagged`** — Polling list from question panel; flagged uses warm border.

**`button-teacher`** — Seminar blue for secondary teacher actions (respond, save).

### Feedback (post-lecture)

**`feedback-score-ring`** — Clarity / pacing / engagement; `{colors.primary}` stroke.

**`feedback-report-card`** — Holds rushed concepts list, confusion cloud, suggestions — `{rounded.xl}`, generous padding.

### Marketing (landing)

Keep **`hero-band`**, **`feature-card`**, **`footer`** from the parent system but copy reflects **live transcript, cited answers, pedagogy report** — not “thinking partner” AI positioning.

## Do's and Don'ts

### Do

- Design for **long transcript reading** first; marketing second.
- Make **citations visually distinct by source type** (note vs ders).
- Use **terracotta** for “go live” and “join” — one clear action color in the room.
- Use **seminar blue** for wayfinding and teacher chrome.
- Show **session code** large; jury demo depends on QR / `KRSU-DEMO`.
- Keep student and teacher **same warm paper** — don’t put students on a cold gray chat UI.
- Prefer **rows** for teacher question inbox, **bubbles** only in student chat.

### Don't

- Don’t clone Anthropic coral or spike-mark patterns — Kürsü is kürsü (podium).
- Don’t use a single neon “AI purple” gradient hero — reads as generic ChatGPT wrapper.
- Don’t bold serif display to 700 — stays at 500 max.
- Don’t put live transcript on `{colors.surface-dark}` for default student view — fatigue over 45 minutes.
- Don’t animate agent chips excessively — subtle state change only (out of scope in tokens).
- Don’t hardcode Turkish in tokens; strings live in `src/lib/i18n.ts`.

## Responsive behavior

Inherited breakpoints; Kürsü additions:

- **Student join**: inputs `{spacing.min-h}` 44px, `text-base` on mobile.
- **Session code**: never below 20px effective size on phones.
- **Transcript**: horizontal scroll forbidden; wrap text; timestamps stay mono at 12px.
- **QR** on join page: max-width 200px centered when added.

## Iteration guide

1. Map UI work to YAML keys (`{component.transcript-panel}`, etc.).
2. Use `{token.refs}` — no raw hex in components.
3. When adding a component, ask: **teacher live, student live, or post-lecture?** Only add if it serves one.
4. Mock mode uses `{component.mock-mode-banner}`; strip in production builds.
5. Do not add a theme toggle — product stays light for classroom readability.

## Known gaps

- Podium wordmark SVG not formalized as token.
- Animation: SSE token stream, live pulse on `badge-live`, score ring fill — timings TBD.
- Accessibility: citation badges need focus ring spec; flagged-question contrast to be verified WCAG AA.

## Relation to parent analysis

This document **inherits** the warm editorial structure (paper canvas, serif/sans split, color-block elevation, restrained shadows) from a general AI-product design study, then **re-roots** it for Kürsü:

| Inherited | Kürsü-specific |
|-----------|----------------|
| Cream canvas + footer band | Paper + seminar blue + terracotta + live green |
| Serif display + sans UI | Fraunces + DM Sans + transcript scale |
| Feature / hero cards | Session code, transcript, chat, citations, feedback |
| Optional dark marketing cards | Removed — light-only product UI |
| Coral CTA | Terracotta CTA (human warmth, not vendor coral) |

When implementing in `src/index.css` and components, treat this file as the target; current shadcn primitives are a temporary scaffold.
