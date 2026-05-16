/**
 * OWNER: P1 (Frontend)
 * Bar chart of actual vs suggested seconds per topic.
 */
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FeedbackReport } from '@shared/types';

export function PacingChart({ data }: { data: FeedbackReport['pacingAnalysis'] }) {
  if (!data?.length) return <p className="text-sm text-[hsl(var(--muted-foreground))]">Veri yok.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="seconds_spent" name="Geçen süre (sn)" fill="hsl(217, 91%, 60%)" />
        <Bar dataKey="suggested_seconds" name="Önerilen (sn)" fill="hsl(240, 5%, 65%)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
