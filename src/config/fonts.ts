import { Spectral, Inter, Inder } from 'next/font/google';
import localFont from 'next/font/local';

export const spectral = Spectral({
  weight: '400',
  variable: '--font-spectral',
  subsets: ['latin'],
});

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const inder = Inder({
  weight: '400',
  variable: '--font-inder',
  subsets: ['latin'],
});

export const poppinsRounded = localFont({
  src: [
    {
      path: './PoppinsRounded-Rounded.ttf',
      weight: '400',
    },
  ],
  variable: '--font-poppins-rounded',
});
