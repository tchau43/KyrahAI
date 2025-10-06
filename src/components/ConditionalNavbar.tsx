'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

const PATHS_WITHOUT_NAVBAR = [
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy',
  '/chat',
] as const;

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const hideNav = PATHS_WITHOUT_NAVBAR.some(path => pathname.startsWith(path));

  if (hideNav) return null;

  return <Navbar />;
}
