'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExitIcon } from './icons';
import MenuBar from '@/features/homepage/components/MenuBar';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      className="fixed top-0 z-[99] left-1/2 transform -translate-x-1/2 w-[87.5%] xl:w-[80%] 2xl:w-[70%] max-w-7xl mt-8
                 backdrop-blur-[30px] bg-[#FFFFFF3D] rounded-full"
    >
      <div className="px-8 py-3 xl:py-5">
        <div className="flex items-center justify-between">
          {/* Menu Button - Show on screens smaller than xl */}
          <div className="xl:hidden flex items-center gap-2">
            <button className="p-2 rounded-md text-neutral-9 hover:text-neutral-7 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg
                className={`size-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
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
            <span className="hidden md:block body-16-semi font-inter text-neutral-9">Menu</span>
          </div>

          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/kyrah-logo.svg"
                alt="Kyrah Logo"
                width={40}
                height={40}
                className="size-6 xl:size-8"
              />
              <span className="xl:text-3xl text-2xl font-inder text-neutral-9 font-normal">
                KYRAH.AI
              </span>
            </Link>
          </div>

          {/* Navigation Links - Show on xl and larger screens */}
          <div className="hidden xl:flex items-center gap-8">
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
            className="exitIcon flex items-center p-2 md:px-4 md:py-2 md:border rounded-full gap-3 text-neutral-9 hover:bg-neutral-9 hover:border-neutral-9 hover:text-neutral cursor-pointer"
          >
            <span className="hidden md:block body-16-semi font-inter text-base bold-16-semi">
              Safe Exit
            </span>
            <ExitIcon className='size-4' />
          </button>
        </div>
      </div>
      <MenuBar setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
    </nav>
  );
}
