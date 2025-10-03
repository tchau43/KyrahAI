import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Tips | KYRAH',
  description: 'Safety Tips',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
