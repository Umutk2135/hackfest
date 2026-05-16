/**
 * OWNER: P1 (Frontend)
 * Shows Router → Retrieval → Answer → Flagger chips with animated state.
 */
import { cn } from '@/lib/cn';
import type { AgentName, AgentState } from '@shared/types';

interface Tick {
  agent: AgentName;
  state: AgentState;
}

const SEQUENCE: AgentName[] = ['router', 'retrieval', 'answer', 'flagger'];
const LABEL: Record<AgentName, string> = {
  router: 'Router',
  retrieval: 'Retrieval',
  answer: 'Answer',
  flagger: 'Flagger',
  feedback: 'Feedback',
};

export function AgentStatusIndicator({ ticks }: { ticks: Tick[] }) {
  const latest = new Map<AgentName, AgentState>();
  for (const t of ticks) latest.set(t.agent, t.state);

  return (
    <div className="inline-flex items-center gap-1 text-xs">
      {SEQUENCE.map((agent, i) => {
        const state = latest.get(agent);
        const active = state === 'running';
        const done = state === 'done';
        return (
          <div key={agent} className="flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 border',
                active && 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 animate-pulse',
                done && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                !state && 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]',
              )}
            >
              {LABEL[agent]}
            </span>
            {i < SEQUENCE.length - 1 && <span className="text-[hsl(var(--muted-foreground))]">›</span>}
          </div>
        );
      })}
    </div>
  );
}
