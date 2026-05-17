/**
 * OWNER: P2 (Backend)
 * Demo-only "auth": teacher identity comes from a localStorage-backed header.
 * This is not password auth; it only isolates each teacher's own lectures in the MVP.
 */
import { DEMO_TEACHER_ID } from '../../../shared/types';

export function currentTeacherId(req?: Request): string {
  const fromHeader = sanitizeTeacherId(req?.headers.get('x-kursu-teacher-id'));
  if (fromHeader) return fromHeader;
  return process.env.KURSU_DEMO_TEACHER_ID ?? DEMO_TEACHER_ID;
}

export function sanitizeTeacherId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.length > 80) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}
