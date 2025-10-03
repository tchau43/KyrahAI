'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExitIcon } from './icons';

interface NavItem {
  href: string;
  label: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

const navigationItems: NavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/safety-tips', label: 'Safety Tips' },
  { href: '/resource', label: 'Resource' },
  { href: '/blog', label: 'Blog', disabled: true, comingSoon: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);

    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  const isActivePath = (href: string): boolean => {
    if (href === '/#how-it-works') {
      return pathname === '/' && currentHash === '#how-it-works';
    }
    return pathname === href;
  };

  const getNavLinkClassName = (item: NavItem): string => {
    const baseClasses = 'font-inter transition-colors body-16-semi relative';

    if (item.disabled) {
      return `${baseClasses} text-secondary-2 cursor-not-allowed`;
    }

    return `${baseClasses} text-neutral-9`;
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = isActivePath(item.href);
    const linkContent = (
      <>
        {item.label}
        {isActive && (
          <span className="absolute -bottom-1 left-0 w-[80%] h-0.5 bg-neutral-9 rounded-full" />
        )}
      </>
    );

    if (item.comingSoon) {
      return (
        <div key={item.href} className="relative">
          <Link
            href={item.href}
            className={getNavLinkClassName(item)}
            onClick={e => e.preventDefault()}
          >
            {linkContent}
          </Link>
          <span className="absolute -top-4 -right-7 bg-secondary-3 text-xs px-2 rounded-full text-black font-inter caption-14-semi">
            Soon
          </span>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={getNavLinkClassName(item)}
      >
        {linkContent}
      </Link>
    );
  };

  return (
    <nav
      className="fixed top-0 z-99 left-1/2 transform -translate-x-1/2 w-[66.666667%] mx-auto mt-8
                 backdrop-blur-[30px] bg-[#FFFFFF3D] rounded-full"
    >
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/kyrah-logo.svg"
                alt="Kyrah Logo"
                width={40}
                height={40}
              />
              <span className="text-3xl font-inder text-gray-800 font-normal">
                KYRAH.AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map(renderNavItem)}
          </div>

          {/* Safe Exit Button */}
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              document.cookie.split(';').forEach(c => {
                document.cookie = c
                  .replace(/^ +/, '')
                  .replace(
                    /=.*/,
                    '=;expires=' + new Date().toUTCString() + ';path=/'
                  );
              });
              window.location.replace('https://www.google.com');
              window.close();
            }}
            className="flex items-center px-6 py-2 border rounded-full gap-3 hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-neutral-9 body-16-semi font-inter text-base transition-colors bold-16-semi">
              Safe Exit
            </span>
            <ExitIcon />
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
