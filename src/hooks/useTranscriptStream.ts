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

export function useTranscriptStream(opts: Options) {
  const startedAtRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const [localSegments, setLocalSegments] = useState<
    Array<{ index: number; content: string; startSec: number; endSec: number }>
  >([]);

  const onFinal = useCallback(
    (text: string) => {
      if (!text || !opts.enabled) return;
      if (startedAtRef.current === null) startedAtRef.current = Date.now();
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const seg = {
        index: indexRef.current++,
        content: text,
        startSec: Math.max(0, elapsed - text.length / 12), // ~12 chars/s estimate
        endSec: elapsed,
      };
      setLocalSegments((prev) => [...prev, seg]);
      api
        .appendTranscript(opts.lectureId, {
          segmentIndex: seg.index,
          content: seg.content,
          startTimeSeconds: Math.floor(seg.startSec),
          endTimeSeconds: Math.floor(seg.endSec),
        })
        .catch(() => {
          // Best effort. The browser keeps a local copy; reload re-fetches from server.
        });
    },
    [opts.enabled, opts.lectureId],
  );

  const speech = useSpeechRecognition({ onFinal });

  useEffect(() => {
    if (opts.enabled) speech.start();
    else speech.stop();
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  return {
    status: speech.status,
    error: speech.error,
    interim: speech.interim,
    localSegments,
    start: speech.start,
    stop: speech.stop,
  };
}
