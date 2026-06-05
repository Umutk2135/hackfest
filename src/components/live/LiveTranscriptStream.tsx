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
    if (!lectureId) return;
    let cancelled = false;
    let lastIndex = -1;
    async function tick() {
      while (!cancelled) {
        try {
          const since = lastIndex < 0 ? -1 : lastIndex;
          const res = await api.getTranscript(lectureId, since);
          if (!cancelled && res.segments.length) {
            setServerSegments((prev) => mergeServerSegments(prev, res.segments));
          }
          if (!cancelled && res.latestIndex >= lastIndex) {
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

  const segs = buildSegments(serverSegments, source === 'mic' ? localSegments ?? [] : []);

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

function mergeServerSegments(prev: TranscriptSegment[], next: TranscriptSegment[]) {
  const byIndex = new Map<number, TranscriptSegment>();
  for (const segment of prev) byIndex.set(segment.segmentIndex, segment);
  for (const segment of next) {
    const existing = byIndex.get(segment.segmentIndex);
    if (!existing || segment.content.length >= existing.content.length) {
      byIndex.set(segment.segmentIndex, segment);
    }
  }
  return [...byIndex.values()].sort((a, b) => a.segmentIndex - b.segmentIndex);
}

function buildSegments(
  serverSegments: TranscriptSegment[],
  localSegments: Array<{ index: number; content: string; startSec: number; endSec: number }>,
) {
  const byIndex = new Map<number, { key: string; index: number; t: string; content: string }>();

  for (const s of serverSegments) {
    byIndex.set(s.segmentIndex, {
      key: s.id,
      index: s.segmentIndex,
      t: mmss(s.startTimeSeconds),
      content: s.content,
    });
  }

  for (const s of localSegments) {
    const existing = byIndex.get(s.index);
    if (!existing || s.content.length > existing.content.length) {
      byIndex.set(s.index, {
        key: existing?.key ?? `m${s.index}`,
        index: s.index,
        t: mmss(s.startSec),
        content: s.content,
      });
    }
  }

  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}
