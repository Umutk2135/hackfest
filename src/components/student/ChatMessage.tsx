/**
 * OWNER: P1 (Frontend) — chat-bubble-student / chat-bubble-ai
 */
import { CitationBadge } from './CitationBadge';
import { cn } from '@/lib/cn';
import type { Citation } from '@shared/types';

interface Props {
  role: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  streaming?: boolean;
}

export function ChatMessage({ role, text, citations, streaming }: Props) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[90%] rounded-lg px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-[hsl(var(--surface-card))] text-foreground border border-border'
            : 'bg-background text-[hsl(var(--body))] border border-border',
        )}
      >
        <p className="whitespace-pre-wrap">
          {text}
          {streaming && (
            <span className="ml-0.5 inline-block w-1.5 h-4 bg-current align-middle animate-pulse" />
          )}
        </p>
        {citations && citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {citations.map((c) => (
              <CitationBadge key={c.chunk_id} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
