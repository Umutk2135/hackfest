/**
 * OWNER: P1 (Frontend)
 * One chat bubble.
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
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">
          {text}
          {streaming && <span className="ml-0.5 inline-block w-1.5 h-4 bg-current align-middle animate-pulse" />}
        </p>
        {citations && citations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {citations.map((c) => (
              <CitationBadge key={c.chunk_id} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
