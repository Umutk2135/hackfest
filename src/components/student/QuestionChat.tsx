/**
 * OWNER: P1 (Frontend) — question-chat-panel per DESIGN.md
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './ChatMessage';
import { AgentStatusIndicator } from '@/components/live/AgentStatusIndicator';
import { useQuestionStream } from '@/hooks/useQuestionStream';
import { useQuestions } from '@/hooks/useQuestions';
import { t } from '@/lib/i18n';
import type { Citation } from '@shared/types';

interface Props {
  lectureId: string;
  studentSessionId: string;
}

interface HistoryItem {
  role: 'user' | 'ai';
  text: string;
  citations?: Citation[];
}

export function QuestionChat({ lectureId, studentSessionId }: Props) {
  const [input, setInput] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const { state, ask, reset } = useQuestionStream(lectureId);
  const { data } = useQuestions(lectureId, studentSessionId);
  const questions = data?.questions ?? [];

  async function submit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || state.status === 'streaming') return;
    setPendingQuestion(q);
    setInput('');
    await ask(studentSessionId, q);
  }

  useEffect(() => {
    if (state.status === 'error') {
      setPendingQuestion(null);
      return;
    }
    if (state.status !== 'done' || !state.finalQuestionId) return;
    if (!questions.some((question) => question.id === state.finalQuestionId)) return;
    setPendingQuestion(null);
    reset();
  }, [questions, reset, state.finalQuestionId, state.status]);

  const history = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [];
    for (const question of [...questions].reverse()) {
      items.push({ role: 'user', text: question.questionText });
      const answerText = question.teacherResponse ?? question.aiAnswer;
      if (!answerText) continue;
      items.push({
        role: 'ai',
        text: answerText,
        citations: question.teacherResponse
          ? undefined
          : (question.aiAnswerCitations ?? []).filter((citation) => citation.source_type === 'note'),
      });
    }
    if (
      pendingQuestion &&
      !questions.some(
        (question) =>
          question.questionText === pendingQuestion &&
          question.studentSessionId === studentSessionId,
      )
    ) {
      items.push({ role: 'user', text: pendingQuestion });
    }
    return items;
  }, [pendingQuestion, questions, studentSessionId]);

  return (
    <div className="kursu-chat-panel h-[60vh] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {history.length === 0 && state.status === 'idle' && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            İlk sorunuzu yazın, AI dersi ve notları kullanarak cevaplasın.
          </p>
        )}
        {history.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.text} citations={m.citations} />
        ))}
        {state.status === 'streaming' && (
          <div className="space-y-3">
            <AgentStatusIndicator ticks={state.agentTicks} />
            {state.text && (
              <ChatMessage role="ai" text={state.text} streaming citations={state.citations} />
            )}
          </div>
        )}
        {state.status === 'error' && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {state.errorMessage ?? 'Soru gönderilemedi. Ders başlamamış olabilir veya AI servisi hata döndürdü.'}
          </div>
        )}
      </div>
      <form onSubmit={submit} className="border-t border-border p-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          disabled={state.status === 'streaming'}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim() || state.status === 'streaming'}>
          <Send className="h-4 w-4" />
          <span className="sr-only">{t('chat.send')}</span>
        </Button>
      </form>
    </div>
  );
}
