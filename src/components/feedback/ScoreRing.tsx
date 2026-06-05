/**
 * OWNER: P1 (Frontend) — feedback-score-ring per DESIGN.md
 */
const SIZE = 120;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Scores are 0–100 per API contract; clamp for display. */
function scorePercent(score: number): number {
  const n = Number.isFinite(score) ? score : 0;
  return Math.min(100, Math.max(0, n));
}

function formatScore(score: number): string {
  const p = scorePercent(score);
  return Number.isInteger(p) ? String(p) : p.toFixed(1);
}

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const percent = scorePercent(score);
  const offset = CIRCUMFERENCE * (1 - percent / 100);
  const center = SIZE / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[120px]">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--surface-soft))"
            strokeWidth={STROKE}
          />
          <circle
            cx={center}
            cy={center}
            r={RADIUS}
            fill="none"
            stroke="hsl(213 35% 37%)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-medium text-[hsl(var(--seminar))]">
          {formatScore(score)}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
