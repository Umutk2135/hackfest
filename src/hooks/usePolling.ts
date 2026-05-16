/**
 * OWNER: P1 (Frontend)
 * Generic polling hook. Calls fetcher every intervalMs while enabled === true.
 * Returns { data, error, refetch, loading }.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  intervalMs?: number;
  enabled?: boolean;
}

export function usePolling<T>(fetcher: () => Promise<T>, opts: Options = {}) {
  const intervalMs = opts.intervalMs ?? 2000;
  const enabled = opts.enabled ?? true;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetcherRef.current();
      setData(next);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      while (!cancelled) {
        try {
          const next = await fetcherRef.current();
          if (!cancelled) {
            setData(next);
            setError(null);
          }
        } catch (e) {
          if (!cancelled) setError(e as Error);
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, intervalMs]);

  return { data, error, loading, refetch };
}
