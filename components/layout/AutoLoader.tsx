'use client';

import { useEffect, useRef } from 'react';
import { loadFromLocalStorage, clearProjectState } from '@/lib/serialization/serializer';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { useProjectManagerStore } from '@/stores/projectManagerStore';

export default function AutoLoader() {
  const user        = useAuthStore((s) => s.user);
  const loadForUser = useProjectManagerStore((s) => s.loadForUser);
  const prevUserId  = useRef<string | null | undefined>(undefined); // undefined = first run

  useEffect(() => {
    const currentId = user?.id ?? null;

    // First mount
    if (prevUserId.current === undefined) {
      prevUserId.current = currentId;
      loadForUser(currentId);                        // load saved-projects list
      const ok = loadFromLocalStorage(currentId);   // restore canvas state
      if (ok) {
        useProjectStore.getState().addConsoleEntry('system', 'Project restored.');
      }
      return;
    }

    // Auth changed (sign-in, sign-out, account switch)
    if (prevUserId.current !== currentId) {
      prevUserId.current = currentId;
      clearProjectState();                           // wipe canvas — no cross-user leakage
      loadForUser(currentId);                        // load the new user's saved projects
      const ok = loadFromLocalStorage(currentId);   // load new user's canvas snapshot
      if (ok) {
        useProjectStore.getState().addConsoleEntry('system', 'Project restored.');
      }
    }
  }, [user, loadForUser]);

  return null;
}
