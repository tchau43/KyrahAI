import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - KyrahAI',
  description: 'Terms of Service for Kyrah.ai',
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
