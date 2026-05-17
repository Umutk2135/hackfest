export interface TeacherProfile {
  id: string;
  name: string;
}

export const TEACHER_PROFILE_KEY = 'kursu:teacherProfile';

export function readTeacherProfile(): TeacherProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(TEACHER_PROFILE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TeacherProfile>;
    if (!parsed.id || !parsed.name) return null;
    return { id: parsed.id, name: parsed.name };
  } catch {
    return null;
  }
}

export function writeTeacherProfile(profile: TeacherProfile) {
  window.localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(profile));
}

export function clearTeacherProfile() {
  window.localStorage.removeItem(TEACHER_PROFILE_KEY);
}

export function newTeacherId(): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `teacher_${id.replace(/-/g, '')}`;
}

export function teacherHeaders(): Record<string, string> {
  const profile = readTeacherProfile();
  if (!profile) return {};
  return {
    'x-kursu-teacher-id': profile.id,
    'x-kursu-teacher-name': profile.name,
  };
}
