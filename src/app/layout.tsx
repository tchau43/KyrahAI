import type { Metadata } from 'next';
import { ThemeProviders } from '../components/provider/providers';
import '../styles/globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import { spectral, inter, inder } from '@/config/fonts';
import ModalProvider from '@/components/provider/ModalProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'KyrahAI',
  description: 'KyrahAI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spectral.variable} ${inter.variable} ${inder.variable} antialiased`}
      >
        {/* <div className="max-w-9xl mx-auto"> */}
        <AuthProvider>
          <ThemeProviders>
            <ConditionalNavbar />
            {children}
            <ConditionalFooter />
            <ModalProvider />
          </ThemeProviders>
        </AuthProvider>
        {/* </div> */}
      </body>
    </html>
  );
}
