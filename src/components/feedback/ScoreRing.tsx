/**
 * OWNER: P1 (Frontend) — feedback-score-ring per DESIGN.md
 */
import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const data = [{ name: label, value: score, fill: 'hsl(213 35% 37%)' }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[120px] w-[120px]">
        <RadialBarChart
          width={120}
          height={120}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
          <RadialBar background={{ fill: 'hsl(var(--surface-soft))' }} dataKey="value" cornerRadius={6} />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-medium text-[hsl(var(--seminar))]">
          {score.toFixed(1)}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
