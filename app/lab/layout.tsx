import type { Metadata } from 'next';

// The lab is a private app — tell search engines not to index it.
// This prevents the sign-up wall from being indexed and keeps Google
// ranking the marketing homepage instead.
export const metadata: Metadata = {
  title: 'Lab — PiForge',
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
