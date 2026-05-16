/**
 * OWNER: P1 (Frontend)
 * Read/write the selected role to localStorage with cross-tab sync.
 */
import { useCallback, useEffect, useState } from 'react';

export type Role = 'teacher' | 'student';
const KEY = 'kursu:role';

export function useRole(): { role: Role; setRole: (r: Role) => void } {
  const [role, setRoleState] = useState<Role>(() => readRole());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY && e.newValue) setRoleState(e.newValue as Role);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setRole = useCallback((r: Role) => {
    window.localStorage.setItem(KEY, r);
    setRoleState(r);
  }, []);

  return { role, setRole };
}

function readRole(): Role {
  if (typeof window === 'undefined') return 'teacher';
  return (window.localStorage.getItem(KEY) as Role | null) ?? 'teacher';
}
