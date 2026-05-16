# Demo Script — 3:00 (P4 ownership)

> Source of truth lives in plan Section 10. This file is the cue-card the team brings to the venue.

## Roles
- **P4** — Teacher laptop, voice 0:00–0:30 + 0:30–1:15 + 2:00–2:30
- **P1** — Student laptop, voice 1:15–2:00
- **P3** — Architecture closing 2:30–3:00
- **P2** — Safety net (cued backup video, second-question pre-cache, hotspot)

## Cues

### 0:00–0:30 — Problem slide
P4: "Çevrim içi ve hibrit derslerde iki şey kayıp gidiyor..."

### 0:30–1:15 — Teacher demo
1. /teacher → "Yeni Ders" → title "Ridge Regresyon Nedir?" subject "Makine Öğrenmesi" → Oluştur
2. Notları yükle → drop the prepared 2-page PDF → wait for chunk count
3. Canlı oturumu başlat → mic permission accept → speak ~30 seconds of prepared script

### 1:15–2:00 — Student demo
1. P1 scans QR or types `KRSU-7821` → name "Zeynep" → Katıl
2. Asks `Lambda büyürse modele ne olur?`
3. Pipeline chips light up; answer streams with `[Not: sayfa 2]` + `[Ders: 03:42]`
4. Click `[Not: sayfa 2]` → toast shows snippet

### 2:00–2:30 — End + Feedback
1. P4 → Oturumu sonlandır
2. Wait for /feedback page → three ring scores + rushed concepts + unanswered + 3 suggestions
3. P4 voice: "Bu rapor öğretmene 'şu kavramı hızlı geçtin' diyor."

### 2:30–3:00 — Architecture (P3)
Pipeline slide. Highlight: multi-agent, RAG dual-source, tool-use, citations, flagger.

## Backup triggers (P2 cued)
- **Speech recognition silent for >10s** → switch to backup video clip A (transcript replay)
- **SSE stalls >5s mid-answer** → P1 says "Daha önce sorulan bir soruyu da hızlıca göstereyim" → opens cached question page
- **End→Feedback >40s** → P4 navigates to pre-seeded `KRSU-DEMO` lecture's feedback page (already populated)

## Talking points for jury Q&A
- Why multi-agent? Cost (Sonnet for routing), latency (fast classifier), modularity (each agent prompt is small + tested).
- Why citations? Hallucination mitigation. Server-side validates chunk_ids belong to the retrieved set.
- Why pgvector? Single deploy, no separate vector DB, HNSW index for sub-50ms recall on demo data.
- Why no audio upload? Privacy + latency + cost. Browser does the work.
