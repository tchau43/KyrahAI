import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - KyrahAI',
  description: 'Privacy Policy for Kyrah.ai',
};

export default function PrivacyPolicyLayout({
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
