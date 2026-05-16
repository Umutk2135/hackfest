/**
 * OWNER: P1 (Frontend) — transcript-panel per DESIGN.md
 */
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { mmss } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { TranscriptSegment } from '@shared/types';

interface Props {
  lectureId: string;
  source: 'mic' | 'server';
  interim?: string;
  localSegments?: Array<{ index: number; content: string; startSec: number; endSec: number }>;
}

export function LiveTranscriptStream({ lectureId, source, interim, localSegments }: Props) {
  const [serverSegments, setServerSegments] = useState<TranscriptSegment[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (source !== 'server') return;
    let cancelled = false;
    let lastIndex = -1;
    async function tick() {
      while (!cancelled) {
        try {
          const res = await api.getTranscript(lectureId, lastIndex);
          if (!cancelled && res.segments.length) {
            setServerSegments((prev) => [...prev, ...res.segments]);
            lastIndex = res.latestIndex;
          }
        } catch {
          // soft fail
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    void tick();
    return () => {
      cancelled = true;
    };
  }, [lectureId, source]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [serverSegments, localSegments, interim]);

  const segs =
    source === 'mic'
      ? (localSegments ?? []).map((s) => ({
          key: `m${s.index}`,
          t: mmss(s.startSec),
          content: s.content,
        }))
      : serverSegments.map((s) => ({
          key: s.id,
          t: mmss(s.startTimeSeconds),
          content: s.content,
        }));

  return (
    <div ref={ref} className="kursu-transcript-panel h-[60vh] overflow-y-auto space-y-3">
      {segs.length === 0 && !interim && (
        <p className="text-muted-foreground text-sm">{t('live.transcript.empty')}</p>
      )}
      {segs.map((s) => (
        <p key={s.key} className="text-[hsl(var(--body))]">
          <span className="font-mono text-xs text-muted-foreground mr-2 tabular-nums">[{s.t}]</span>
          {s.content}
        </p>
      ))}
      {interim && (
        <p className="text-muted-foreground italic">
          <span className="font-mono text-xs mr-2">[...]</span>
          {interim}
        </p>
      )}
    </div>
  );
}
