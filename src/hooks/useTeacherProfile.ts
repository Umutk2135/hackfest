import { useCallback, useState } from 'react';
import {
  clearTeacherProfile,
  newTeacherId,
  readTeacherProfile,
  writeTeacherProfile,
  type TeacherProfile,
} from '@/lib/teacherProfile';

export function useTeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfile | null>(() => readTeacherProfile());

  const createLocalProfile = useCallback((name: string): TeacherProfile => {
    const next = { id: newTeacherId(), name: name.trim() };
    writeTeacherProfile(next);
    setProfile(next);
    return next;
  }, []);

  const saveProfile = useCallback((next: TeacherProfile) => {
    writeTeacherProfile(next);
    setProfile(next);
  }, []);

  const clearProfile = useCallback(() => {
    clearTeacherProfile();
    setProfile(null);
  }, []);

  return { profile, createLocalProfile, saveProfile, clearProfile };
}
