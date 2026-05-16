/**
 * OWNER: P1 (Frontend)
 * Poll feedback endpoint (202 generating → 200 ready). Stops polling once ready.
 */
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { FeedbackReport } from '@shared/types';

export function useFeedback(lectureId: string | undefined) {
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!lectureId) return;
    let cancelled = false;
    void (async () => {
      while (!cancelled) {
        try {
          const res = await api.getFeedback(lectureId);
          if (res.status === 'ready') {
            if (!cancelled) setReport(res.report);
            return;
          }
        } catch (e) {
          if (!cancelled) setError(e as Error);
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lectureId]);

  return { report, error, loading: report === null && error === null };
}
