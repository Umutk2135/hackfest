/**
 * OWNER: P1 (Frontend)
 * Circular 0-100 score using recharts RadialBarChart.
 */
import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';

export function ScoreRing({ score, label }: { score: number; label: string }) {
  const data = [{ name: label, value: score, fill: scoreColor(score) }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <RadialBarChart
          width={128}
          height={128}
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={6} />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
          {score}
        </div>
      </div>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
    </div>
  );
}

function scoreColor(s: number): string {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return '#eab308';
  return '#ef4444';
}
