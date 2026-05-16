/**
 * OWNER: P1 (Frontend)
 * Teacher-side panel: incoming questions with status + actions.
 */
import { useQuestions } from '@/hooks/useQuestions';
import { EmptyState } from '@/components/layout/EmptyState';
import { QuestionRow } from './QuestionRow';
import { t } from '@/lib/i18n';

export function TeacherQuestionPanel({ lectureId }: { lectureId: string }) {
  const { data } = useQuestions(lectureId);
  const questions = data?.questions ?? [];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Sorular ({questions.length})</h3>
      {questions.length === 0 ? (
        <EmptyState title={t('live.questions.empty')} />
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <QuestionRow key={q.id} question={q} />
          ))}
        </ul>
      )}
    </div>
  );
}
