'use client';

import AuthModal from './AuthModal';
import ProjectManager from '@/components/project/ProjectManager';
import FeedbackModal from '@/components/ui/FeedbackModal';

/** Renders global modals at the root level. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AuthModal />
      <ProjectManager />
      <FeedbackModal />
    </>
  );
}
