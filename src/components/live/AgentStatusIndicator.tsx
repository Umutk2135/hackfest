/**
 * OWNER: P1 (Frontend) — agent-status-chip per DESIGN.md
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
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {SEQUENCE.map((agent, i) => {
        const state = latest.get(agent);
        const running = state === 'running';
        const done = state === 'done';
        return (
          <div key={agent} className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 font-medium border',
                running && 'border-[hsl(var(--seminar))] bg-[hsl(var(--seminar))] text-white',
                done && 'border-[hsl(var(--live-muted))] bg-[hsl(var(--live-muted))] text-[hsl(var(--live))]',
                !state && 'border-border bg-[hsl(var(--surface-card))] text-muted-foreground',
              )}
            >
              {LABEL[agent]}
            </span>
            {i < SEQUENCE.length - 1 && (
              <span className="text-muted-foreground select-none">›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
