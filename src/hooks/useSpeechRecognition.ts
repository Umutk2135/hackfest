/**
 * OWNER: P1 (Frontend)
 * Web Speech API wrapper. Continuous tr-TR transcription with auto-restart on error.
 *
 * Returns:
 *   start(), stop()                  — control
 *   finalSegments: string[]          — finalized utterances since start
 *   interim: string                  — current in-flight utterance
 *   status: 'idle'|'listening'|'denied'|'unsupported'|'error'
 *   error: string | null
 *
 * Browser support: Chrome/Edge. Firefox does not implement tr-TR reliably (see Open Question Q3).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechStatus = 'idle' | 'listening' | 'denied' | 'unsupported' | 'error';

interface Options {
  lang?: string;
  onFinal?: (text: string) => void;
}

export function useSpeechRecognition(opts: Options = {}) {
  const lang = opts.lang ?? 'tr-TR';
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [finalSegments, setFinalSegments] = useState<string[]>([]);
  const [interim, setInterim] = useState('');
  const recogRef = useRef<SpeechRecognition | null>(null);
  const wantRunningRef = useRef(false);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus('unsupported');
      return;
    }
    const recog = new Ctor();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = lang;
    recog.maxAlternatives = 1;
    recogRef.current = recog;

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        const alt = r[0];
        if (!alt) continue;
        if (r.isFinal) {
          setFinalSegments((prev) => [...prev, alt.transcript.trim()]);
          opts.onFinal?.(alt.transcript.trim());
        } else {
          interimText += alt.transcript;
        }
      }
      setInterim(interimText);
    };
    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setStatus('denied');
      } else {
        setError(e.message ?? e.error);
        setStatus('error');
      }
    };
    recog.onend = () => {
      // Auto-restart so single-shot stops don't kill the session mid-lecture.
      if (wantRunningRef.current && status !== 'denied') {
        try {
          recog.start();
        } catch {
          // Already started — ignore.
        }
      } else {
        setStatus('idle');
      }
    };
    return () => {
      try {
        recog.stop();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const start = useCallback(() => {
    const recog = recogRef.current;
    if (!recog) return;
    wantRunningRef.current = true;
    setError(null);
    try {
      recog.start();
      setStatus('listening');
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const stop = useCallback(() => {
    wantRunningRef.current = false;
    recogRef.current?.stop();
  }, []);

  return { status, error, finalSegments, interim, start, stop };
}
