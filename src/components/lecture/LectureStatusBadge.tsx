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

const VARIANT: Record<LectureStatus, 'secondary' | 'success' | 'outline'> = {
  draft: 'secondary',
  live: 'success',
  ended: 'outline',
};

export function LectureStatusBadge({ status }: { status: LectureStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
