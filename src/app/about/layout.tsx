import type { Metadata } from 'next';
import NewsLetterSection from '@/components/homepage/NewsLetterSection';

export const metadata: Metadata = {
  title: 'About | KYRAH',
  description: 'About KYRAH',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
      <NewsLetterSection />
    </div>
  );
}
