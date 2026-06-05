/**
 * OWNER: P1 (Frontend)
 * Poll the teacher question panel every 2s.
 */
import { usePolling } from './usePolling';
import { api } from '@/lib/api';

export function useQuestions(lectureId: string | undefined, studentSessionId?: string) {
  return usePolling(
    () => {
      if (!lectureId) throw new Error('no id');
      return api.listQuestions(lectureId, undefined, studentSessionId);
    },
    { intervalMs: 2000, enabled: Boolean(lectureId) },
  );
}
