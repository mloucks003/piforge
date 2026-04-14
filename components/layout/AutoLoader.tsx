'use client';

import { useEffect, useRef } from 'react';
import { loadFromLocalStorage } from '@/lib/serialization/serializer';
import { useProjectStore } from '@/stores/projectStore';

export default function AutoLoader() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const ok = loadFromLocalStorage();
    if (ok) {
      useProjectStore.getState().addConsoleEntry('system', 'Project restored from local storage.');
    }
  }, []);
  return null;
}
