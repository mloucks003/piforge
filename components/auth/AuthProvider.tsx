'use client';

import AuthModal from './AuthModal';
import ProjectManager from '@/components/project/ProjectManager';

/** Renders global modals at the root level. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AuthModal />
      <ProjectManager />
    </>
  );
}
