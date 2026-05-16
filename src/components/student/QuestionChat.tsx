/**
 * OWNER: P1 (Frontend)
 * Student chat interface — input + streaming AI reply + history.
 */
import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './ChatMessage';
import { AgentStatusIndicator } from '@/components/live/AgentStatusIndicator';
import { useQuestionStream } from '@/hooks/useQuestionStream';
import { t } from '@/lib/i18n';

interface Props {
  lectureId: string;
  studentSessionId: string;
}

interface HistoryItem {
  role: 'user' | 'ai';
  text: string;
  citations?: { source_type: 'note' | 'transcript'; reference: string; snippet: string; chunk_id: string }[];
}

export function QuestionChat({ lectureId, studentSessionId }: Props) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { state, ask, reset } = useQuestionStream(lectureId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || state.status === 'streaming') return;
    setHistory((h) => [...h, { role: 'user', text: q }]);
    setInput('');
    await ask(studentSessionId, q);
  }

  // When stream completes, commit the answer to history and reset stream state.
  if (state.status === 'done' && state.text) {
    setHistory((h) => [...h, { role: 'ai', text: state.text, citations: state.citations }]);
    reset();
  }

  return (
    <div className="flex flex-col h-[60vh] rounded-xl border border-[hsl(var(--border))]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && state.status === 'idle' && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            İlk sorunuzu yazın, AI dersi ve notları kullanarak cevaplasın.
          </p>
        )}
        {history.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.text} citations={m.citations} />
        ))}
        {state.status === 'streaming' && (
          <div className="space-y-2">
            <AgentStatusIndicator ticks={state.agentTicks} />
            {state.text && <ChatMessage role="ai" text={state.text} streaming citations={state.citations} />}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="border-t border-[hsl(var(--border))] p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          disabled={state.status === 'streaming'}
        />
        <Button type="submit" disabled={!input.trim() || state.status === 'streaming'}>
          <Send className="h-4 w-4" />
          {t('chat.send')}
        </Button>
      </form>
    </div>
  );
}
