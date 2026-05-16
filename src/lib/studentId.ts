/**
 * OWNER: P1 (Frontend)
 * Generates + caches a per-browser studentId in localStorage.
 */
const KEY = 'kursu:studentId';

export function getOrCreateStudentId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const existing = window.localStorage.getItem(KEY);
  if (existing) return existing;
  const id = (crypto.randomUUID?.() ?? `s_${Math.random().toString(36).slice(2, 10)}`);
  window.localStorage.setItem(KEY, id);
  return id;
}
