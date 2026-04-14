'use client';

import AuthModal from './AuthModal';

/** Renders the global AuthModal at the root level. */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
