/**
 * OWNER: P1 (Frontend)
 * GET one lecture + child counts.
 */
import { usePolling } from './usePolling';
import { api } from '@/lib/api';

export function useLecture(id: string | undefined, opts: { intervalMs?: number } = {}) {
  return usePolling(
    () => {
      if (!id) throw new Error('no id');
      return api.getLecture(id);
    },
    { intervalMs: opts.intervalMs ?? 5000, enabled: Boolean(id) },
  );
}
