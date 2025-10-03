import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - KyrahAI',
  description: 'Cookie Policy for Kyrah.ai',
};

export default function CookiePolicyLayout({
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
