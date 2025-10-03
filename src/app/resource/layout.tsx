import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources & Hotlines | KYRAH',
  description: 'Resources & Hotlines',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-neutral md:px-80 px-60">{children}</div>;
}
