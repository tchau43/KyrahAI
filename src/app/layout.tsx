import type { Metadata } from 'next';
import { ThemeProviders } from '../components/provider/providers';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { spectral, inter, inder } from '@/config/fonts';
import { headers } from 'next/headers';
import ModalProvider from '@/components/provider/ModalProvider';

export const metadata: Metadata = {
  title: 'KyrahAI',
  description: 'KyrahAI',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const hideNav =
    pathname.startsWith('/terms-of-service') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/cookie-policy');

  const hideLayout = pathname.startsWith('/chat');

  return (
    <html lang="en">
      <body
        className={`${spectral.variable} ${inter.variable} ${inder.variable} antialiased`}
      >
        <ThemeProviders>
          {!hideLayout && !hideNav && <Navbar />}
          {children}
          {!hideLayout && <Footer />}
          <ModalProvider />
        </ThemeProviders>
      </body>
    </html>
  );
}
