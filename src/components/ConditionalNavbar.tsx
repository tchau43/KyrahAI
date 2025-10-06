'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNav =
    pathname.startsWith('/terms-of-service') ||
    pathname.startsWith('/privacy-policy') ||
    pathname.startsWith('/cookie-policy') ||
    pathname.startsWith('/chat');

  if (hideNav) return null;

  return <Navbar />;
}
