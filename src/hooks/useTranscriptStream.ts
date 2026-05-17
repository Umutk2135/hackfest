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

      const write = api
        .appendTranscript(opts.lectureId, {
          segmentIndex: seg.index,
          content: seg.content,
          startTimeSeconds: Math.floor(seg.startSec),
          endTimeSeconds: Math.floor(seg.endSec),
        })
        .catch(() => {
          // Best effort. The browser keeps a local copy; reload re-fetches from server.
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
