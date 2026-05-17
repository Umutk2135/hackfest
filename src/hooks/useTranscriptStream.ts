/**
 * OWNER: P1 (Frontend)
 * Combines useSpeechRecognition with a debounced POST to /transcript/append.
 * Buffers final segments locally so the UI can show them instantly without waiting on the server.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { api } from '@/lib/api';

interface Options {
  lectureId: string;
  enabled: boolean;
}

function normalizeTranscript(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

const APPEND_RETRIES = 3;

async function appendWithRetry(lectureId: string, body: Parameters<typeof api.appendTranscript>[1]) {
  let lastError: unknown;
  for (let attempt = 0; attempt < APPEND_RETRIES; attempt += 1) {
    try {
      return await api.appendTranscript(lectureId, body);
    } catch (err) {
      lastError = err;
      if (attempt < APPEND_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function useTranscriptStream(opts: Options) {
  const startedAtRef = useRef<number | null>(null);
  const enabledRef = useRef(opts.enabled);
  const activeIndexRef = useRef(0);
  const activeStartSecRef = useRef<number | null>(null);
  const interimRef = useRef('');
  const skipNextFinalRef = useRef<string | null>(null);
  const lastSentByIndexRef = useRef(new Map<number, string>());
  const pendingWritesRef = useRef<Array<Promise<unknown>>>([]);
  const [localSegments, setLocalSegments] = useState<
    Array<{ index: number; content: string; startSec: number; endSec: number }>
  >([]);

  useEffect(() => {
    enabledRef.current = opts.enabled;
  }, [opts.enabled]);

  useEffect(() => {
    if (!opts.lectureId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await api.getTranscript(opts.lectureId, -1);
        if (cancelled) return;
        const maxIndex = res.segments.reduce(
          (max, segment) => Math.max(max, segment.segmentIndex),
          res.latestIndex,
        );
        activeIndexRef.current = Math.max(activeIndexRef.current, maxIndex + 1);
      } catch {
        // Best effort; polling will still hydrate the transcript panel.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opts.lectureId]);

  const persistSegment = useCallback(
    async (text: string, options: { advance?: boolean; force?: boolean } = {}) => {
      const content = normalizeTranscript(text);
      if (!content || !opts.lectureId) return;
      if (!options.force && !enabledRef.current) return;
      if (startedAtRef.current === null) startedAtRef.current = Date.now();

      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const segmentIndex = activeIndexRef.current;
      if (activeStartSecRef.current === null) {
        activeStartSecRef.current = Math.max(0, elapsed - content.length / 12);
      }
      const startSec = activeStartSecRef.current;
      const endSec = Math.max(startSec, elapsed);

      if (lastSentByIndexRef.current.get(segmentIndex) === content && !options.advance) {
        return;
      }
      lastSentByIndexRef.current.set(segmentIndex, content);

      const seg = {
        index: segmentIndex,
        content,
        startSec,
        endSec,
      };
      setLocalSegments((prev) =>
        [...prev.filter((item) => item.index !== segmentIndex), seg].sort((a, b) => a.index - b.index),
      );

      const write = appendWithRetry(opts.lectureId, {
        segmentIndex: seg.index,
        content: seg.content,
        startTimeSeconds: Math.floor(seg.startSec),
        endTimeSeconds: Math.floor(seg.endSec),
      }).catch(() => {
        // Local copy remains; polling will reconcile once a later write succeeds.
      });

      pendingWritesRef.current.push(write);
      write.finally(() => {
        pendingWritesRef.current = pendingWritesRef.current.filter((item) => item !== write);
      });
      await write;

      if (options.advance) {
        activeIndexRef.current += 1;
        activeStartSecRef.current = null;
        interimRef.current = '';
      }
    },
    [opts.lectureId],
  );

  const onInterim = useCallback((text: string) => {
    interimRef.current = text;
  }, []);

  const onFinal = useCallback(
    (text: string) => {
      const normalized = normalizeTranscript(text);
      if (normalized && skipNextFinalRef.current === normalized) {
        skipNextFinalRef.current = null;
        return;
      }
      void persistSegment(text, { advance: true, force: true });
    },
    [persistSegment],
  );

  const speech = useSpeechRecognition({ onFinal, onInterim });

  const stop = useCallback(async () => {
    const normalized = normalizeTranscript(interimRef.current);
    if (normalized) skipNextFinalRef.current = normalized;
    await persistSegment(interimRef.current, { advance: true, force: true });
    await Promise.allSettled(pendingWritesRef.current);
    speech.stop();
  }, [persistSegment, speech]);

  useEffect(() => {
    if (opts.enabled) speech.start();
    else void stop();
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  useEffect(() => {
    if (!opts.enabled) return undefined;
    const timer = window.setInterval(() => {
      void persistSegment(interimRef.current);
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [opts.enabled, persistSegment]);

  return {
    status: speech.status,
    error: speech.error,
    interim: speech.interim,
    localSegments,
    start: speech.start,
    stop,
  };
}
