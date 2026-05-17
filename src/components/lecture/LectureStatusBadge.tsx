/**
 * OWNER: P1 (Frontend)
 */
import { Badge } from '@/components/ui/badge';
import type { LectureStatus } from '@shared/types';

const LABEL: Record<LectureStatus, string> = {
  draft: 'Taslak',
  live: 'Canlı',
  ended: 'Bitti',
};

const VARIANT: Record<LectureStatus, 'draft' | 'live' | 'outline'> = {
  draft: 'draft',
  live: 'live',
  ended: 'outline',
};

export function LectureStatusBadge({ status }: { status: LectureStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
